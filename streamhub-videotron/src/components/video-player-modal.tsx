'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Play, Calendar, Clock, Film, Music, Gauge, Monitor, Tag } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import type { Video } from '@/types';

interface VideoPlayerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video: Video | null;
}

export function VideoPlayerModal({ open, onOpenChange, video }: VideoPlayerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Reset video when modal closes
  useEffect(() => {
    if (!open && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [open]);

  // Auto-play when modal opens
  useEffect(() => {
    if (open && videoRef.current && video) {
      videoRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  }, [open, video]);

  // Get video URL
  const getVideoUrl = (video: Video) => {
    // For local uploaded videos - check video_url field
    if (video.video_url && video.video_url.includes('/uploads/')) {
      // Extract filename from video_url
      const filename = video.video_url.split('/').pop();
      return `http://192.168.8.117:3000/uploads/videos/${filename}`;
    }
    // For YouTube videos - check youtube_id field
    if (video.youtube_id && !video.youtube_id.includes('.mp4')) {
      return `https://www.youtube.com/embed/${video.youtube_id}`;
    }
    // Fallback: if youtube_id contains .mp4, treat as local file
    if (video.youtube_id && video.youtube_id.includes('.mp4')) {
      return `http://192.168.8.117:3000/uploads/videos/${video.youtube_id}`;
    }
    // Default fallback
    return '';
  };

  if (!video) return null;

  // Check if it's a local file or YouTube video
  const isLocalFile = (video.video_url && video.video_url.includes('/uploads/')) || 
                      (video.youtube_id && video.youtube_id.includes('.mp4'));
  const videoUrl = getVideoUrl(video);

  const specs = [
    { label: 'Kategori', value: video.channel_id ? 'Entertainment' : '-', icon: Tag },
    { label: 'Durasi', value: video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : '-', icon: Clock },
    { label: 'Resolusi', value: video.width && video.height ? `${video.width}x${video.height}` : '-', icon: Monitor },
    { label: 'Video Codec', value: video.video_codec || '-', icon: Film },
    { label: 'Audio Codec', value: video.audio_codec || '-', icon: Music },
    { label: 'Video Bitrate', value: video.video_bitrate ? `${(video.video_bitrate / 1_000_000).toFixed(2)} Mbps` : '-', icon: Gauge },
    { label: 'FPS', value: video.fps ? `${video.fps} fps` : '-', icon: Gauge },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        {/* Video Player */}
        <div className="relative bg-black aspect-video">
          {isLocalFile ? (
            <video
              ref={videoRef}
              className="w-full h-full"
              controls
              src={videoUrl}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            />
          ) : (
            <iframe
              className="w-full h-full"
              src={videoUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>

        {/* Video Info */}
        <div className="p-6 space-y-4">
          {/* Title & Upload Date */}
          <div>
            <h2 className="text-2xl font-bold mb-2">{video.title}</h2>
            {video.description && (
              <p className="text-muted-foreground">{video.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Uploaded {formatDate(video.created_at)}</span>
            </div>
          </div>

          {/* Specifications */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Spesifikasi Video</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"
                >
                  <spec.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">{spec.label}</p>
                    <p className="text-sm font-medium truncate">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Badge variant="secondary">
              <Play className="w-3 h-3 mr-1" />
              {isPlaying ? 'Playing' : 'Paused'}
            </Badge>
            {video.is_live && (
              <Badge variant="destructive">LIVE</Badge>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
