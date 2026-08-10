import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
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

  const handleScrollToSearch = () => {
    const el = document.getElementById('search-form-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Head>
        <title>RightBus — Online Bus Ticket Booking in India | Intercity Travel</title>
        <meta name="description" content="RightBus is India's next-generation intercity bus booking platform. Search routes, compare fares, pick seats, and book bus tickets online." />
        <link rel="icon" href="/logo.png" />
      </Head>

      <div className={styles.pageWrapper}>
        {/* Navigation Bar matching rightbus.in */}
        <nav className={styles.navbar}>
          <div className={styles.logoContainer}>
            <Image
              src="/logo.png"
              alt="RightBus Logo"
              width={160}
              height={50}
              priority
              className={styles.logoImg}
            />
          </div>
          <div className={styles.navRight}>
            <div className={styles.navLinks}>
              <span className={styles.navLink} onClick={handleScrollToSearch}>Features</span>
              <span className={styles.navLink} onClick={handleScrollToSearch}>About</span>
              <span className={styles.navLink} onClick={handleScrollToSearch}>Contact</span>
            </div>
            <button className={styles.joinBtn} onClick={handleScrollToSearch}>Search Routes</button>
          </div>
        </nav>

        {/* Hero Banner matching rightbus.in */}
        <section className={styles.heroSection}>
          <div className={styles.bgDecoration1}></div>
          <div className={styles.bgDecoration2}></div>

          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Book Your Journey <br />
              <span className={styles.heroGradient}>The Right Way</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Reimagining intercity travel with a smarter, faster, and seamless bus booking experience.
            </p>
          </div>

          <div className={styles.searchCardWrapper}>
            <SearchForm
              onSearch={handleSearchSubmit}
              initialValues={searchParams}
            />
          </div>
        </section>

        {/* Main Content Area */}
        <main className={styles.mainContent}>
          {/* UI STATE 1: INITIAL */}
          {uiState === 'initial' && (
            <div className={styles.stateCard}>
              <div className={styles.stateIcon}>🚌</div>
              <h3>Search Intercity Buses</h3>
              <p>Enter your origin, destination, and travel date above to view real-time available buses.</p>
            </div>
          )}

          {/* UI STATE 2: LOADING */}
          {uiState === 'loading' && (
            <div className={styles.stateCard}>
              <div className={styles.spinner}></div>
              <h3>Finding the right choices for you...</h3>
              <p>Searching live bus routes, seat availability, and best prices for your trip.</p>
            </div>
          )}

          {/* UI STATE 3: API ERROR */}
          {uiState === 'error' && (
            <div className={`${styles.stateCard} ${styles.errorCard}`}>
              <div className={styles.stateIcon}>⚠️</div>
              <h3>Unable to load bus results</h3>
              <p className={styles.errorText}>
                {errorMessage.includes('Failed to connect')
                  ? 'Unable to connect to bus search service. Please ensure backend server (Port 8000) is running.'
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
              <div className={styles.stateCard}>
                <div className={styles.stateIcon}>🔍</div>
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

              <div className={styles.resultsGrid}>
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

        {/* Footer matching rightbus.in */}
        <footer className={styles.footer}>
          <div className={styles.footerBrand}>
            <h3>RightBus</h3>
            <p>Making bus travel simple, convenient, and reliable for millions of Indians.</p>
          </div>
          <div className={styles.footerBottom}>
            © 2026 RightBus Technologies Private Limited. All rights reserved. <br />
            <span>CIN: U74909KA2026PTC218775</span>
          </div>
        </footer>
      </div>
    </>
  );
}
