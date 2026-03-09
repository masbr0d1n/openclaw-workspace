/**
 * Content Modal Related Content Component
 * Displays related videos grid
 */

'use client';

import { useState, useEffect } from 'react';
import { Eye, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { RelatedContentProps } from './types';
import type { Video } from '@/types';

export function ContentModalRelated({
  currentVideo,
  allVideos,
  onVideoSelect,
}: RelatedContentProps) {
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Filter related videos based on category or channel
    // This is a simple client-side implementation
    // In production, you might want to fetch from an API endpoint
    const getRelatedVideos = () => {
      setIsLoading(true);
      
      // Simulate async loading
      setTimeout(() => {
        const related = allVideos
          .filter(
            (v) =>
              v.id !== currentVideo.id &&
              (v.channel_id === currentVideo.channel_id) // Same channel
          )
          .slice(0, 4); // Limit to 4 videos

        setRelatedVideos(related);
        setIsLoading(false);
      }, 300);
    };

    if (allVideos && allVideos.length > 0) {
      getRelatedVideos();
    }
  }, [currentVideo.id, currentVideo.channel_id, allVideos]);

  const formatViewCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Related Content
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="w-full aspect-video rounded-lg" />
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-2/3 h-3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedVideos.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        Related Content
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {relatedVideos.map((relatedVideo) => (
          <div
            key={relatedVideo.id}
            onClick={() => onVideoSelect(relatedVideo.id)}
            className="related-card bg-white rounded-lg overflow-hidden shadow-md cursor-pointer border border-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <div className="aspect-video bg-gray-200 relative">
              {relatedVideo.thumbnail_url ? (
                <img
                  src={relatedVideo.thumbnail_url}
                  alt={relatedVideo.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
              {relatedVideo.duration && (
                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(relatedVideo.duration)}
                </span>
              )}
            </div>
            <div className="p-3">
              <h4 className="font-medium text-sm text-gray-900 line-clamp-2 mb-2">
                {relatedVideo.title}
              </h4>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {formatViewCount(relatedVideo.view_count)}
                </span>
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                  {new Date(relatedVideo.created_at).toLocaleDateString('id-ID', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
