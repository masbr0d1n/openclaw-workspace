import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is invalid
  if (isNaN(d.getTime())) return '-';
  
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format duration in seconds to readable string
 * Float values show only 2 decimal places
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.round((seconds % 60) * 100) / 100; // Round to 2 decimal places

  if (hours > 0) {
    return `${hours}j ${minutes}m ${secs.toFixed(2)}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs.toFixed(2)}s`;
  } else {
    return `${secs.toFixed(2)}s`;
  }
}

/**
 * Format view count
 */
export function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}
