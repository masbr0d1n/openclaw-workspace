/**
 * Enhanced Video Modal with Video Details & Specifications
 * Supports uploaded videos (with metadata) and YouTube videos
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Clock, Eye, Youtube, Upload, Film, Hd, Gauge, Cpu, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface VideoModalProps {
  open: boolean;
  onClose: () => void;
  content: any;
  categories: any[];
}

export function VideoModal({ open, onClose, content, categories }: VideoModalProps) {
  const [videoSpecs, setVideoSpecs] = useState<any>(null);
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const [youtubeError, setYoutubeError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Get video proxy URL for uploaded videos
  const getVideoProxyUrl = (videoUrl: string) => {
    if (!videoUrl) return null;
    return `/api/videos/file${videoUrl}`;
  };

  // Extract video specifications from uploaded video
  const loadVideoSpecs = async (videoUrl: string) => {
    if (!videoUrl || content?.youtubeId) return;

    setLoadingSpecs(true);
    try {
      const proxyUrl = getVideoProxyUrl(videoUrl);
      const response = await fetch(proxyUrl!, { method: 'HEAD' });
      
      if (response.ok) {
        const contentType = response.headers.get('content-type') || 'video/mp4';
        const contentLength = response.headers.get('content-length');
        const sizeMB = contentLength ? (parseInt(contentLength) / 1024 / 1024).toFixed(2) : null;

        // Try to get video metadata from the video element
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = proxyUrl!;

        video.onloadedmetadata = () => {
          setVideoSpecs({
            codec: contentType.replace('video/', '').toUpperCase(),
            duration: video.duration,
            width: video.videoWidth,
            height: video.videoHeight,
            size: sizeMB,
            fps: null, // Browser can't reliably get FPS
            bitrate: null // Would need backend FFmpeg for this
          });
          setLoadingSpecs(false);
          URL.revokeObjectURL(video.src);
        };

        video.onerror = () => {
          setVideoSpecs({
            codec: contentType.replace('video/', '').toUpperCase(),
            size: sizeMB,
            duration: null,
            width: null,
            height: null,
            fps: null,
            bitrate: null
          });
          setLoadingSpecs(false);
          URL.revokeObjectURL(video.src);
        };
      }
    } catch (error) {
      console.error('Failed to load video specs:', error);
      setLoadingSpecs(false);
    }
  };

  // Load specs when modal opens with uploaded video
  useEffect(() => {
    if (open && content?.videoUrl && !content?.youtubeId) {
      loadVideoSpecs(content.videoUrl);
    }
  }, [open, content]);

  // Format duration
  const formatDuration = (seconds: number) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = Math.round((seconds % 60) * 100) / 100;
    return `${mins}m ${secs.toFixed(2)}s`;
  };

  // Format resolution
  const formatResolution = (width: number, height: number) => {
    if (!width || !height) return '-';
    if (height >= 2160) return '4K';
    if (height >= 1440) return '2K';
    if (height >= 1080) return 'Full HD';
    if (height >= 720) return 'HD';
    if (height >= 480) return 'SD';
    return `${width}x${height}`;
  };

  if (!content) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-8">
              <DialogTitle className="text-xl">{content.title}</DialogTitle>
              {content.description && (
                <p className="text-sm text-muted-foreground mt-2">{content.description}</p>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Video Player */}
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          {content.youtubeId ? (
            <div className="w-full h-full flex items-center justify-center">
              {youtubeError ? (
                <div className="text-center p-6">
                  <Youtube className="h-12 w-12 mx-auto mb-4 text-red-500" />
                  <p className="text-white mb-2">YouTube video unavailable</p>
                  <p className="text-sm text-gray-400 mb-4">
                    This video may be restricted or removed
                  </p>
                  <a
                    href={`https://www.youtube.com/watch?v=${content.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Watch on YouTube →
                  </a>
                </div>
              ) : (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube-nocookie.com/embed/${content.youtubeId}?rel=0&modestbranding=1`}
                  title={content.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  onError={() => setYoutubeError(true)}
                />
              )}
            </div>
          ) : content.videoUrl ? (
            <video
              ref={videoRef}
              width="100%"
              height="100%"
              controls
              autoPlay
              className="w-full h-full"
            >
              {getVideoProxyUrl(content.videoUrl) && (
                <source 
                  src={getVideoProxyUrl(content.videoUrl)!} 
                  type="video/mp4" 
                />
              )}
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="text-center">
                <Film className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No video available</p>
              </div>
            </div>
          )}
        </div>

        {/* Video Details & Specifications */}
        <div className="space-y-4 mt-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Created:</span>
              <span className="font-medium">{content.createdAt || '-'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Views:</span>
              <span className="font-medium">{content.views?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {content.youtubeId ? (
                <>
                  <Youtube className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Source:</span>
                  <span className="font-medium">YouTube</span>
                </>
              ) : content.videoUrl ? (
                <>
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Source:</span>
                  <span className="font-medium">Uploaded</span>
                </>
              ) : null}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-medium">
                {formatDuration(content.duration || videoSpecs?.duration)}
              </span>
            </div>
          </div>

          {/* Category Badge */}
          {content.category && (
            <div>
              <Badge className={
                categories.find((c) => c.value === content.category)?.color || 'bg-gray-500'
              }>
                {categories.find((c) => c.value === content.category)?.label || content.category}
              </Badge>
            </div>
          )}

          {/* Technical Specifications (Uploaded Videos Only) */}
          {content.videoUrl && !content.youtubeId && (
            <div className="border rounded-lg p-4 bg-muted/30">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                Technical Specifications
              </h4>

              {loadingSpecs ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : videoSpecs ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  {/* Codec */}
                  <div className="flex items-center gap-2 p-2 bg-background rounded">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground text-xs">Codec</p>
                      <p className="font-medium">{videoSpecs.codec || '-'}</p>
                    </div>
                  </div>

                  {/* Resolution */}
                  <div className="flex items-center gap-2 p-2 bg-background rounded">
                    <Hd className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground text-xs">Resolution</p>
                      <p className="font-medium">
                        {formatResolution(videoSpecs.width, videoSpecs.height)}
                      </p>
                      {videoSpecs.width && videoSpecs.height && (
                        <p className="text-xs text-muted-foreground">
                          {videoSpecs.width}x{videoSpecs.height}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Duration (from metadata) */}
                  <div className="flex items-center gap-2 p-2 bg-background rounded">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground text-xs">Duration</p>
                      <p className="font-medium">
                        {formatDuration(videoSpecs.duration)}
                      </p>
                    </div>
                  </div>

                  {/* File Size */}
                  {videoSpecs.size && (
                    <div className="flex items-center gap-2 p-2 bg-background rounded">
                      <Gauge className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground text-xs">File Size</p>
                        <p className="font-medium">{videoSpecs.size} MB</p>
                      </div>
                    </div>
                  )}

                  {/* FPS (placeholder - need backend FFmpeg) */}
                  <div className="flex items-center gap-2 p-2 bg-background rounded opacity-50">
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground text-xs">Frame Rate</p>
                      <p className="font-medium text-xs">N/A*</p>
                    </div>
                  </div>

                  {/* Bitrate (placeholder - need backend FFmpeg) */}
                  <div className="flex items-center gap-2 p-2 bg-background rounded opacity-50">
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground text-xs">Bitrate</p>
                      <p className="font-medium text-xs">N/A*</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No specifications available
                </p>
              )}

              {/* Note about FFmpeg */}
              <p className="text-xs text-muted-foreground mt-3">
                * FPS and bitrate require FFmpeg processing on the backend. 
                Currently showing basic metadata from video headers.
              </p>
            </div>
          )}

          {/* YouTube Info */}
          {content.youtubeId && (
            <div className="border rounded-lg p-4 bg-muted/30">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Youtube className="h-4 w-4" />
                YouTube Video Information
              </h4>
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">YouTube ID:</span> {content.youtubeId}</p>
                <p className="text-xs text-muted-foreground">
                  Video is embedded using YouTube Privacy Enhanced (youtube-nocookie.com) mode.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
