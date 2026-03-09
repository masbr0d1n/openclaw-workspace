/**
 * Content Modal Technical Specifications Component
 * Displays video and audio specs in a 6-card grid layout
 */

'use client';

import { Tv, Film, Gauge, Music, Volume2, Columns, Cpu } from 'lucide-react';
import type { SpecsProps } from './types';

export function ContentModalSpecs({ video }: SpecsProps) {
  // Format bitrate
  const formatBitrate = (bitrate: number | null): string => {
    if (!bitrate) return '-';
    if (bitrate >= 1_000_000) {
      return `${(bitrate / 1_000_000).toFixed(1)} Mbps`;
    }
    return `${Math.round(bitrate / 1_000)} kbps`;
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

  const specs = [
    {
      label: 'Resolution',
      value: getQualityLabel(video.width, video.height),
      detail: video.width && video.height ? `${video.width}x${video.height}` : undefined,
      icon: Tv,
    },
    {
      label: 'Video Codec',
      value: video.video_codec || '-',
      detail: video.video_codec || undefined,
      icon: Film,
    },
    {
      label: 'Video Bitrate',
      value: formatBitrate(video.video_bitrate),
      detail: video.video_bitrate ? 'High Quality' : undefined,
      icon: Gauge,
    },
    {
      label: 'Audio Codec',
      value: video.audio_codec || '-',
      detail: video.audio_codec || undefined,
      icon: Music,
    },
    {
      label: 'Audio Bitrate',
      value: formatBitrate(video.audio_bitrate),
      detail: video.audio_bitrate ? 'High Quality' : undefined,
      icon: Volume2,
    },
    {
      label: 'Frame Rate',
      value: video.fps ? `${video.fps} fps` : '-',
      detail: video.fps ? 'Standard' : undefined,
      icon: Columns,
    },
  ];

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Cpu className="h-4 w-4 text-primary" />
        Technical Specifications
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {specs.map((spec) => (
          <div
            key={spec.label}
            className="spec-card p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <spec.icon className="h-4 w-4 text-gray-400" />
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
