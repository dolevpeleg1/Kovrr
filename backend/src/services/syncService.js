/**
 * Syncs vulnerabilities from NVD API to local database
 */

import { fetchVulnerabilities } from './nvdApi.js';
import { calculateRiskScore } from './riskScore.js';
import { getDatabase } from './database.js';

function getSeverity(cve) {
  const metrics = cve.metrics;
  if (!metrics) return 'UNKNOWN';

  const cvss3 = metrics.cvssMetricV31?.[0] || metrics.cvssMetricV30?.[0];
  const cvss2 = metrics.cvssMetricV2?.[0];
  const cvss = cvss3 || cvss2;

  if (!cvss) return 'UNKNOWN';

  const severity = cvss.cvssData?.baseSeverity || cvss.baseSeverity;
  if (severity) return severity.toUpperCase();

  const score = cvss.cvssData?.baseScore ?? cvss.baseScore;
  if (score >= 9) return 'CRITICAL';
  if (score >= 7) return 'HIGH';
  if (score >= 4) return 'MEDIUM';
  if (score > 0) return 'LOW';
  return 'UNKNOWN';
}

/** Extract vendor from CPE strings (cpe:2.3:a:vendor:product:...) - NVD 2.0 structure */
function getVendor(cve) {
  const configs = cve.configurations || [];
  for (const config of configs) {
    const nodes = config.nodes || [];
    for (const node of nodes) {
      const matches = node.cpeMatch || [];
      for (const m of matches) {
        const criteria = m.criteria || m;
        if (criteria) {
          const parts = String(criteria).split(':');
          if (parts.length >= 5 && parts[3] && parts[3] !== '*') return parts[3];
        }
      }
    }
  }
  return 'Unknown';
}

function getDescription(cve) {
  const descriptions = cve.descriptions;
  if (!descriptions || !descriptions.length) return 'No description available';

  const en = descriptions.find((d) => d.lang === 'en');
  return (en || descriptions[0]).value;
}

export async function syncVulnerabilities() {
  const data = await fetchVulnerabilities(20);
  const db = await getDatabase();

  const insert = db.prepare(`
    INSERT OR REPLACE INTO vulnerabilities (id, description, severity, risk_score, published, vendor, raw_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const vulnerabilities = (data.vulnerabilities || []).map((item) => {
    const cve = item.cve;
    const riskScore = calculateRiskScore(cve);
    const severity = getSeverity(cve);
    const description = getDescription(cve);
    const published = cve.published || '';
    const vendor = getVendor(cve);

    return {
      id: cve.id,
      description,
      severity,
      riskScore,
      published,
      vendor,
      rawJson: JSON.stringify(cve),
    };
  });

  for (const v of vulnerabilities) {
    insert.run(v.id, v.description, v.severity, v.riskScore, v.published, v.vendor, v.rawJson);
  }
  db.save?.();
  return vulnerabilities.length;
}
