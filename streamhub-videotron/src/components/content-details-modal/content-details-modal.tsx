/**
 * Content Details Modal - Main Component
 * Unified modal for displaying comprehensive video information
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Info, Database, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { videoService } from '@/services';
import { ContentModalVideoPlayer } from './content-modal-video-player';
import { ContentModalMetadata } from './content-modal-metadata';
import { ContentModalSpecs } from './content-modal-specs';
import { ContentModalActions } from './content-modal-actions';
import { ContentModalRelated } from './content-modal-related';
import { ContentModalDeleteDialog } from './content-modal-delete-dialog';
import { ContentModalShareDialog } from './content-modal-share-dialog';
import type { ContentDetailsModalProps, ContentDetailsModalData } from './types';
import type { Video } from '@/types';

export function ContentDetailsModal({
  open,
  onOpenChange,
  videoId,
  allVideos = [],
}: ContentDetailsModalProps) {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch video details
  const { data: video, isLoading, error, refetch } = useQuery({
    queryKey: ['video', videoId],
    queryFn: async () => {
      if (!videoId) return null;
      const response = await videoService.getById(videoId);
      return response.data as ContentDetailsModalData;
    },
    enabled: open && videoId !== null,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update video mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return videoService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['video', videoId] });
    },
  });

  // Delete video mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => videoService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast.success('Video deleted successfully');
      setDeleteDialogOpen(false);
      onOpenChange(false);
      setIsDeleting(false);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete video';
      toast.error(message);
      setIsDeleting(false);
    },
  });

  // Handle toggle active
  const handleToggleActive = async () => {
    if (!video) return;

    setIsToggling(true);
    try {
      await updateMutation.mutateAsync({
        id: video.id,
        data: { is_active: !video.is_active } as any,
      });
      toast.success(`Video ${!video.is_active ? 'activated' : 'deactivated'}`);
      await refetch();
    } catch (error) {
      toast.error('Failed to update video status');
    } finally {
      setIsToggling(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!video) return;

    setIsDeleting(true);
    deleteMutation.mutate(video.id);
  };

  // Handle share
  const handleShare = (platform: string) => {
    toast.success(`Shared to ${platform}`);
    setShareDialogOpen(false);
  };

  // Handle edit
  const handleEdit = () => {
    toast.info('Opening edit form...');
    // In production, this would open an edit modal or navigate to edit page
  };

  // Handle download
  const handleDownload = () => {
    if (!video?.video_url) return;
    
    // Remove leading slash from video_url to avoid double slash
    const videoUrl = video.video_url.startsWith('/') 
      ? video.video_url.slice(1) 
      : video.video_url;
    
    const link = document.createElement('a');
    link.href = `/api/videos/file/${videoUrl}`;
    link.download = `${video.title}.mp4`;
    link.click();
    toast.success('Download started');
  };

  // Handle related video selection
  const handleRelatedVideoSelect = (newVideo: Video) => {
    toast.info('Loading related video...');
    onOpenChange(false);
    setTimeout(() => {
      toast.success(`Loaded: ${newVideo.title}`);
    }, 300);
  };

  // Get quality label
  const getQualityLabel = (width: number | null, height: number | null): string => {
    if (!width || !height) return '';
    if (height >= 2160) return '4K';
    if (height >= 1440) return '2K';
    if (height >= 1080) return 'Full HD';
    if (height >= 720) return 'HD';
    if (height >= 480) return 'SD';
    return '';
  };

  if (!open) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[1100px] max-h-[90vh] overflow-y-auto p-0 bg-white rounded-2xl shadow-2xl">
          {/* Header - Sticky */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between z-10">
            <div className="flex-1 pr-8">
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
              ) : video ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-semibold text-gray-900">{video.title}</h2>
                    <Badge className={video.is_active ? 'bg-success text-white' : 'bg-gray-500 text-white'}>
                      {video.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {video.width && video.height && (
                      <Badge className="bg-info text-white">
                        {getQualityLabel(video.width, video.height)}
                      </Badge>
                    )}
                    {video.is_live && (
                      <Badge className="bg-red-600 text-white">LIVE</Badge>
                    )}
                  </div>
                  {video.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {video.description}
                    </p>
                  )}
                </>
              ) : null}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">Failed to load video details</p>
                <Button onClick={() => refetch()}>Retry</Button>
              </div>
            ) : isLoading || !video ? (
              <div className="space-y-6">
                {/* Loading Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="aspect-video bg-gray-200 rounded-xl animate-pulse" />
                  </div>
                  <div className="space-y-4">
                    <div className="h-20 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="grid grid-cols-2 gap-3">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="h-32 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-20 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            ) : (
              <>
                {/* Video Player & Metadata Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Video Player */}
                  <div className="lg:col-span-2">
                    <ContentModalVideoPlayer
                      video={video}
                      isLoading={isLoading}
                      onError={() => toast.error('Failed to load video')}
                    />
                  </div>

                  {/* Metadata */}
                  <div>
                    <ContentModalMetadata video={video} channel={video.channel} />
                  </div>
                </div>

                {/* Technical Specifications */}
                <ContentModalSpecs video={video} />

                {/* Actions */}
                <ContentModalActions
                  video={video}
                  onEdit={handleEdit}
                  onDelete={() => setDeleteDialogOpen(true)}
                  onShare={() => setShareDialogOpen(true)}
                  onToggleActive={handleToggleActive}
                  onDownload={handleDownload}
                  isDeleting={isDeleting}
                  isToggling={isToggling}
                />

                {/* Related Content */}
                <ContentModalRelated
                  currentVideo={video}
                  allVideos={allVideos}
                  onVideoSelect={handleRelatedVideoSelect}
                />
              </>
            )}
          </div>

          {/* Footer - Sticky */}
          {!isLoading && video && (
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-3 flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Video ID: #{video.id}
                </span>
                <span className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  Source: {video.youtube_id ? 'YouTube' : 'Uploaded'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Last synced: 2 minutes ago
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ContentModalDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        video={video!}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />

      {/* Share Dialog */}
      <ContentModalShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        video={video!}
        onShare={handleShare}
      />
    </>
  );
}
