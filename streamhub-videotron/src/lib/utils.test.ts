import { describe, it, expect } from 'vitest'
import { cn, formatDate, formatDuration, formatViewCount } from './utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('should handle conditional classes', () => {
      expect(cn('foo', true && 'bar', false && 'baz')).toBe('foo bar')
    })

    it('should merge tailwind classes', () => {
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })
  })

  describe('formatDate', () => {
    it('should return dash for null/undefined', () => {
      expect(formatDate(null)).toBe('-')
      expect(formatDate(undefined)).toBe('-')
    })

    it('should format valid date string', () => {
      const result = formatDate('2024-01-15T10:30:00Z')
      expect(result).not.toBe('-')
      expect(result).toContain('2024')
    })

    it('should format Date object', () => {
      const date = new Date('2024-06-15T14:00:00Z')
      const result = formatDate(date)
      expect(result).not.toBe('-')
      expect(result).toContain('2024')
    })

    it('should return dash for invalid date', () => {
      expect(formatDate('invalid-date')).toBe('-')
    })
  })

  describe('formatDuration', () => {
    it('should return 0s for null/undefined', () => {
      expect(formatDuration(null)).toBe('0s')
      expect(formatDuration(undefined)).toBe('0s')
      expect(formatDuration(0)).toBe('0s')
    })

    it('should format seconds', () => {
      expect(formatDuration(45)).toBe('45.00s')
    })

    it('should format minutes and seconds', () => {
      expect(formatDuration(125)).toBe('2m 5.00s')
    })

    it('should format hours, minutes and seconds', () => {
      expect(formatDuration(3661)).toBe('1j 1m 1.00s')
    })

    it('should handle decimal seconds', () => {
      const result = formatDuration(1.234)
      expect(result).toBe('1.23s')
    })
  })

  describe('formatViewCount', () => {
    it('should format small numbers', () => {
      expect(formatViewCount(500)).toBe('500')
    })

    it('should format thousands with K', () => {
      expect(formatViewCount(1500)).toBe('1.5K')
      expect(formatViewCount(10000)).toBe('10.0K')
    })

    it('should format millions with M', () => {
      expect(formatViewCount(1500000)).toBe('1.5M')
      expect(formatViewCount(2000000)).toBe('2.0M')
    })
  })
})
