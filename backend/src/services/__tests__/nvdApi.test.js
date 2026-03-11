/**
 * Unit tests for NVD API service
 */

import { fetchVulnerabilities } from '../nvdApi.js';

describe('nvdApi', () => {
  test('fetchVulnerabilities is a function', () => {
    expect(typeof fetchVulnerabilities).toBe('function');
  });

  test('fetchVulnerabilities returns a promise', () => {
    const result = fetchVulnerabilities(5);
    expect(result).toBeInstanceOf(Promise);
  });
});
