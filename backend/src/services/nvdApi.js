/**
 * NVD (National Vulnerability Database) API service
 * Fetches CVE data from https://services.nvd.nist.gov/rest/json/cves/2.0
 * Falls back to sample data when API is unreachable (rate limit, etc.)
 */

const NVD_API_BASE = 'https://services.nvd.nist.gov/rest/json/cves/2.0';

function getFallbackData() {
  const now = new Date().toISOString();
  return {
    vulnerabilities: [
      {
        cve: {
          id: 'CVE-2024-3400',
          published: '2024-04-10T00:00:00Z',
          descriptions: [{ lang: 'en', value: 'Palo Alto PAN-OS command injection vulnerability.' }],
          metrics: {
            cvssMetricV31: [{ cvssData: { baseScore: 10, baseSeverity: 'CRITICAL' }, exploitabilityScore: 3.9 }],
          },
          configurations: [{ nodes: [{ cpeMatch: [{ criteria: 'cpe:2.3:a:paloaltonetworks:pan-os:10.2.0:*:*:*:*:*:*:*' }] }] }],
        },
      },
      {
        cve: {
          id: 'CVE-2024-21626',
          published: '2024-01-16T00:00:00Z',
          descriptions: [{ lang: 'en', value: ' runc container escape vulnerability.' }],
          metrics: {
            cvssMetricV31: [{ cvssData: { baseScore: 8.6, baseSeverity: 'HIGH' }, exploitabilityScore: 2.5 }],
          },
          configurations: [{ nodes: [{ cpeMatch: [{ criteria: 'cpe:2.3:a:opencontainers:runc:1.1.0:*:*:*:*:*:*:*' }] }] }],
        },
      },
      {
        cve: {
          id: 'CVE-2023-44487',
          published: '2023-10-10T00:00:00Z',
          descriptions: [{ lang: 'en', value: 'HTTP/2 rapid reset DDoS vulnerability affecting many web servers.' }],
          metrics: {
            cvssMetricV31: [{ cvssData: { baseScore: 7.5, baseSeverity: 'HIGH' }, exploitabilityScore: 3.1 }],
          },
          configurations: [],
        },
      },
      {
        cve: {
          id: 'CVE-2023-22515',
          published: '2023-10-04T00:00:00Z',
          descriptions: [{ lang: 'en', value: 'Atlassian Confluence RCE vulnerability.' }],
          metrics: {
            cvssMetricV31: [{ cvssData: { baseScore: 9.1, baseSeverity: 'CRITICAL' }, exploitabilityScore: 3.9 }],
          },
          configurations: [{ nodes: [{ cpeMatch: [{ criteria: 'cpe:2.3:a:atlassian:confluence:*:*:*:*:*:*:*:*' }] }] }],
        },
      },
      {
        cve: {
          id: 'CVE-2023-4966',
          published: '2023-10-03T00:00:00Z',
          descriptions: [{ lang: 'en', value: 'Citrix Bleed - session hijacking in NetScaler.' }],
          metrics: {
            cvssMetricV31: [{ cvssData: { baseScore: 9.4, baseSeverity: 'CRITICAL' }, exploitabilityScore: 2.5 }],
          },
          configurations: [{ nodes: [{ cpeMatch: [{ criteria: 'cpe:2.3:a:citrix:netscaler:*:*:*:*:*:*:*:*' }] }] }],
        },
      },
    ],
  };
}

export async function fetchVulnerabilities(resultsPerPage = 20) {
  try {
    const url = `${NVD_API_BASE}?resultsPerPage=${resultsPerPage}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Kovrr-Vulnerability-Dashboard/1.0 (Educational; mailto:support@example.com)',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`NVD API returned ${response.status}, using fallback data`);
      return getFallbackData();
    }

    const data = await response.json();
    if (!data.vulnerabilities?.length) {
      return getFallbackData();
    }
    return data;
  } catch (err) {
    console.warn('NVD API unreachable, using fallback data:', err.message);
    return getFallbackData();
  }
}
