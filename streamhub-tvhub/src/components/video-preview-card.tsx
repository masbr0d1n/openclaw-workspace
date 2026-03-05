'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Clock, Eye } from 'lucide-react';
import { formatDuration, formatViewCount } from '@/lib/utils';
import { VideoPlayerModal } from './video-player-modal';
import type { Video as VideoType } from '@/types';

interface VideoPreviewCardProps {
  video: VideoType;
  category?: string;
}

export function VideoPreviewCard({ video, category }: VideoPreviewCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const hoverTimeoutRef = useRef<any>(null);

  // Handle hover preview
  useEffect(() => {
    if (isHovered && previewVideoRef.current && video.youtube_id?.includes('.mp4')) {
      // Delay 500ms before starting preview
      hoverTimeoutRef.current = setTimeout(() => {
        if (previewVideoRef.current) {
          // Start from 10% of video duration
          const startTime = (video.duration || 0) * 0.1;
          previewVideoRef.current.currentTime = startTime;
          previewVideoRef.current.muted = true;
          previewVideoRef.current.play().catch(console.error);
        }
      }, 500);
    } else {
      // Clear timeout and pause video
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (previewVideoRef.current) {
        previewVideoRef.current.pause();
        previewVideoRef.current.currentTime = 0;
      }
    }

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [isHovered, video]);

  // Get thumbnail URL
  const getThumbnailUrl = () => {
    if (video.thumbnail_url) {
      return video.thumbnail_url;
    }
    return '/placeholder-video.png'; // Fallback
  };

  // Get video URL for preview
  const getVideoUrl = () => {
    if (video.youtube_id && video.youtube_id.includes('.mp4')) {
      return `http://192.168.8.117:3000/uploads/videos/${video.youtube_id}`;
    }
    return null;
  };

  const videoUrl = getVideoUrl();
  const hasLocalVideo = !!videoUrl;

  const handleCardClick = () => {
    setShowPlayer(true);
  };

  return (
    <>
      <div
        className="group relative cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        {/* Thumbnail / Video Preview */}
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          {hasLocalVideo ? (
            <>
              {/* Static thumbnail */}
              <img
                src={getThumbnailUrl()}
                alt={video.title}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                  isHovered ? 'opacity-0' : 'opacity-100'
                }`}
              />
              
              {/* Video preview on hover */}
              <video
                ref={previewVideoRef}
                src={videoUrl}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
                muted
                playsInline
                loop
                style={{
                  objectPosition: 'center',
                }}
              />
            </>
          ) : (
            // YouTube thumbnail (static)
            <img
              src={getThumbnailUrl()}
              alt={video.title}
              className="w-full h-full object-cover"
            />
          )}

          {/* Play icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="w-8 h-8 text-black ml-1" />
            </div>
          </div>

          {/* Duration badge */}
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {formatDuration(video.duration)}
            </div>
          )}

          {/* Category badge */}
          {category && (
            <div className="absolute top-2 left-2 bg-primary/90 text-white text-xs px-2 py-1 rounded">
              {category}
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="mt-2 space-y-1">
          <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{video.duration ? formatDuration(video.duration) : '-'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{formatViewCount(video.view_count)}</span>
            </div>
          </div>
          
          {/* Video specs preview */}
          {video.width && video.height && (
            <div className="text-xs text-muted-foreground">
              {video.width}x{video.height} • {video.video_codec || '-'} • {video.fps ? `${video.fps}fps` : '-'}
            </div>
          )}
        </div>
      </div>

      {/* Video Player Modal */}
      <VideoPlayerModal
        open={showPlayer}
        onOpenChange={setShowPlayer}
        video={video}
      />
    </>
  );
}
