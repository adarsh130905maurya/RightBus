# 🚌 RightBus — Full-Stack Bus Search Module

A production-ready full-stack bus search module built for **RightBus Technologies Private Limited** (Intern Assignment).

---

## 🎯 Architecture & Data Flow

```
[Next.js Frontend]  ──(HTTP GET)──>  [RightBus Backend API :8000]  ──(Async HTTP)──>  [Mock GDS API :8001]
   (Port 3000)                           (FastAPI)                                     (FastAPI)
```

1. **Frontend (Next.js):** User enters `source`, `destination`, and `journey_date`. Sends request to the RightBus Backend API.
2. **Backend API (FastAPI):** Validates query parameters, calls the Mock GDS API, filters out non-matching cities/dates, excludes unavailable trips, applies user filters/sorting, and returns clean RightBus responses.
3. **Mock GDS API (FastAPI):** Simulates an external Global Distribution System (GDS) provider returning hardcoded trip JSON payloads.

---

## 🚀 Tech Stack

- **Mock GDS API:** Python 3.11, FastAPI, Uvicorn
- **Backend API:** Python 3.11, FastAPI, Httpx (Async HTTP Client), Pytest
- **Frontend:** Next.js 14, React 18, CSS Modules (Pure Vanilla CSS)

---

## ⚡ Quick Start Guide

### Prerequisites
- **Python:** 3.11+
- **Node.js:** v18+ and npm

---

### Step 1: Start Mock GDS API (Port 8001)
```bash
cd mock-gds
pip install -r requirements.txt
python -m uvicorn main:app --port 8001 --reload
```
*Health Check:* `http://localhost:8001/health`  
*GDS Search:* `http://localhost:8001/mock-gds/search?source=Bangalore&destination=Mumbai&journey_date=2026-08-09`

---

### Step 2: Start RightBus Backend API (Port 8000)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --port 8000 --reload
```
*Health Check:* `http://localhost:8000/health`  
*Backend Search:* `http://localhost:8000/api/buses/search?source=Bangalore&destination=Mumbai&journey_date=2026-08-09`

---

### Step 3: Start Next.js Frontend (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 🔍 Key Implementation & Data Processing Details

### 1. Inconsistent `route_name` Handling (Crucial)
The assignment dataset intentionally contains inconsistent `route_name` fields. For example, some trips have:
- `from_city_name`: `"Bangalore"`
- `to_city_name`: `"Mumbai"`
- `route_name`: `"Bangalore To Jaisalmer"`

**Solution:** The RightBus backend strictly evaluates matching trips using structured `from_city_name` and `to_city_name` fields (case-insensitive) along with `schedule.departure_date`. `route_name` is completely ignored for route matching logic.

### 2. Required Filtering & Business Rules
- **Validation:** Source and destination must be non-empty and cannot be identical.
- **Availability:** Only trips with `availability.is_available = true` are included.
- **Optional Filters:** Support for `filter_ac` (`ac` / `non-ac`) and `filter_type` (`sleeper` / `seater`).
- **Sorting:** Support for `sort_by` (`price` low-to-high and `departure` earliest first).

### 3. Frontend Features & UI States Implemented
- **5 Complete UI States:** Initial, Loading (`"Finding the right choices for you..."`), Success, Empty/No-results, and API Error (with retry button).
- **Official Brand Design:** Customized with official RightBus logo, color palette (`#1A2B4C` navy & `#00E5FF` cyan), and glassmorphism header.
- **Popular Route Quick-Select Pills:** Instant one-click search for routes like `Bangalore → Mumbai`, `Bangalore → Pune`, `Mumbai → Goa`, `Bangalore → Hyderabad`.
- **City Autocomplete:** Native datalist suggestions for source and destination city inputs.
- **Bus Details Modal:** Interactive modal displaying Boarding Points, Dropping Points, Cancellation Policy, Pricing Breakdown, and a **Visual Interactive Seat Map Preview Grid**.

---

## 🧪 Testing

### Backend Automated Test Suite (Pytest)
Run the 8 test cases covering all edge cases:

```bash
python -m pytest backend/tests/test_search.py -v
```

#### Included Test Cases:
1. `test_search_bangalore_to_mumbai` — Valid matching route.
2. `test_search_bangalore_to_delhi_no_results` — Valid query with 0 matching trips.
3. `test_search_missing_source` — 422 HTTP validation error on missing source.
4. `test_search_missing_destination` — 422 HTTP validation error on missing destination.
5. `test_search_same_source_and_destination` — 400 HTTP error when source == destination.
6. `test_misleading_route_name_handling` — Verifies trip with `route_name = "Bangalore To Jaisalmer"` is correctly included for Bangalore → Mumbai search.
7. `test_ac_filter` — AC / Non-AC filter verification.
8. `test_price_sorting` — Verifies price low-to-high sorting accuracy.

---

## 📁 Repository Structure

```
RightBus/
├── mock-gds/
│   ├── main.py             # Mock GDS FastAPI application
│   ├── data.py             # Raw hardcoded GDS trip JSON dataset
│   └── requirements.txt
├── backend/
│   ├── main.py             # RightBus Backend FastAPI application
│   ├── requirements.txt
│   └── tests/
│       └── test_search.py  # 8 Pytest backend test cases
├── frontend/
│   ├── package.json
│   ├── public/
│   │   └── logo.png        # Official RightBus brand logo
│   ├── src/
│   │   ├── pages/          # Next.js pages (_app.js, index.js)
│   │   ├── components/     # SearchForm, FilterBar, BusCard, BusDetails
│   │   └── styles/         # Vanilla CSS modules
└── README.md
```

---

## 👤 Author
**Adarsh Maurya**  
*Computer Engineering Student | TCET Mumbai*  
GitHub: [@adarsh130905maurya](https://github.com/adarsh130905maurya)
