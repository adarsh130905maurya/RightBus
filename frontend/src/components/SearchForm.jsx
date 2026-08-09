import { useState } from 'react';
import styles from '@/styles/SearchForm.module.css';

export default function SearchForm({ onSearch, initialValues }) {
  const todayStr = new Date().toISOString().split('T')[0];
  
  const [source, setSource] = useState(initialValues?.source || 'Bangalore');
  const [destination, setDestination] = useState(initialValues?.destination || 'Mumbai');
  const [journeyDate, setJourneyDate] = useState(initialValues?.journeyDate || '2026-08-09');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
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

  return (
    <div className={styles.searchCard}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldGroup}>
          <label htmlFor="source-input">From City</label>
          <div className={styles.inputWrapper}>
            <span className={styles.dotRed}></span>
            <input
              id="source-input"
              type="text"
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

      {validationError && (
        <div className={styles.validationError}>
          ⚠️ {validationError}
        </div>
      )}
    </div>
  );
}
