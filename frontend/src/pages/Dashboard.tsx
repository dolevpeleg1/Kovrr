import { useState, useEffect } from 'react';
import { fetchVulnerabilities, fetchStats } from '../api';
import { VulnerabilityTable } from '../components/VulnerabilityTable';
import { StatsPanel } from '../components/StatsPanel';
import type { Vulnerability, Stats } from '../types';

const SEVERITY_FILTERS = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'];

export function Dashboard() {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState('ALL');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchVulnerabilities(severityFilter === 'ALL' ? undefined : severityFilter),
      fetchStats(),
    ])
      .then(([vulns, s]) => {
        if (!cancelled) {
          setVulnerabilities(vulns);
          setStats(s);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? 'Failed to load data');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [severityFilter]);

  return (
    <div className="dashboard">
      <div className="dashboard-stats">
        <StatsPanel stats={stats} loading={loading} error={error} />
      </div>
      <div className="dashboard-content">
        <div className="filters">
          <label>Filter by Severity:</label>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="filter-select"
          >
            {SEVERITY_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <VulnerabilityTable
          vulnerabilities={vulnerabilities}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
}
