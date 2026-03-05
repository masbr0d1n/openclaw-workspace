/**
 * ThumbnailImage component with fallback
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
}

export function ThumbnailImage({ 
  src, 
  alt, 
  className = '', 
  width = 320, 
  height = 180 
}: ThumbnailImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      // Use placeholder gradient
      setImgSrc(`data:image/svg+xml,${encodeURIComponent(`
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#374151;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#1f2937;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad)" />
          <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="#9ca3af" text-anchor="middle" dy=".3em">
            🎬
          </text>
        </svg>
      `)}`);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      onError={handleError}
    />
  );
}
