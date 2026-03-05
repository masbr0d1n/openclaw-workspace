/**
 * Videos Page - YouTube Style Grid Layout
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { videoService } from '@/services';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Checkbox,
} from '@/components/ui/checkbox';
import { Loader2, Plus, MoreHorizontal, Edit, Trash2, Search, ChevronLeft, ChevronRight, Clock, Upload, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { VideoDetailModal } from '@/components/video-detail-modal';
import { VideoPlayerModal } from '@/components/video-player-modal';
import { VideoPreviewCard } from '@/components/video-preview-card';
import type { Video } from '@/types';
import { formatDuration, formatDate } from '@/lib/utils';

const ITEMS_PER_PAGE = 20; // 5 columns x 4 rows

export default function VideosPage() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // State for filters and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // State for dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // State for selected videos
  const [selectedVideos, setSelectedVideos] = useState<Set<number>>(new Set());
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtube_id: '',
    channel_id: 0,
    thumbnail_url: '',
  });

  // Upload form state
  const [uploadData, setUploadData] = useState({
    title: '',
    channel_id: 0,
    description: '',
    file: null as File | null,
    category_new: '',
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Channels not used in Videotron
  const channels: any[] = [];

  // Fetch videos with filters and pagination
  const { data: videosResponse, isLoading } = useQuery({
    queryKey: ['videos', searchQuery, selectedCategory, currentPage],
    queryFn: async () => {
      const skip = (currentPage - 1) * ITEMS_PER_PAGE;
      const params: any = {
        skip,
        limit: ITEMS_PER_PAGE,
      };

      if (searchQuery) params.search = searchQuery;
      if (selectedCategory !== 'all') params.category = selectedCategory;

      const response = await videoService.getAllWithParams(params);
      return response;
    },
    enabled: isAuthenticated,
  });

  const videos = videosResponse?.data || [];
  const totalVideos = (videosResponse as any)?.count || 0;
  const totalPages = Math.ceil(totalVideos / ITEMS_PER_PAGE);

  // Create video mutation (YouTube ID)
  const createMutation = useMutation({
    mutationFn: videoService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast.success('Video created successfully');
      setCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create video';
      toast.error(message);
    },
  });

  // Upload video mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/v1/videos/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: data,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast.success('Video uploaded and processed successfully!');
      setUploadDialogOpen(false);
      resetUploadForm();
      setUploadProgress(0);
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to upload video';
      toast.error(message);
      setIsUploading(false);
      setUploadProgress(0);
    },
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('channel_id', uploadData.channel_id.toString());
    if (uploadData.description) {
      formData.append('description', uploadData.description);
    }
    if (uploadData.file) {
      formData.append('file', uploadData.file);
    }

    // Simulate upload progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      if (progress <= 90) {
        setUploadProgress(progress);
      }
    }, 200);

    uploadMutation.mutate(formData, {
      onSettled: () => {
        clearInterval(progressInterval);
        setUploadProgress(100);
      },
    });
  };

  // Update video mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      videoService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast.success('Video updated successfully');
      setEditDialogOpen(false);
      setSelectedVideo(null);
      resetForm();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update video';
      toast.error(message);
    },
  });

  // Delete video mutation
  const deleteMutation = useMutation({
    mutationFn: videoService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast.success('Video deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedVideo(null);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete video';
      toast.error(message);
    },
  });

  // Handle form submission
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVideo) {
      updateMutation.mutate({
        id: selectedVideo.id,
        data: formData,
      });
    }
  };

  const handleDelete = () => {
    if (selectedVideo) {
      deleteMutation.mutate(selectedVideo.id);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedVideos.size === 0) return;
    
    const idsToDelete = Array.from(selectedVideos);
    console.log('[BATCH DELETE] Starting batch delete for:', idsToDelete);
    
    // Tampilkan loading
    toast.loading(`Deleting ${idsToDelete.length} video(s)...`);
    
    try {
      // Delete all selected videos one by one
      for (const id of idsToDelete) {
        console.log(`[BATCH DELETE] Deleting video ${id}...`);
        await videoService.delete(id);
      }
      
      console.log('[BATCH DELETE] All videos deleted successfully!');
      
      // Refresh dan close
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast.success(`${idsToDelete.length} video(s) deleted successfully`);
      setSelectedVideos(new Set());
      setDeleteDialogOpen(false);
    } catch (error: any) {
      console.error('[BATCH DELETE] Error:', error);
      const message = error.response?.data?.message || 'Failed to delete videos';
      toast.error(message);
    }
  };

  // Handle video selection
  const handleSelectVideo = (videoId: number) => {
    const newSelected = new Set(selectedVideos);
    if (newSelected.has(videoId)) {
      newSelected.delete(videoId);
    } else {
      newSelected.add(videoId);
    }
    setSelectedVideos(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedVideos.size === videos.length) {
      setSelectedVideos(new Set());
    } else {
      setSelectedVideos(new Set(videos.map((v: Video) => v.id)));
    }
  };

  // Handler untuk batch delete yang akan dipanggil dari dialog
  const confirmBatchDelete = async () => {
    console.log('[CONFIRM DELETE] Starting batch delete...');
    await handleDeleteSelected();
  };

  const resetUploadForm = () => {
    setUploadData({
      title: '',
      channel_id: 0,
      description: '',
      file: null,
      category_new: '',
    });
    setUploadProgress(0);
    setIsUploading(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      youtube_id: '',
      channel_id: 0,
      thumbnail_url: '',
    });
  };

  const openEditDialog = (video: Video) => {
    setSelectedVideo(video);
    setFormData({
      title: video.title,
      description: video.description || '',
      youtube_id: video.youtube_id,
      channel_id: video.channel_id,
      thumbnail_url: video.thumbnail_url || '',
    });
    setEditDialogOpen(true);
  };

  const openDetailDialog = (video: Video) => {
    setSelectedVideo(video);
    setDetailDialogOpen(true);
  };

  const closeDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedVideo(null);
  };

  const openDeleteDialog = (video: Video) => {
    setSelectedVideo(video);
    setDeleteDialogOpen(true);
  };

  // Get category for video (not used in Videotron)
  const getVideoCategory = (video: Video): string => {
    return 'uncategorized';
  };

  // Get channel name for video (not used in Videotron)
  const getChannelName = (video: Video): string => {
    return 'Unknown';
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header with Upload button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Videos</h1>
          <p className="text-muted-foreground">
            Manage your video library
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Video
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>

        <Select
          value={selectedCategory}
          onValueChange={(value) => {
            setSelectedCategory(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="sport">Sport</SelectItem>
            <SelectItem value="entertainment">Entertainment</SelectItem>
            <SelectItem value="kids">Kids</SelectItem>
            <SelectItem value="knowledge">Knowledge</SelectItem>
            <SelectItem value="gaming">Gaming</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk actions */}
      {selectedVideos.size > 0 && (
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedVideos.size} video{selectedVideos.size > 1 ? 's' : ''} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              // Open delete confirmation dialog
              setDeleteDialogOpen(true);
            }}
          >
            Delete Selected
          </Button>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-muted-foreground">No videos found</p>
          <p className="text-sm text-muted-foreground">
            {searchQuery || selectedCategory !== 'all'
              ? 'Try adjusting your filters'
              : 'Upload your first video to get started'}
          </p>
        </div>
      ) : (
        <>
          {/* Videos Grid - YouTube Style */}
          <div className="space-y-4">
            {/* Select all checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedVideos.size === videos.length && videos.length > 0}
                onCheckedChange={handleSelectAll}
                aria-label={selectedVideos.size === videos.length && videos.length > 0 ? 'Deselect all videos' : 'Select all videos'}
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                {selectedVideos.size === videos.length && videos.length > 0
                  ? 'Deselect All'
                  : 'Select All'}
              </label>
            </div>

            {/* Grid - 5 columns x 4 rows per page */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {videos.map((video: Video) => (
                <div
                  key={video.id}
                  className={`relative group ${selectedVideos.has(video.id) ? 'ring-2 ring-primary rounded-lg' : ''}`}
                >
                  {/* Selection checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={selectedVideos.has(video.id)}
                      onCheckedChange={() => handleSelectVideo(video.id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${video.title}`}
                    />
                  </div>

                  {/* Actions menu on hover */}
                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 bg-black/80 hover:bg-black text-white"
                          aria-label="More options"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDetailDialog(video)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(video)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(video)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Video Preview Card with hover & click */}
                  <VideoPreviewCard 
                    video={video} 
                    category={getVideoCategory(video)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, totalVideos)} of {totalVideos}{' '}
                videos
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload Video</DialogTitle>
            <DialogDescription>
              Add a new video to your library
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube_id">YouTube ID *</Label>
              <Input
                id="youtube_id"
                value={formData.youtube_id}
                onChange={(e) =>
                  setFormData({ ...formData, youtube_id: e.target.value })
                }
                placeholder="e.g., dQw4w9WgXcQ"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel_id">Channel *</Label>
              <Select
                value={formData.channel_id.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, channel_id: parseInt(value) })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a channel" />
                </SelectTrigger>
                <SelectContent>
                  {channels.map((channel: any) => (
                    <SelectItem key={channel.id} value={channel.id.toString()}>
                      {channel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
              <Input
                id="thumbnail_url"
                value={formData.thumbnail_url}
                onChange={(e) =>
                  setFormData({ ...formData, thumbnail_url: e.target.value })
                }
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Upload Video
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
            <DialogDescription>
              Update video information
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-youtube_id">YouTube ID *</Label>
              <Input
                id="edit-youtube_id"
                value={formData.youtube_id}
                onChange={(e) =>
                  setFormData({ ...formData, youtube_id: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-channel_id">Channel *</Label>
              <Select
                value={formData.channel_id.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, channel_id: parseInt(value) })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a channel" />
                </SelectTrigger>
                <SelectContent>
                  {channels.map((channel: any) => (
                    <SelectItem key={channel.id} value={channel.id.toString()}>
                      {channel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-thumbnail_url">Thumbnail URL</Label>
              <Input
                id="edit-thumbnail_url"
                value={formData.thumbnail_url}
                onChange={(e) =>
                  setFormData({ ...formData, thumbnail_url: e.target.value })
                }
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload Video File Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Video File</DialogTitle>
            <DialogDescription>
              Upload MP4 video file (minimum 480p). Video will be processed automatically.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpload} className="space-y-4">
            {/* File Input */}
            <div className="space-y-2">
              <Label htmlFor="video-file">Video File (MP4, min 480p) *</Label>
              <Input
                id="video-file"
                type="file"
                accept="video/mp4"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadData({ ...uploadData, file });
                  }
                }}
                disabled={isUploading}
                required
              />
              {uploadData.file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {uploadData.file.name} ({(uploadData.file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="upload-title">Title *</Label>
              <Input
                id="upload-title"
                value={uploadData.title}
                onChange={(e) =>
                  setUploadData({ ...uploadData, title: e.target.value })
                }
                disabled={isUploading}
                required
              />
            </div>

            {/* Category - Dropdown + New Input */}
            <div className="space-y-2">
              <Label>Category *</Label>
              <div className="flex gap-2">
                <Select
                  value={selectedCategory === 'all' ? '' : selectedCategory}
                  onValueChange={(value) => {
                    if (value === 'new') {
                      // Focus on new category input
                      document.getElementById('new-category')?.focus();
                    } else {
                      setUploadData({ ...uploadData, category_new: value });
                    }
                  }}
                  disabled={isUploading}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sport">Sport</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="kids">Kids</SelectItem>
                    <SelectItem value="knowledge">Knowledge</SelectItem>
                    <SelectItem value="gaming">Gaming</SelectItem>
                    <SelectItem value="new">
                      <span className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Create new
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="new-category"
                  placeholder="Or new category"
                  value={uploadData.category_new === selectedCategory ? '' : uploadData.category_new}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, category_new: e.target.value })
                  }
                  disabled={isUploading}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Select existing category or type new one
              </p>
            </div>

            {/* Channel Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="upload-channel">Channel *</Label>
              <Select
                value={uploadData.channel_id.toString() || ''}
                onValueChange={(value) =>
                  setUploadData({ ...uploadData, channel_id: parseInt(value) })
                }
                disabled={isUploading}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  {channels.map((channel: any) => (
                    <SelectItem key={channel.id} value={channel.id.toString()}>
                      {channel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="upload-description">Description</Label>
              <Input
                id="upload-description"
                value={uploadData.description}
                onChange={(e) =>
                  setUploadData({ ...uploadData, description: e.target.value })
                }
                disabled={isUploading}
              />
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading and processing...</span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This may take a few moments depending on video size
                </p>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setUploadDialogOpen(false);
                  resetUploadForm();
                }}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUploading || !uploadData.file || !uploadData.title || !uploadData.channel_id}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Video
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedVideos.size > 0 
                ? `Delete ${selectedVideos.size} Video${selectedVideos.size > 1 ? 's' : ''}?`
                : 'Delete Video?'
              }
            </DialogTitle>
            <DialogDescription>
              {selectedVideos.size > 0
                ? `Are you sure you want to delete ${selectedVideos.size} selected video${selectedVideos.size > 1 ? 's' : ''}? This action cannot be undone.`
                : `Are you sure you want to delete "${selectedVideo?.title}"? This action cannot be undone.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={selectedVideos.size > 0 ? handleDeleteSelected : handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {selectedVideos.size > 0 
                ? `Delete ${selectedVideos.size} Video${selectedVideos.size > 1 ? 's' : ''}`
                : 'Delete'
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Detail Dialog */}
      <VideoDetailModal
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        video={selectedVideo}
      />
    </div>
  );
}
