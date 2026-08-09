import styles from '@/styles/BusDetails.module.css';

export default function BusDetails({ bus, onClose }) {
  if (!bus) return null;

  const {
    operator,
    bus_type,
    is_ac,
    pricing = {},
    schedule = {},
    boarding_points = [],
    dropping_points = [],
    cancellation_policy = {},
    amenities = []
  } = bus;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.operatorName}>{operator}</h2>
            <p className={styles.busType}>{bus_type} · {is_ac ? 'AC' : 'Non-AC'}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalBody}>
          {/* Fare Summary */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Pricing Summary</h4>
            <div className={styles.fareGrid}>
              <div className={styles.fareItem}>
                <span>Base Fare:</span>
                <strong>₹{pricing.base_fare ?? pricing.total_fare}</strong>
              </div>
              <div className={styles.fareItem}>
                <span>Taxes & Fees:</span>
                <strong>₹{(pricing.service_tax || 0) + (pricing.surcharges || 0)}</strong>
              </div>
              <div className={styles.fareItemTotal}>
                <span>Total Fare:</span>
                <strong>₹{pricing.total_fare}</strong>
              </div>
            </div>
          </div>

          {/* Amenities */}
          {amenities.length > 0 && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Amenities</h4>
              <div className={styles.amenitiesGrid}>
                {amenities.map((item, idx) => (
                  <span key={idx} className={styles.amenityChip}>
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Boarding Points */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Boarding Points ({boarding_points.length})</h4>
            {boarding_points.length === 0 ? (
              <p className={styles.emptyText}>No detailed boarding points provided.</p>
            ) : (
              <div className={styles.pointsList}>
                {boarding_points.map((pt, idx) => (
                  <div key={idx} className={styles.pointCard}>
                    <div className={styles.pointHeader}>
                      <span className={styles.pointTime}>{pt.time}</span>
                      {pt.is_nearest && <span className={styles.nearestTag}>Nearest</span>}
                    </div>
                    <p className={styles.pointName}>{pt.name}</p>
                    {pt.contact && <p className={styles.pointContact}>📞 {pt.contact}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dropping Points */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Dropping Points ({dropping_points.length})</h4>
            {dropping_points.length === 0 ? (
              <p className={styles.emptyText}>No detailed dropping points provided.</p>
            ) : (
              <div className={styles.pointsList}>
                {dropping_points.map((pt, idx) => (
                  <div key={idx} className={styles.pointCard}>
                    <div className={styles.pointHeader}>
                      <span className={styles.pointTime}>{pt.time}</span>
                      {pt.is_nearest && <span className={styles.nearestTag}>Nearest</span>}
                    </div>
                    <p className={styles.pointName}>{pt.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cancellation Policy */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Cancellation & Reschedule Policy</h4>
            <div className={styles.policyGrid}>
              <div className={styles.policyItem}>
                <span>Cancellable:</span>
                <strong>{cancellation_policy.is_cancellable ? 'Yes' : 'No'}</strong>
              </div>
              <div className={styles.policyItem}>
                <span>Reschedule Allowed:</span>
                <strong>{cancellation_policy.reschedule_allowed ? 'Yes' : 'No'}</strong>
              </div>
              <div className={styles.policyItem}>
                <span>Reschedule Charge:</span>
                <strong>₹{cancellation_policy.reschedule_charge || 0}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.closeModalBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
