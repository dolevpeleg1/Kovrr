/**
 * Risk Score Calculation (0-100)
 *
 * Formula:
 * - CVSS Score: 60% - Base severity from CVSS v3/v2
 * - Exploitability: 20% - How easily the vulnerability can be exploited
 * - Age: 20% - How long the vulnerability has been known (older = higher exposure risk)
 *
 * All components are normalized to contribute their percentage share.
 */

const CVSS_WEIGHT = 0.6;
const EXPLOITABILITY_WEIGHT = 0.2;
const AGE_WEIGHT = 0.2;

/**
 * Calculate risk score from CVE data
 * @param {Object} cve - CVE object from NVD API
 * @returns {number} Risk score 0-100
 */
export function calculateRiskScore(cve) {
  const cvssComponent = getCvssComponent(cve);
  const exploitabilityComponent = getExploitabilityComponent(cve);
  const ageComponent = getAgeComponent(cve);

  const score =
    cvssComponent * CVSS_WEIGHT +
    exploitabilityComponent * EXPLOITABILITY_WEIGHT +
    ageComponent * AGE_WEIGHT;

  return Math.max(0, Math.min(100, Math.round(score * 100)));
}

function getCvssComponent(cve) {
  const metrics = cve.metrics;
  if (!metrics) return 0.5; // Default middle if no metrics

  // Prefer CVSS 3.x over 2.0
  const cvss3 = metrics.cvssMetricV31?.[0] || metrics.cvssMetricV30?.[0] || metrics.cvssMetricV2?.[0];
  if (!cvss3) return 0.5;

  const baseScore = cvss3.cvssData?.baseScore ?? cvss3.cvssData?.baseSeverity;
  if (typeof baseScore === 'number') {
    return Math.max(0, Math.min(1, baseScore / 10)); // Normalize 0-10 to 0-1, clamp invalid values
  }
  if (baseScore === 'CRITICAL') return 1;
  if (baseScore === 'HIGH') return 0.8;
  if (baseScore === 'MEDIUM') return 0.5;
  if (baseScore === 'LOW') return 0.2;
  return 0.5;
}

function getExploitabilityComponent(cve) {
  const metrics = cve.metrics;
  if (!metrics) return 0.5; // Default middle if no metrics

  const cvss3 = metrics.cvssMetricV31?.[0] || metrics.cvssMetricV30?.[0] || metrics.cvssMetricV2?.[0];
  if (!cvss3?.exploitabilityScore) return 0.5;

  const score = cvss3.exploitabilityScore;
  return Math.max(0, Math.min(1, score / 4)); // CVSS exploitability typically 0-4, clamp invalid values
}

function getAgeComponent(cve) {
  const published = cve.published;
  if (!published) return 0.5; // Default middle if no metrics

  const publishedDate = new Date(published);
  const now = new Date();
  const daysSincePublished = (now - publishedDate) / (1000 * 60 * 60 * 24);

  // Older = higher risk (more time for exploitation)
  // Cap at 365 days for full 20% contribution; clamp negative (future dates) to 0
  const normalizedAge = Math.max(0, Math.min(1, daysSincePublished / 365));
  return normalizedAge;
}
