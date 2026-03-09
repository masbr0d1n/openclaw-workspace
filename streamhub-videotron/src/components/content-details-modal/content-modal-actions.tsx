/**
 * Content Modal Actions Component
 * Action buttons for edit, delete, share, download, and toggle active
 */

'use client';

import { Edit, Trash2, Share2, Download, CheckCircle, Circle, Loader2 } from 'lucide-react';
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
        <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Actions
      </h3>
      <div className="flex flex-wrap gap-3">
        {/* Edit Button */}
        <Button
          onClick={onEdit}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Details
        </Button>

        {/* Share Button */}
        <Button
          onClick={onShare}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>

        {/* Download Button */}
        <Button
          onClick={onDownload}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
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
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-gray-600 hover:bg-gray-700 text-white'
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
          className="border-gray-300 text-red-600 hover:bg-red-50 hover:border-red-300 ml-auto"
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
