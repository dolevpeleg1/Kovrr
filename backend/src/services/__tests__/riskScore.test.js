/**
 * Unit tests for Risk Score calculation
 */

import { calculateRiskScore } from '../riskScore.js';

const mockCveWithFullMetrics = {
  published: '2024-01-01T00:00:00Z',
  metrics: {
    cvssMetricV31: [
      {
        cvssData: { baseScore: 9.8, baseSeverity: 'CRITICAL' },
        exploitabilityScore: 3.9,
      },
    ],
  },
};

const mockCveWithCvss2 = {
  published: '2023-06-15T12:00:00Z',
  metrics: {
    cvssMetricV2: [
      {
        cvssData: { baseScore: 7.5 },
        baseSeverity: 'HIGH',
        exploitabilityScore: 2.5,
      },
    ],
  },
};

const mockCveMinimal = {
  published: '2024-03-01T00:00:00Z',
  descriptions: [],
};

describe('calculateRiskScore', () => {
  test('returns score 0-100 for CVE with full metrics', () => {
    const score = calculateRiskScore(mockCveWithFullMetrics);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
    expect(typeof score).toBe('number');
  });

  test('higher CVSS produces higher risk score', () => {
    const highCvss = { ...mockCveWithFullMetrics, metrics: { cvssMetricV31: [{ cvssData: { baseScore: 9.8 }, exploitabilityScore: 4 }] } };
    const lowCvss = { ...mockCveWithFullMetrics, metrics: { cvssMetricV31: [{ cvssData: { baseScore: 2 }, exploitabilityScore: 1 }] } };
    expect(calculateRiskScore(highCvss)).toBeGreaterThan(calculateRiskScore(lowCvss));
  });

  test('handles CVSS 2.0 metrics', () => {
    const score = calculateRiskScore(mockCveWithCvss2);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('handles minimal CVE without metrics gracefully', () => {
    const score = calculateRiskScore(mockCveMinimal);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
