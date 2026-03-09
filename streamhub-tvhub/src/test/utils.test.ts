import { describe, it, expect } from 'vitest';
import { cn, formatDate, formatDuration, formatViewCount } from '../lib/utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge classes correctly', () => {
      expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
    });

    it('should handle conditional classes', () => {
      expect(cn('base-class', true && 'active', false && 'inactive')).toBe('base-class active');
    });

    it('should merge tailwind classes without conflicts', () => {
      expect(cn('px-2 py-2', 'px-4')).toBe('py-2 px-4');
    });
  });

  describe('formatDate', () => {
    it('should return "-" for null input', () => {
      expect(formatDate(null)).toBe('-');
    });

    it('should return "-" for undefined input', () => {
      expect(formatDate(undefined)).toBe('-');
    });

    it('should format valid date string', () => {
      const result = formatDate('2024-01-15T10:30:00Z');
      expect(result).not.toBe('-');
      expect(result).toContain('2024');
    });

    it('should format Date object', () => {
      const date = new Date('2024-06-15T14:00:00Z');
      const result = formatDate(date);
      expect(result).not.toBe('-');
    });

    it('should return "-" for invalid date', () => {
      expect(formatDate('invalid-date')).toBe('-');
    });
  });

  describe('formatDuration', () => {
    it('should return "0s" for null input', () => {
      expect(formatDuration(null)).toBe('0s');
    });

    it('should return "0s" for undefined input', () => {
      expect(formatDuration(undefined)).toBe('0s');
    });

    it('should format seconds only', () => {
      expect(formatDuration(45)).toBe('45.00s');
    });

    it('should format minutes and seconds', () => {
      expect(formatDuration(125)).toBe('2m 5.00s');
    });

    it('should format hours, minutes and seconds', () => {
      expect(formatDuration(3665)).toBe('1j 1m 5.00s');
    });
  });

  describe('formatViewCount', () => {
    it('should return small numbers as-is', () => {
      expect(formatViewCount(500)).toBe('500');
    });

    it('should format thousands with K suffix', () => {
      expect(formatViewCount(1500)).toBe('1.5K');
    });

    it('should format millions with M suffix', () => {
      expect(formatViewCount(2500000)).toBe('2.5M');
    });
  });
});
