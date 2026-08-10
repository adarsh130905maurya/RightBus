import { useState } from 'react';
import Head from 'next/head';
import SearchForm from '@/components/SearchForm';
import FilterBar from '@/components/FilterBar';
import BusCard from '@/components/BusCard';
import BusDetails from '@/components/BusDetails';
import styles from '@/styles/Home.module.css';

const BACKEND_URL = 'http://localhost:8000';

export default function Home() {
  const [searchParams, setSearchParams] = useState({
    source: 'Bangalore',
    destination: 'Mumbai',
    journeyDate: '2026-08-09'
  });

  const [filters, setFilters] = useState({
    filterAc: '',
    filterType: '',
    sortBy: ''
  });

  const [uiState, setUiState] = useState('initial'); // 'initial' | 'loading' | 'success' | 'empty' | 'error'
  const [trips, setTrips] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedBus, setSelectedBus] = useState(null);

  const fetchBuses = async (source, destination, journeyDate, currentFilters = filters) => {
    setUiState('loading');
    setErrorMessage('');
    setTrips([]);

    try {
      const query = new URLSearchParams({
        source,
        destination,
        journey_date: journeyDate
      });

      if (currentFilters.filterAc) query.append('filter_ac', currentFilters.filterAc);
      if (currentFilters.filterType) query.append('filter_type', currentFilters.filterType);
      if (currentFilters.sortBy) query.append('sort_by', currentFilters.sortBy);

      const response = await fetch(`${BACKEND_URL}/api/buses/search?${query.toString()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error (${response.status})`);
      }

      const data = await response.json();
      const results = data.trips || [];

      setTrips(results);
      if (results.length === 0) {
        setUiState('empty');
      } else {
        setUiState('success');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to connect to RightBus backend server.');
      setUiState('error');
    }
  };

  const handleSearchSubmit = (source, destination, journeyDate) => {
    setSearchParams({ source, destination, journeyDate });
    fetchBuses(source, destination, journeyDate, filters);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    if (uiState !== 'initial') {
      fetchBuses(searchParams.source, searchParams.destination, searchParams.journeyDate, newFilters);
    }
  };

  return (
    <>
      <Head>
        <title>RightBus — Intercity Bus Search</title>
        <meta name="description" content="Search & book intercity bus tickets online with RightBus." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.pageContainer}>
        {/* Navbar */}
        <header className={styles.navbar}>
          <div className={styles.navBrand}>
            <span className={styles.logoBadge}>RB</span>
            <span className={styles.logoText}>RightBus</span>
          </div>
          <span className={styles.navTagline}>Smart Intercity Booking</span>
        </header>

        {/* Hero & Search Banner */}
        <section className={styles.heroSection}>
          <h1 className={styles.heroTitle}>
            Book Your Journey <span className={styles.heroGradient}>The Right Way</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Fast, transparent, and seamless intercity bus ticket booking across India.
          </p>

          <SearchForm
            onSearch={handleSearchSubmit}
            initialValues={searchParams}
          />
        </section>

        {/* Main Content Area handling UI States */}
        <main className={styles.mainContent}>
          {/* UI STATE 1: INITIAL */}
          {uiState === 'initial' && (
            <div className={styles.stateContainer}>
              <div className={styles.stateIcon}>🔍</div>
              <h3>Search Intercity Buses</h3>
              <p>Select your source city, destination, and journey date above to find available buses.</p>
            </div>
          )}

          {/* UI STATE 2: LOADING */}
          {uiState === 'loading' && (
            <div className={styles.stateContainer}>
              <div className={styles.spinner}></div>
              <h3>Finding the right choices for you...</h3>
              <p>Searching live bus routes, seat availability, and best prices for your trip.</p>
            </div>
          )}

          {/* UI STATE 3: API ERROR */}
          {uiState === 'error' && (
            <div className={`${styles.stateContainer} ${styles.errorContainer}`}>
              <div className={styles.stateIcon}>⚠️</div>
              <h3>Unable to load bus results</h3>
              <p className={styles.errorText}>
                {errorMessage.includes('Failed to connect')
                  ? 'Unable to connect to search service. Please make sure the backend is running and try again.'
                  : errorMessage}
              </p>
              <button
                className={styles.retryBtn}
                onClick={() => fetchBuses(searchParams.source, searchParams.destination, searchParams.journeyDate)}
              >
                Retry Search
              </button>
            </div>
          )}

          {/* UI STATE 4: NO RESULTS (EMPTY) */}
          {uiState === 'empty' && (
            <div>
              <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                totalResults={0}
              />
              <div className={styles.stateContainer}>
                <div className={styles.stateIcon}>🚌</div>
                <h3>No buses found for this route</h3>
                <p>
                  No available buses matched your criteria for{' '}
                  <strong>{searchParams.source}</strong> → <strong>{searchParams.destination}</strong> on{' '}
                  <strong>{searchParams.journeyDate}</strong>.
                </p>
                <p className={styles.tipText}>Try changing the journey date or resetting filters.</p>
              </div>
            </div>
          )}

          {/* UI STATE 5: SUCCESSFUL RESULTS */}
          {uiState === 'success' && (
            <div>
              <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                totalResults={trips.length}
              />

              <div className={styles.resultsList}>
                {trips.map((bus) => (
                  <BusCard
                    key={bus.trip_id}
                    bus={bus}
                    onViewDetails={(selected) => setSelectedBus(selected)}
                  />
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Bus Details Modal */}
        {selectedBus && (
          <BusDetails
            bus={selectedBus}
            onClose={() => setSelectedBus(null)}
          />
        )}

        {/* Footer */}
        <footer className={styles.footer}>
          © 2026 RightBus Technologies Private Limited. All rights reserved.
        </footer>
      </div>
    </>
  );
}
