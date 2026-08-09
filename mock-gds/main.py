from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from data import RAW_GDS_RESPONSE

app = FastAPI(
    title="RightBus Mock GDS API",
    description="Simulates external GDS bus data provider returning raw trip data."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/mock-gds/search")
def mock_gds_search(
    source: str = Query(..., description="Source city name"),
    destination: str = Query(..., description="Destination city name"),
    journey_date: str = Query(..., description="Journey date (YYYY-MM-DD)")
):
    """
    Returns hardcoded raw trip data from GDS provider.
    Note: Real GDS APIs return raw unfiltered trips; the RightBus backend
    is responsible for filtering matching routes, dates, and availability.
    """
    return {
        "status": RAW_GDS_RESPONSE.get("status", "success"),
        "trips": RAW_GDS_RESPONSE.get("trips", []),
        "search_mode": RAW_GDS_RESPONSE.get("search_mode", "coordinates"),
        "search_meta": RAW_GDS_RESPONSE.get("search_meta", {})
    }


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Mock GDS API"}
