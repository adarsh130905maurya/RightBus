import styles from '@/styles/FilterBar.module.css';

export default function FilterBar({ filters, onFilterChange, totalResults }) {
  return (
    <div className={styles.filterCard}>
      <div className={styles.resultsCount}>
        <strong>{totalResults}</strong> {totalResults === 1 ? 'Bus' : 'Buses'} Available
      </div>

      <div className={styles.filtersGroup}>
        {/* AC Filter */}
        <div className={styles.filterControl}>
          <label htmlFor="filter-ac">AC Type:</label>
          <select
            id="filter-ac"
            value={filters.filterAc || ''}
            onChange={(e) => onFilterChange({ ...filters, filterAc: e.target.value })}
          >
            <option value="">All (AC & Non-AC)</option>
            <option value="ac">AC Only</option>
            <option value="non-ac">Non-AC Only</option>
          </select>
        </div>

        {/* Seat Type Filter */}
        <div className={styles.filterControl}>
          <label htmlFor="filter-type">Bus Type:</label>
          <select
            id="filter-type"
            value={filters.filterType || ''}
            onChange={(e) => onFilterChange({ ...filters, filterType: e.target.value })}
          >
            <option value="">All Seat Types</option>
            <option value="sleeper">Sleeper</option>
            <option value="seater">Seater</option>
          </select>
        </div>

        {/* Sorting */}
        <div className={styles.filterControl}>
          <label htmlFor="sort-by">Sort By:</label>
          <select
            id="sort-by"
            value={filters.sortBy || ''}
            onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value })}
          >
            <option value="">Default</option>
            <option value="price">Price: Low to High</option>
            <option value="departure">Earliest Departure</option>
          </select>
        </div>
      </div>
    </div>
  );
}
