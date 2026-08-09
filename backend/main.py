from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
from typing import Optional, List, Dict, Any
from datetime import datetime

app = FastAPI(
    title="RightBus Backend API",
    description="Processes and filters bus search requests from Mock GDS API."
)

MOCK_GDS_URL = "http://localhost:8001"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def format_duration(minutes: Optional[int]) -> str:
    """Formats minutes into human-readable format like '18h 30m'."""
    if minutes is None:
        return "N/A"
    hours = minutes // 60
    mins = minutes % 60
    if hours > 0 and mins > 0:
        return f"{hours}h {mins}m"
    elif hours > 0:
        return f"{hours}h"
    else:
        return f"{mins}m"


def parse_departure_time(time_str: str) -> datetime:
    """Parses departure time string (e.g. '4:00 PM') for accurate sorting."""
    try:
        return datetime.strptime(time_str.strip(), "%I:%M %p")
    except Exception:
        return datetime.max


@app.get("/api/buses/search")
async def search_buses(
    source: str = Query(..., description="Source city name"),
    destination: str = Query(..., description="Destination city name"),
    journey_date: str = Query(..., description="Journey date YYYY-MM-DD"),
    filter_ac: Optional[str] = Query(None, description="Filter: ac or non-ac"),
    filter_type: Optional[str] = Query(None, description="Filter: sleeper or seater"),
    sort_by: Optional[str] = Query(None, description="Sort by: price or departure")
):
    # ── 1. VALIDATION ────────────────────────────────────────────────────────
    source_clean = source.strip() if source else ""
    destination_clean = destination.strip() if destination else ""
    journey_date_clean = journey_date.strip() if journey_date else ""

    if not source_clean:
        raise HTTPException(status_code=400, detail="Source city is required.")
    
    if not destination_clean:
        raise HTTPException(status_code=400, detail="Destination city is required.")
    
    if not journey_date_clean:
        raise HTTPException(status_code=400, detail="Journey date is required.")

    if source_clean.lower() == destination_clean.lower():
        raise HTTPException(
            status_code=400,
            detail="Source and destination cannot be the same city."
        )

    # ── 2. CALL MOCK GDS API ──────────────────────────────────────────────────
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                f"{MOCK_GDS_URL}/mock-gds/search",
                params={
                    "source": source_clean,
                    "destination": destination_clean,
                    "journey_date": journey_date_clean
                },
                timeout=10.0
            )
            res.raise_for_status()
            gds_data = res.json()
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Mock GDS service is currently unavailable.")
    except httpx.HTTPStatusError as err:
        raise HTTPException(status_code=502, detail=f"GDS service error: {err.response.status_code}")

    all_trips = gds_data.get("trips", [])

    # ── 3. FILTER TRIPS ACCORDING TO BUSINESS RULES ──────────────────────────
    # CRITICAL: Match from_city_name and to_city_name (NOT route_name as route_name can be misleading)
    matching_trips = []
    for trip in all_trips:
        from_city = (trip.get("from_city_name") or "").strip().lower()
        to_city = (trip.get("to_city_name") or "").strip().lower()
        dep_date = trip.get("schedule", {}).get("departure_date", "").strip()
        is_avail = trip.get("availability", {}).get("is_available", False)

        # Match city names (case-insensitive)
        if from_city != source_clean.lower() or to_city != destination_clean.lower():
            continue

        # Match journey date
        if dep_date != journey_date_clean:
            continue

        # Exclude unavailable trips
        if not is_avail:
            continue

        matching_trips.append(trip)

    # ── 4. APPLY OPTIONAL FILTERS ──────────────────────────────────────────────
    if filter_ac:
        f_ac = filter_ac.strip().lower()
        if f_ac == "ac":
            matching_trips = [t for t in matching_trips if t.get("is_ac") is True]
        elif f_ac == "non-ac":
            matching_trips = [t for t in matching_trips if t.get("is_ac") is False]

    if filter_type:
        f_type = filter_type.strip().lower()
        if f_type == "sleeper":
            matching_trips = [
                t for t in matching_trips
                if "sleeper" in (t.get("bus_seat_type") or "").lower() or
                "sleeper" in (t.get("bus_type") or "").lower() or
                "sleeper" in (t.get("bus_type_name") or "").lower()
            ]
        elif f_type == "seater":
            matching_trips = [
                t for t in matching_trips
                if "seater" in (t.get("bus_seat_type") or "").lower() or
                "seater" in (t.get("bus_type") or "").lower() or
                "seater" in (t.get("bus_type_name") or "").lower()
            ]

    # ── 5. SORTING ─────────────────────────────────────────────────────────────
    if sort_by == "price":
        matching_trips.sort(key=lambda t: t.get("pricing", {}).get("total_fare", 0))
    elif sort_by == "departure":
        matching_trips.sort(key=lambda t: parse_departure_time(
            t.get("schedule", {}).get("departure_time", "11:59 PM")
        ))

    # ── 6. CONSTRUCT CLEAN RIGHTBUS RESPONSE ──────────────────────────────────
    clean_trips = []
    for trip in matching_trips:
        sched = trip.get("schedule", {})
        price = trip.get("pricing", {})
        avail = trip.get("availability", {})
        
        clean_trip = {
            "trip_id": trip.get("trip_id"),
            "operator": trip.get("operator"),
            "bus_type": trip.get("bus_type_name") or trip.get("bus_type"),
            "bus_seat_type": trip.get("bus_seat_type"),
            "is_ac": trip.get("is_ac", False),
            "amenities": trip.get("amenities", []),
            "from_city": trip.get("from_city_name"),
            "to_city": trip.get("to_city_name"),
            "schedule": {
                "departure_time": sched.get("departure_time"),
                "arrival_time": sched.get("arrival_time"),
                "departure_date": sched.get("departure_date"),
                "estimated_arrival_date": sched.get("estimated_arrival_date"),
                "duration_minutes": sched.get("duration_minutes"),
                "duration_formatted": format_duration(sched.get("duration_minutes"))
            },
            "pricing": {
                "base_fare": price.get("base_fare"),
                "service_tax": price.get("service_tax", 0),
                "surcharges": price.get("surcharges", 0),
                "total_fare": price.get("total_fare"),
                "currency": price.get("currency", "INR")
            },
            "availability": {
                "seats_available": avail.get("seats_available", 0),
                "is_available": avail.get("is_available", False)
            },
            "boarding_points": trip.get("boarding_points", []),
            "dropping_points": trip.get("dropping_points", []),
            "proximity_info": trip.get("proximity_info", {}),
            "cancellation_policy": trip.get("cancellation_policy", {}),
            "booking_token": trip.get("booking_token")
        }
        clean_trips.append(clean_trip)

    return {
        "status": "success",
        "total": len(clean_trips),
        "search_query": {
            "source": source_clean,
            "destination": destination_clean,
            "journey_date": journey_date_clean,
            "filter_ac": filter_ac,
            "filter_type": filter_type,
            "sort_by": sort_by
        },
        "trips": clean_trips
    }


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "RightBus Backend API"}
