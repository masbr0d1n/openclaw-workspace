/**
 * ThumbnailImage component with fallback and lazy loading
 * Uses Next.js Image component for optimized image loading
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ThumbnailImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean; // For above-the-fold images
}

export function ThumbnailImage({ 
  src, 
  alt, 
  className = '', 
  width = 320, 
  height = 180,
  priority = false
}: ThumbnailImageProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  // If error occurred, render placeholder
  if (hasError) {
    return (
      <div 
        className={className}
        style={{ 
          width, 
          height,
          background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <span className="text-4xl">🎬</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      placeholder="blur"
      blurDataURL={`data:image/svg+xml,${encodeURIComponent(`
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#374151;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#1f2937;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad)" />
        </svg>
      `)}`}
      onError={handleError}
      style={{
        objectFit: 'cover',
      }}
    />
  );
}
