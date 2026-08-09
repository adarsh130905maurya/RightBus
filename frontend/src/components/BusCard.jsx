import styles from '@/styles/BusCard.module.css';

export default function BusCard({ bus, onViewDetails }) {
  const {
    operator,
    bus_type,
    is_ac,
    bus_seat_type,
    amenities = [],
    schedule = {},
    pricing = {},
    availability = {},
    from_city,
    to_city
  } = bus;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.operatorInfo}>
          <h3 className={styles.operatorName}>{operator}</h3>
          <p className={styles.busMeta}>
            <span className={is_ac ? styles.badgeAc : styles.badgeNonAc}>
              {is_ac ? 'AC' : 'NON-AC'}
            </span>
            <span className={styles.busTypeName}>{bus_type}</span>
          </p>
        </div>

        <div className={styles.priceContainer}>
          <span className={styles.currency}>{pricing.currency === 'INR' ? '₹' : pricing.currency}</span>
          <span className={styles.totalFare}>{pricing.total_fare}</span>
          <p className={styles.seatsInfo}>
            {availability.seats_available} seats left
          </p>
        </div>
      </div>

      <div className={styles.scheduleRow}>
        <div className={styles.timeBlock}>
          <span className={styles.time}>{schedule.departure_time}</span>
          <span className={styles.cityName}>{from_city}</span>
          <span className={styles.dateSub}>{schedule.departure_date}</span>
        </div>

        <div className={styles.durationLine}>
          <span className={styles.durationText}>{schedule.duration_formatted}</span>
          <div className={styles.lineGraphic}>
            <span className={styles.startDot}></span>
            <span className={styles.dashLine}></span>
            <span className={styles.endDot}></span>
          </div>
        </div>

        <div className={styles.timeBlock}>
          <span className={styles.time}>{schedule.arrival_time}</span>
          <span className={styles.cityName}>{to_city}</span>
          <span className={styles.dateSub}>{schedule.estimated_arrival_date}</span>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.amenitiesList}>
          {amenities.slice(0, 3).map((item, idx) => (
            <span key={idx} className={styles.amenityTag}>
              {item}
            </span>
          ))}
          {amenities.length > 3 && (
            <span className={styles.amenityMore}>+{amenities.length - 3} more</span>
          )}
        </div>

        <button className={styles.detailsBtn} onClick={() => onViewDetails(bus)}>
          View Details
        </button>
      </div>
    </div>
  );
}
