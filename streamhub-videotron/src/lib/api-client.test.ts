import { describe, it, expect } from 'vitest'
import { apiClient } from './api-client'

describe('api-client', () => {
  it('should export apiClient instance', () => {
    expect(apiClient).toBeDefined()
  })

  it('should have get method', () => {
    expect(apiClient.get).toBeDefined()
    expect(typeof apiClient.get).toBe('function')
  })

  it('should have post method', () => {
    expect(apiClient.post).toBeDefined()
    expect(typeof apiClient.post).toBe('function')
  })

  it('should have put method', () => {
    expect(apiClient.put).toBeDefined()
    expect(typeof apiClient.put).toBe('function')
  })

  it('should have delete method', () => {
    expect(apiClient.delete).toBeDefined()
    expect(typeof apiClient.delete).toBe('function')
  })

  it('should have interceptors configured', () => {
    expect(apiClient.interceptors).toBeDefined()
    expect(apiClient.interceptors.request).toBeDefined()
    expect(apiClient.interceptors.response).toBeDefined()
  })

  it('should have defaults with headers', () => {
    expect(apiClient.defaults).toBeDefined()
    expect(apiClient.defaults.headers).toBeDefined()
  })
})
