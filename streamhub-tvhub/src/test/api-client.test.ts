import { describe, it, expect } from 'vitest';
import { apiClient } from '../lib/api-client';

describe('api-client', () => {
  it('should export apiClient instance', () => {
    expect(apiClient).toBeDefined();
  });

  it('should have get method', () => {
    expect(typeof apiClient.get).toBe('function');
  });

  it('should have post method', () => {
    expect(typeof apiClient.post).toBe('function');
  });

  it('should have put method', () => {
    expect(typeof apiClient.put).toBe('function');
  });

  it('should have delete method', () => {
    expect(typeof apiClient.delete).toBe('function');
  });

  it('should have interceptors configured', () => {
    expect(apiClient.interceptors).toBeDefined();
    expect(apiClient.interceptors.request).toBeDefined();
    expect(apiClient.interceptors.response).toBeDefined();
  });

  it('should have default headers', () => {
    expect(apiClient.defaults).toBeDefined();
    expect(apiClient.defaults.baseURL).toBe('/api/v1');
    expect(apiClient.defaults.timeout).toBe(30000);
    expect(apiClient.defaults.withCredentials).toBe(true);
  });
});
