/**
 * Resolution Profiles Types & Utilities
 */

export interface ResolutionProfile {
  id: string;
  name: string;
  width: number;
  height: number;
  orientation: 'landscape' | 'portrait';
  isDefault?: boolean;
}

export interface Device {
  id: string;
  name: string;
  resolution: string; // e.g., "1920x1080"
  status: 'online' | 'offline';
}

export interface Layout {
  id: string;
  name: string;
  resolutionProfile: ResolutionProfile;
  zones: Zone[];
  createdAt: string;
}

export interface Zone {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  widgets: Widget[];
}

export interface Widget {
  id: string;
  type: string;
  title: string;
  config?: Record<string, any>;
}

// Get orientation from dimensions
export function getOrientation(width: number, height: number): 'landscape' | 'portrait' {
  return width >= height ? 'landscape' : 'portrait';
}

// Check if layout is compatible with device resolution
export function isLayoutCompatible(layout: Layout, device: Device): boolean {
  const layoutRes = `${layout.resolutionProfile.width}x${layout.resolutionProfile.height}`;
  return layoutRes === device.resolution;
}

// Get scale factor for preview
export function getCanvasScale(layoutWidth: number, layoutHeight: number, containerWidth: number): number {
  const maxWidth = containerWidth - 48; // padding
  const scaleX = maxWidth / layoutWidth;
  return Math.min(scaleX, 1); // Never scale up, only down
}

// Parse resolution string "1920x1080" to {width, height}
export function parseResolution(resolution: string): { width: number; height: number } {
  const [width, height] = resolution.split('x').map(Number);
  return { width, height };
}

// Format resolution for display
export function formatResolution(width: number, height: number): string {
  return `${width}x${height}`;
}

// Get common resolution names
export function getResolutionName(width: number, height: number): string {
  const resolutions: Record<string, string> = {
    '1920x1080': 'Full HD',
    '2560x1440': '2K',
    '3840x2160': '4K',
    '1280x720': 'HD Ready',
    '1080x1920': 'Vertical Full HD',
  };
  return resolutions[`${width}x${height}`] || 'Custom';
}
