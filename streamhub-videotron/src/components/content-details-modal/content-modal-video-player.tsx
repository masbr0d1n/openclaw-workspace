/**
 * Content Modal Video Player Component
 * Supports YouTube and uploaded videos
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Youtube, Film, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { VideoPlayerProps } from './types';

export function ContentModalVideoPlayer({ video, isLoading, onError }: VideoPlayerProps) {
  const [youtubeError, setYoutubeError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Get video proxy URL for uploaded videos
  const getVideoProxyUrl = (videoUrl: string | null) => {
    if (!videoUrl) return null;
    return `/api/videos/file${videoUrl}`;
  };

  // Check if this is a YouTube video
  const isYouTube = !!video.youtube_id;
  const hasUploadedVideo = !!video.video_url && !video.youtube_id;

  // Get quality label based on resolution
  const getQualityLabel = (width: number | null, height: number | null): string => {
    if (!width || !height) return '';
    if (height >= 2160) return '4K';
    if (height >= 1440) return '2K';
    if (height >= 1080) return 'Full HD';
    if (height >= 720) return 'HD';
    if (height >= 480) return 'SD';
    return `${width}x${height}`;
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViewCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (isLoading) {
    return (
      <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden relative group">
      {isYouTube ? (
        <div className="w-full h-full">
          {youtubeError ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
              <div className="text-center p-6">
                <Youtube className="h-16 w-16 mx-auto mb-4 text-red-500" />
                <p className="text-white text-lg mb-2">YouTube video unavailable</p>
                <p className="text-sm text-gray-400 mb-4">
                  This video may be restricted or removed
                </p>
                <a
                  href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm inline-flex items-center gap-1"
                >
                  Watch on YouTube <Youtube className="h-3 w-3" />
                </a>
              </div>
            </div>
          ) : (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube-nocookie.com/embed/${video.youtube_id}?rel=0&modestbranding=1&autoplay=0`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onError={() => {
                setYoutubeError(true);
                onError();
              }}
              className="w-full h-full"
            />
          )}
        </div>
      ) : hasUploadedVideo ? (
        <video
          ref={videoRef}
          width="100%"
          height="100%"
          controls
          className="w-full h-full"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={onError}
        >
          {getVideoProxyUrl(video.video_url) && (
            <source
              src={getVideoProxyUrl(video.video_url)!}
              type="video/mp4"
            />
          )}
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
          <div className="text-center">
            <Film className="h-16 w-16 mx-auto mb-4 opacity-50 text-white" />
            <p className="text-white text-lg">No video available</p>
          </div>
        </div>
      )}

      {/* Overlay Info (shown on hover for uploaded videos) */}
      {hasUploadedVideo && !isPlaying && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-4 text-white text-sm">
              {video.duration && (
                <span className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded">
                  <Film className="h-3 w-3" />
                  {formatDuration(video.duration)}
                </span>
              )}
              <span className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded">
                <Film className="h-3 w-3" />
                {formatViewCount(video.view_count)} views
              </span>
              {video.width && video.height && (
                <span className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded">
                  <Film className="h-3 w-3" />
                  {getQualityLabel(video.width, video.height)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Source Indicator */}
      <div className="absolute top-3 left-3">
        {isYouTube ? (
          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Youtube className="h-3 w-3" />
            YouTube
          </span>
        ) : hasUploadedVideo ? (
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Film className="h-3 w-3" />
            Uploaded
          </span>
        ) : null}
      </div>
    </div>
  );
}
