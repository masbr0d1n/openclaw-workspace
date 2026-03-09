/**
 * Content Modal Actions Component
 * Action buttons for edit, delete, share, download, and toggle active
 */

'use client';

import { Edit, Trash2, Share2, Download, CheckCircle, Circle, Loader2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ActionsProps } from './types';

export function ContentModalActions({
  video,
  onEdit,
  onDelete,
  onShare,
  onToggleActive,
  onDownload,
  isDeleting,
  isToggling,
}: ActionsProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Settings className="h-4 w-4 text-primary" />
        Actions
      </h3>
      <div className="flex flex-wrap gap-3">
        {/* Edit Button */}
        <Button
          onClick={onEdit}
          className="bg-primary hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium action-btn shadow-md"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Details
        </Button>

        {/* Share Button */}
        <Button
          onClick={onShare}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-lg font-medium action-btn shadow-sm"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>

        {/* Download Button */}
        <Button
          onClick={onDownload}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-lg font-medium action-btn shadow-sm"
          disabled={!video.video_url}
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>

        {/* Toggle Active Button */}
        <Button
          onClick={onToggleActive}
          disabled={isToggling}
          className={
            video.is_active
              ? 'bg-success hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium action-btn shadow-md'
              : 'bg-gray-600 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg font-medium'
          }
        >
          {isToggling ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : video.is_active ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Active
            </>
          ) : (
            <>
              <Circle className="h-4 w-4 mr-2" />
              Inactive
            </>
          )}
        </Button>

        {/* Delete Button */}
        <Button
          onClick={onDelete}
          disabled={isDeleting}
          variant="outline"
          className="border-gray-300 text-danger hover:bg-red-50 hover:border-red-300 px-5 py-2.5 rounded-lg font-medium action-btn shadow-sm ml-auto"
        >
          {isDeleting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
