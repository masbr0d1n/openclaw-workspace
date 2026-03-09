/**
 * Content Modal Metadata Component
 * Displays channel info, statistics, and tags
 */

'use client';

import { Calendar, Clock, Eye, RefreshCw, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { MetadataProps } from './types';

export function ContentModalMetadata({ video, channel }: MetadataProps) {
  // Format date to Indonesian locale
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('id-ID', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format duration
  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format view count with K/M suffixes
  const formatViewCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="space-y-4">
      {/* Channel Info */}
      {channel && (
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          {channel.logo_url ? (
            <img
              src={channel.logo_url}
              alt={channel.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 font-semibold text-lg">
                {channel.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900">{channel.name}</h3>
            {channel.description && (
              <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                {channel.description}
              </p>
            )}
            <a
              href={`/dashboard/channels/${channel.id}`}
              className="text-xs text-primary hover:underline mt-1 inline-block"
            >
              View Channel →
            </a>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
            <Calendar className="h-3 w-3" />
            Uploaded
          </div>
          <p className="font-medium text-sm text-gray-900">{formatDate(video.created_at)}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
            <Clock className="h-3 w-3" />
            Duration
          </div>
          <p className="font-medium text-sm text-gray-900">{formatDuration(video.duration)}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
            <Eye className="h-3 w-3" />
            Views
          </div>
          <p className="font-medium text-sm text-gray-900">{formatViewCount(video.view_count)}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
            <RefreshCw className="h-3 w-3" />
            Updated
          </div>
          <p className="font-medium text-sm text-gray-900">{formatDate(video.updated_at)}</p>
        </div>
      </div>

      {/* Tags */}
      {video.tags && video.tags.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-600 mb-2">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {video.tags.slice(0, 10).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs hover:bg-gray-300"
              >
                {tag}
              </Badge>
            ))}
            {video.tags.length > 10 && (
              <Badge variant="outline" className="bg-transparent">
                +{video.tags.length - 10} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
