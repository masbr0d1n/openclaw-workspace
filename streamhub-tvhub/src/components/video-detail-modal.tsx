'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Video, Calendar, Clock, Film, Music, Gauge, Monitor } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Video as VideoType } from '@/types';

interface VideoDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video: VideoType | null;
}

export function VideoDetailModal({ open, onOpenChange, video }: VideoDetailModalProps) {
  if (!video) return null;

  const formatBitrate = (bitrate: number | null) => {
    if (!bitrate) return '-';
    if (bitrate >= 1_000_000) {
      return `${(bitrate / 1_000_000).toFixed(2)} Mbps`;
    }
    return `${(bitrate / 1_000).toFixed(2)} kbps`;
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const specs = [
    {
      label: 'Resolusi',
      value: video.width && video.height ? `${video.width}x${video.height}` : '-',
      icon: Monitor,
    },
    {
      label: 'Video Codec',
      value: video.video_codec || '-',
      icon: Film,
    },
    {
      label: 'Video Bitrate',
      value: formatBitrate(video.video_bitrate),
      icon: Gauge,
    },
    {
      label: 'Audio Codec',
      value: video.audio_codec || '-',
      icon: Music,
    },
    {
      label: 'Audio Bitrate',
      value: formatBitrate(video.audio_bitrate),
      icon: Gauge,
    },
    {
      label: 'Frame Rate',
      value: video.fps ? `${video.fps} fps` : '-',
      icon: Video,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Detail Video
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Thumbnail & Title */}
          <div className="flex gap-4">
            {video.thumbnail_url && (
              <div className="flex-shrink-0">
                <img
                  src={video.thumbnail_url}
                  alt={video.title}
                  className="w-48 h-32 object-cover rounded-lg"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold mb-2 line-clamp-2">{video.title}</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(video.duration)}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(video.created_at)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          {video.description && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Deskripsi</h4>
              <p className="text-sm whitespace-pre-wrap">{video.description}</p>
            </div>
          )}

          {/* Video Specifications */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Spesifikasi Video</h4>
            <div className="grid grid-cols-2 gap-3">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <spec.icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">{spec.label}</p>
                    <p className="text-sm font-medium truncate">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Upload: {new Date(video.created_at).toLocaleString('id-ID', { 
              dateStyle: 'medium', 
              timeStyle: 'short' 
            })}</p>
            {video.updated_at !== video.created_at && (
              <p>Update: {new Date(video.updated_at).toLocaleString('id-ID', { 
                dateStyle: 'medium', 
                timeStyle: 'short' 
              })}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
