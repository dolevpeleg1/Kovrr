import type { Stats } from '../types';

interface StatsPanelProps {
  stats: Stats | null;
  loading?: boolean;
  error?: string | null;
}

export function StatsPanel({ stats, loading, error }: StatsPanelProps) {
  if (error) {
    return (
      <div className="stats-panel stats-panel--error">
        <p>{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="stats-panel stats-panel--loading">
        <p>Loading stats...</p>
      </div>
    );
  }

  if (!stats) return null;

  const total = stats.bySeverity.reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="stats-panel">
      <h3>Severity Breakdown</h3>
      <div className="stats-severity">
        {stats.bySeverity.map(({ severity, count }) => {
          const pct = total ? Math.round((count / total) * 100) : 0;
          return (
            <div key={severity} className="stats-row">
              <span className={`severity-badge severity-badge--${severity.toLowerCase()}`}>{severity}</span>
              <div className="stats-bar-wrap">
                <div
                  className={`stats-bar stats-bar--${severity.toLowerCase()}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="stats-count">{count}</span>
            </div>
          );
        })}
      </div>
      {stats.topVendors.length > 0 && (
        <>
          <h3>Top Vendors</h3>
          <ul className="stats-vendors">
            {stats.topVendors.map(({ vendor, count }) => (
              <li key={vendor}>
                <span className="vendor-name">{vendor}</span>
                <span className="vendor-count">{count}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
