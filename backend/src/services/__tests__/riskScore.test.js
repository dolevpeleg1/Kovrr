/**
 * Unit tests for Risk Score calculation
 * Tests edge cases: lower bound, upper bound, mid-range for each component
 */

import { calculateRiskScore } from '../riskScore.js';

// Lower bound: CVSS 0, exploitability 0, age 0 (future date → clamped to 0)
const lowerBoundCve = {
  published: new Date(Date.now() + 86400000).toISOString(), // tomorrow
  metrics: {
    cvssMetricV31: [{
      cvssData: { baseScore: 0, baseSeverity: 'NONE' },
      exploitabilityScore: 0,
    }],
  },
};

// Upper bound: CVSS 10, exploitability 4, age 400 days (capped at 1)
const upperBoundCve = {
  published: new Date(Date.now() - 400 * 86400000).toISOString(),
  metrics: {
    cvssMetricV31: [{
      cvssData: { baseScore: 10, baseSeverity: 'CRITICAL' },
      exploitabilityScore: 4,
    }],
  },
};

// Invalid data: negative CVSS, negative exploitability, future date (age clamped to 0)
const invalidNegativeCve = {
  published: new Date(Date.now() + 86400000).toISOString(),
  metrics: {
    cvssMetricV31: [{
      cvssData: { baseScore: -5, baseSeverity: 'LOW' },
      exploitabilityScore: -2,
    }],
  },
};

// Mid-range: CVSS 5, exploitability 2, age ~180 days
const midRangeCve = {
  published: new Date(Date.now() - 180 * 86400000).toISOString(),
  metrics: {
    cvssMetricV31: [{
      cvssData: { baseScore: 5, baseSeverity: 'MEDIUM' },
      exploitabilityScore: 2,
    }],
  },
};

describe('calculateRiskScore', () => {
  test('lower bound: CVSS 0, exploitability 0, age 0 produces score near 0', () => {
    const score = calculateRiskScore(lowerBoundCve);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(10);
  });

  test('upper bound: CVSS 10, exploitability 4, age 365+ produces score near 100', () => {
    const score = calculateRiskScore(upperBoundCve);
    expect(score).toBeGreaterThanOrEqual(90);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('mid-range: CVSS 5, exploitability 2, age ~180 days produces score ~40-60', () => {
    const score = calculateRiskScore(midRangeCve);
    expect(score).toBeGreaterThanOrEqual(40);
    expect(score).toBeLessThanOrEqual(60);
  });

  test('invalid negative values are clamped: score stays 0-100', () => {
    const score = calculateRiskScore(invalidNegativeCve);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
