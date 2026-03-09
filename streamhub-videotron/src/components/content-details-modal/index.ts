/**
 * Content Details Modal Components
 * Unified modal for displaying comprehensive video information
 */

export { ContentDetailsModal } from './content-details-modal';
export { ContentModalVideoPlayer } from './content-modal-video-player';
export { ContentModalMetadata } from './content-modal-metadata';
export { ContentModalSpecs } from './content-modal-specs';
export { ContentModalActions } from './content-modal-actions';
export { ContentModalRelated } from './content-modal-related';
export { ContentModalDeleteDialog } from './content-modal-delete-dialog';
export { ContentModalShareDialog } from './content-modal-share-dialog';

export type {
  ContentDetailsModalProps,
  ContentDetailsModalData,
  ChannelInfo,
  QualityLabel,
  VideoPlayerProps,
  MetadataProps,
  SpecsProps,
  ActionsProps,
  RelatedContentProps,
  ShareDialogProps,
  DeleteDialogProps,
} from './types';
