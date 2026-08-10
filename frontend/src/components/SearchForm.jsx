import { useState } from 'react';
import styles from '@/styles/SearchForm.module.css';

const POPULAR_ROUTES = [
  { from: 'Bangalore', to: 'Mumbai', label: 'Bangalore → Mumbai' },
  { from: 'Bangalore', to: 'Pune', label: 'Bangalore → Pune' },
  { from: 'Mumbai', to: 'Goa', label: 'Mumbai → Goa' },
  { from: 'Bangalore', to: 'Hyderabad', label: 'Bangalore → Hyderabad' }
];

const CITIES = ['Bangalore', 'Mumbai', 'Pune', 'Hyderabad', 'Chennai', 'Goa', 'Delhi'];

export default function SearchForm({ onSearch, initialValues }) {
  const [source, setSource] = useState(initialValues?.source || 'Bangalore');
  const [destination, setDestination] = useState(initialValues?.destination || 'Mumbai');
  const [journeyDate, setJourneyDate] = useState(initialValues?.journeyDate || '2026-08-09');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setValidationError('');

    const srcClean = source.trim();
    const destClean = destination.trim();

    if (!srcClean) {
      setValidationError('Please enter a source city.');
      return;
    }
    if (!destClean) {
      setValidationError('Please enter a destination city.');
      return;
    }
    if (!journeyDate) {
      setValidationError('Please select a journey date.');
      return;
    }
    if (srcClean.toLowerCase() === destClean.toLowerCase()) {
      setValidationError('Source and destination cities cannot be the same.');
      return;
    }

    onSearch(srcClean, destClean, journeyDate);
  };

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const handleSelectRoute = (from, to) => {
    setSource(from);
    setDestination(to);
    onSearch(from, to, journeyDate);
  };

  return (
    <div className={styles.searchCard} id="search-form-card">
      <datalist id="city-list">
        {CITIES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldGroup}>
          <label htmlFor="source-input">From City</label>
          <div className={styles.inputWrapper}>
            <span className={styles.dotRed}></span>
            <input
              id="source-input"
              type="text"
              list="city-list"
              placeholder="e.g. Bangalore"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="button" className={styles.swapBtn} onClick={handleSwap} title="Swap cities">
          ⇄
        </button>

        <div className={styles.fieldGroup}>
          <label htmlFor="destination-input">To City</label>
          <div className={styles.inputWrapper}>
            <span className={styles.dotNavy}></span>
            <input
              id="destination-input"
              type="text"
              list="city-list"
              placeholder="e.g. Mumbai"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="date-input">Journey Date</label>
          <input
            id="date-input"
            type="date"
            value={journeyDate}
            onChange={(e) => setJourneyDate(e.target.value)}
            required
          />
        </div>

        <button type="submit" className={styles.searchBtn}>
          Search Buses
        </button>
      </form>

      {/* Popular Routes Quick Select */}
      <div className={styles.quickRoutes}>
        <span className={styles.quickTitle}>Popular Routes:</span>
        <div className={styles.pillsContainer}>
          {POPULAR_ROUTES.map((route, i) => (
            <button
              key={i}
              type="button"
              className={styles.routePill}
              onClick={() => handleSelectRoute(route.from, route.to)}
            >
              {route.label}
            </button>
          ))}
        </div>
      </div>

      {validationError && (
        <div className={styles.validationError}>
          ⚠️ {validationError}
        </div>
      )}
    </div>
  );
}
