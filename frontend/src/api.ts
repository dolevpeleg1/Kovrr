import type { Vulnerability, Stats } from './types';

const API_BASE = '/api';

export async function fetchVulnerabilities(severity?: string): Promise<Vulnerability[]> {
  const url = severity ? `${API_BASE}/vulnerabilities?severity=${severity}` : `${API_BASE}/vulnerabilities`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch vulnerabilities');
  return res.json();
}

export async function fetchVulnerability(id: string): Promise<Vulnerability & { rawJson?: string }> {
  const res = await fetch(`${API_BASE}/vulnerabilities/${encodeURIComponent(id)}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error('Vulnerability not found');
    throw new Error('Failed to fetch vulnerability');
  }
  return res.json();
}

export async function fetchStats(): Promise<Stats> {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}
