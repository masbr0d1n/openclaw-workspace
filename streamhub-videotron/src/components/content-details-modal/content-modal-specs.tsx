/**
 * Content Modal Technical Specifications Component
 * Displays video and audio specs in a grid layout
 */

'use client';

import { Film, Music, Gauge, Monitor, Cpu, Video } from 'lucide-react';
import type { SpecsProps } from './types';

export function ContentModalSpecs({ video }: SpecsProps) {
  // Format bitrate
  const formatBitrate = (bitrate: number | null): string => {
    if (!bitrate) return '-';
    if (bitrate >= 1_000_000) {
      return `${(bitrate / 1_000_000).toFixed(2)} Mbps`;
    }
    return `${(bitrate / 1_000).toFixed(2)} kbps`;
  };

  // Get quality label
  const getQualityLabel = (width: number | null, height: number | null): string => {
    if (!width || !height) return '-';
    if (height >= 2160) return '4K';
    if (height >= 1440) return '2K';
    if (height >= 1080) return 'Full HD';
    if (height >= 720) return 'HD';
    if (height >= 480) return 'SD';
    return `${width}x${height}`;
  };

  // Format file size
  const formatFileSize = (bytes: number | null | undefined): string => {
    if (!bytes) return '-';
    if (bytes >= 1_073_741_824) {
      return `${(bytes / 1_073_741_824).toFixed(2)} GB`;
    }
    if (bytes >= 1_048_576) {
      return `${(bytes / 1_048_576).toFixed(2)} MB`;
    }
    if (bytes >= 1_024) {
      return `${(bytes / 1_024).toFixed(2)} KB`;
    }
    return `${bytes} B`;
  };

  const specs = [
    {
      label: 'Resolution',
      value: getQualityLabel(video.width, video.height),
      detail: video.width && video.height ? `${video.width}x${video.height}` : undefined,
      icon: Monitor,
      color: 'text-blue-500',
    },
    {
      label: 'Video Codec',
      value: video.video_codec || '-',
      detail: video.video_codec ? 'Video' : undefined,
      icon: Film,
      color: 'text-purple-500',
    },
    {
      label: 'Video Bitrate',
      value: formatBitrate(video.video_bitrate),
      detail: video.video_bitrate ? 'High Quality' : undefined,
      icon: Gauge,
      color: 'text-orange-500',
    },
    {
      label: 'Audio Codec',
      value: video.audio_codec || '-',
      detail: video.audio_codec ? 'Audio' : undefined,
      icon: Music,
      color: 'text-pink-500',
    },
    {
      label: 'Audio Bitrate',
      value: formatBitrate(video.audio_bitrate),
      detail: video.audio_bitrate ? 'High Quality' : undefined,
      icon: Gauge,
      color: 'text-green-500',
    },
    {
      label: 'Frame Rate',
      value: video.fps ? `${video.fps} fps` : '-',
      detail: video.fps ? 'Standard' : undefined,
      icon: Video,
      color: 'text-cyan-500',
    },
  ];

  // Check if we have any specs to display
  const hasSpecs = video.width || video.height || video.video_codec || 
                   video.video_bitrate || video.audio_codec || video.audio_bitrate || video.fps;

  if (!hasSpecs) {
    return null;
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Cpu className="h-4 w-4 text-indigo-600" />
        Technical Specifications
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {specs.map((spec) => (
          <div
            key={spec.label}
            className="spec-card p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <spec.icon className={`h-4 w-4 ${spec.color}`} />
              <span className="text-xs text-gray-600">{spec.label}</span>
            </div>
            <p className="font-semibold text-gray-900 text-sm">{spec.value}</p>
            {spec.detail && (
              <p className="text-xs text-gray-500 mt-0.5">{spec.detail}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
