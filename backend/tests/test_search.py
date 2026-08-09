import pytest
from fastapi.testclient import TestClient
import sys
import os
from unittest.mock import patch, AsyncMock

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

client = TestClient(app)

# Sample Mock GDS payload for testing
MOCK_GDS_DATA = {
    "status": "success",
    "trips": [
        {
            "trip_id": "TRP-001",
            "operator": "Express Lines",
            "bus_type": "2+1 AC Sleeper",
            "bus_type_name": "2+1 AC Sleeper",
            "bus_seat_type": "Sleeper",
            "is_ac": True,
            "amenities": ["AC", "WiFi"],
            "from_city_name": "Bangalore",
            "to_city_name": "Mumbai",
            "route_name": "Bangalore To Mumbai",
            "schedule": {
                "departure_time": "4:00 PM",
                "arrival_time": "11:00 AM",
                "departure_date": "2026-08-09",
                "estimated_arrival_date": "2026-08-10",
                "duration_minutes": 1140
            },
            "pricing": {"base_fare": 2000, "service_tax": 0, "surcharges": 0, "total_fare": 2000, "currency": "INR"},
            "availability": {"seats_available": 10, "is_available": True},
            "boarding_points": [{"name": "Majestic", "time": "3:00 PM"}],
            "dropping_points": [{"name": "Dadar", "time": "11:00 AM"}]
        },
        {
            "trip_id": "TRP-002",
            "operator": "Desert Travels",
            "bus_type": "NON A/C SLEEPER",
            "bus_type_name": "NON A/C SLEEPER",
            "bus_seat_type": "Sleeper",
            "is_ac": False,
            "amenities": ["Blanket"],
            "from_city_name": "Bangalore",
            "to_city_name": "Mumbai",
            "route_name": "Bangalore To Jaisalmer",  # ← Intentional misleading route_name in assignment JSON
            "schedule": {
                "departure_time": "6:00 PM",
                "arrival_time": "1:00 PM",
                "departure_date": "2026-08-09",
                "estimated_arrival_date": "2026-08-10",
                "duration_minutes": 1140
            },
            "pricing": {"base_fare": 500, "service_tax": 0, "surcharges": 0, "total_fare": 500, "currency": "INR"},
            "availability": {"seats_available": 15, "is_available": True},
            "boarding_points": [],
            "dropping_points": []
        },
        {
            "trip_id": "TRP-003",
            "operator": "Unavail Travels",
            "bus_type": "AC Seater",
            "bus_type_name": "AC Seater",
            "bus_seat_type": "Seater",
            "is_ac": True,
            "amenities": [],
            "from_city_name": "Bangalore",
            "to_city_name": "Mumbai",
            "route_name": "Bangalore To Mumbai",
            "schedule": {
                "departure_time": "8:00 PM",
                "arrival_time": "10:00 AM",
                "departure_date": "2026-08-09",
                "estimated_arrival_date": "2026-08-10",
                "duration_minutes": 840
            },
            "pricing": {"base_fare": 1500, "service_tax": 0, "surcharges": 0, "total_fare": 1500, "currency": "INR"},
            "availability": {"seats_available": 0, "is_available": False},  # ← Unavailable
            "boarding_points": [],
            "dropping_points": []
        }
    ]
}


def get_mock_async_client():
    mock_instance = AsyncMock()
    mock_instance.get.return_value = AsyncMock(
        raise_for_status=lambda: None,
        json=lambda: MOCK_GDS_DATA
    )
    return mock_instance


# ── TEST 1: Bangalore -> Mumbai (Valid match) ─────────────────────────────────
def test_search_bangalore_to_mumbai():
    with patch("httpx.AsyncClient") as mock_client:
        mock_client.return_value.__aenter__.return_value = get_mock_async_client()

        res = client.get(
            "/api/buses/search",
            params={"source": "Bangalore", "destination": "Mumbai", "journey_date": "2026-08-09"}
        )

    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["total"] == 2  # TRP-001 and TRP-002 (TRP-003 is excluded as is_available=False)
    trip_ids = [t["trip_id"] for t in data["trips"]]
    assert "TRP-001" in trip_ids
    assert "TRP-002" in trip_ids


