/**
 * Content Modal Share Dialog Component
 * Share options for video
 */

'use client';

import { useState } from 'react';
import { Link, Twitter, Facebook, Linkedin, Copy, Check, ExternalLink, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { ShareDialogProps } from './types';

export function ContentModalShareDialog({
  open,
  onOpenChange,
  video,
  onShare,
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const videoUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/dashboard/videos/${video.id}`
    : '';

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: Copy,
      color: 'bg-gray-600 hover:bg-gray-700',
      action: async () => {
        try {
          await navigator.clipboard.writeText(videoUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          onShare('copy');
        } catch (error) {
          console.error('Failed to copy:', error);
        }
      },
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      action: () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(video.title)}&url=${encodeURIComponent(videoUrl)}`;
        window.open(url, '_blank');
        onShare('twitter');
      },
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`;
        window.open(url, '_blank');
        onShare('facebook');
      },
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      action: () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(videoUrl)}`;
        window.open(url, '_blank');
        onShare('linkedin');
      },
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Share Video
          </DialogTitle>
          <DialogDescription>
            Share &quot;{video.title}&quot; with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Share Options */}
          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((option) => (
              <Button
                key={option.name}
                onClick={option.action}
                className={`${option.color} text-white w-full h-auto py-3`}
              >
                <option.icon className="h-5 w-5 mr-2" />
                {option.name}
              </Button>
            ))}
          </div>

          {/* URL Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Video URL</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-600 truncate">
                {videoUrl}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(videoUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                    onShare('copy');
                  } catch (error) {
                    console.error('Failed to copy:', error);
                  }
                }}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
