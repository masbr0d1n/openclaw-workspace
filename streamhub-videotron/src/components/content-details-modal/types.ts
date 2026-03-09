/**
 * Content Details Modal Types
 */

import type { Video } from '@/types';

export interface ChannelInfo {
  id: number;
  name: string;
  logo_url?: string;
  description?: string;
}

export type QualityLabel = '4K' | '2K' | 'Full HD' | 'HD' | 'SD' | string;

export interface ContentDetailsModalData extends Video {
  // Extended fields for modal
  channel?: ChannelInfo;
  tags?: string[];
  quality_label?: QualityLabel;
  file_size?: number; // in bytes
  related_videos?: Video[];
}

export interface ContentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: number | null;
  allVideos?: Video[]; // For related content filtering
}

export interface VideoPlayerProps {
  video: ContentDetailsModalData;
  isLoading: boolean;
  onError: () => void;
}

export interface MetadataProps {
  video: ContentDetailsModalData;
  channel?: ChannelInfo;
}

export interface SpecsProps {
  video: ContentDetailsModalData;
}

export interface ActionsProps {
  video: ContentDetailsModalData;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
  onToggleActive: () => void;
  onDownload: () => void;
  isDeleting: boolean;
  isToggling: boolean;
}

export interface RelatedContentProps {
  currentVideo: ContentDetailsModalData;
  allVideos: Video[];
  onVideoSelect: (videoId: number) => void;
}

export interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video: ContentDetailsModalData;
  onShare: (platform: string) => void;
}

export interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video: ContentDetailsModalData;
  onConfirm: () => void;
  isDeleting: boolean;
}