# ── TEST 2: Bangalore -> Delhi (No matching trips) ────────────────────────────
def test_search_bangalore_to_delhi_no_results():
    with patch("httpx.AsyncClient") as mock_client:
        mock_client.return_value.__aenter__.return_value = get_mock_async_client()

        res = client.get(
            "/api/buses/search",
            params={"source": "Bangalore", "destination": "Delhi", "journey_date": "2026-08-09"}
        )

    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 0
    assert data["trips"] == []


# ── TEST 3: Missing Source Parameter ──────────────────────────────────────────
def test_search_missing_source():
    res = client.get(
        "/api/buses/search",
        params={"destination": "Mumbai", "journey_date": "2026-08-09"}
    )
    assert res.status_code == 422  # FastAPI validation error


# ── TEST 4: Missing Destination Parameter ─────────────────────────────────────
def test_search_missing_destination():
    res = client.get(
        "/api/buses/search",
        params={"source": "Bangalore", "journey_date": "2026-08-09"}
    )
    assert res.status_code == 422  # FastAPI validation error


# ── TEST 5: Same Source and Destination ────────────────────────────────────────
def test_search_same_source_and_destination():
    res = client.get(
        "/api/buses/search",
        params={"source": "Mumbai", "destination": "Mumbai", "journey_date": "2026-08-09"}
    )
    assert res.status_code == 400
    assert "same" in res.json()["detail"].lower()


# ── TEST 6: Misleading route_name must NOT prevent matching ──────────────────
def test_misleading_route_name_handling():
    """
    TRP-002 has route_name = 'Bangalore To Jaisalmer', but
    from_city_name = 'Bangalore' and to_city_name = 'Mumbai'.
    Must be included in search results for Bangalore -> Mumbai.
    """
    with patch("httpx.AsyncClient") as mock_client:
        mock_client.return_value.__aenter__.return_value = get_mock_async_client()

        res = client.get(
            "/api/buses/search",
            params={"source": "Bangalore", "destination": "Mumbai", "journey_date": "2026-08-09"}
        )

    data = res.json()
    jaisalmer_trip = next((t for t in data["trips"] if t["trip_id"] == "TRP-002"), None)
    assert jaisalmer_trip is not None
    assert jaisalmer_trip["from_city"] == "Bangalore"
    assert jaisalmer_trip["to_city"] == "Mumbai"


# ── TEST 7: AC Filter ─────────────────────────────────────────────────────────
def test_ac_filter():
    with patch("httpx.AsyncClient") as mock_client:
        mock_client.return_value.__aenter__.return_value = get_mock_async_client()

        res = client.get(
            "/api/buses/search",
            params={
                "source": "Bangalore",
                "destination": "Mumbai",
                "journey_date": "2026-08-09",
                "filter_ac": "ac"
            }
        )

    data = res.json()
    assert data["total"] == 1
    assert data["trips"][0]["trip_id"] == "TRP-001"
    assert data["trips"][0]["is_ac"] is True


# ── TEST 8: Price Sorting ─────────────────────────────────────────────────────
def test_price_sorting():
    with patch("httpx.AsyncClient") as mock_client:
        mock_client.return_value.__aenter__.return_value = get_mock_async_client()

        res = client.get(
            "/api/buses/search",
            params={
                "source": "Bangalore",
                "destination": "Mumbai",
                "journey_date": "2026-08-09",
                "sort_by": "price"
            }
        )

    data = res.json()
    fares = [t["pricing"]["total_fare"] for t in data["trips"]]
    assert fares == sorted(fares)
    assert fares == [500, 2000]
