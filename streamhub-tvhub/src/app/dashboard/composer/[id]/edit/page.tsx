/**
 * Edit Playlist Page - Table layout for Playlist Order, Card layout for Video Library
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { playlistService } from '@/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { VideoPlayerModal } from '@/components/video-player-modal';
import { ThumbnailImage } from '@/components/thumbnail-image';
import { Loader2, ArrowLeft, GripVertical, Trash2, Save, Plus, Eye, Clock, Calendar, Shield, X } from 'lucide-react';
import { toast } from 'sonner';
import { formatDuration, formatDate, formatViewCount } from '@/lib/utils';
import { Video } from '@/types/video.types';
import { Playlist } from '@/types/playlist.types';

export default function EditPlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const playlistId = parseInt(params.id as string);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVideos, setSelectedVideos] = useState<Video[]>([]);
  const [playlistOrder, setPlaylistOrder] = useState<Video[]>([]);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  // Fetch playlist
  const { data: playlist, isLoading: playlistLoading } = useQuery({
    queryKey: ['playlist', playlistId],
    queryFn: async () => {
      const response = await playlistService.getById(playlistId);
      return response.data;
    },
  });

  // Initialize playlist videos when playlist data loads
  useEffect(() => {
    if (playlist?.videos) {
      setSelectedVideos(playlist.videos);
      setPlaylistOrder(playlist.videos);
    }
  }, [playlist]);

  // Fetch all videos
  const { data: allVideos, isLoading: videosLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const response = await fetch('/api/v1/videos');
      const json = await response.json();
      return json.data || [];
    },
  });

  // Update playlist mutation
  const updatePlaylistMutation = useMutation({
    mutationFn: async (data: { name: string; video_ids: number[] }) => {
      await playlistService.updatePlaylistVideos(playlistId, data.video_ids);
    },
  });

  // Calculate total duration of playlist
  const totalDuration = useMemo(() => {
    return playlistOrder.reduce((acc, video) => acc + (video.duration || 0), 0);
  }, [playlistOrder]);

  // Calculate end time based on start time + total duration
  const calculateEndTime = () => {
    if (!playlist?.start_time || totalDuration === 0) return null;
    const startTime = new Date(playlist.start_time);
    const endTime = new Date(startTime.getTime() + totalDuration * 1000);
    return endTime;
  };

  const endTime = calculateEndTime();

  // Filter videos
  const filteredVideos = allVideos?.filter((video: Video) =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Handle toggle video selection
  const handleToggleVideo = (video: Video) => {
    setSelectedVideos(prev => {
      const exists = prev.some(v => v.id === video.id);
      if (exists) {
        const newSelected = prev.filter(v => v.id !== video.id);
        setPlaylistOrder(current => current.filter(v => v.id !== video.id));
        return newSelected;
      } else {
        setPlaylistOrder(current => [...current, video]);
        return [...prev, video];
      }
    });
    setUnsavedChanges(true);
  };

  // Handle drag reorder (table row)
  const moveVideo = (fromIndex: number, toIndex: number) => {
    setPlaylistOrder(prev => {
      const newOrder = [...prev];
      const [removed] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, removed);
      return newOrder;
    });
    setUnsavedChanges(true);
  };

  // Save playlist
  const handleSave = async () => {
    if (!playlist) return;

    try {
      await updatePlaylistMutation.mutateAsync({
        name: playlist.name,
        video_ids: playlistOrder.map(v => v.id),
      });

      toast.success('Playlist updated successfully');
      setUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update playlist');
    }
  };

  // Back button with unsaved check
  const handleBack = () => {
    if (unsavedChanges) {
      setSaveDialogOpen(true);
    } else {
      router.push('/dashboard/composer');
    }
  };

  // Remove video from playlist
  const handleRemoveVideo = (videoId: number) => {
    setSelectedVideos(prev => prev.filter(v => v.id !== videoId));
    setPlaylistOrder(prev => prev.filter(v => v.id !== videoId));
    setUnsavedChanges(true);
  };

  // Open video preview
  const handlePreview = (video: Video) => {
    setPreviewVideo(video);
    setShowPlayer(true);
  };

  // Calculate airtime for a video in the playlist
  const calculateAirtime = (index: number): string => {
    if (!playlist?.start_time || index < 0) return '-';
    
    const startTime = new Date(playlist.start_time);
    const durationBefore = playlistOrder
      .slice(0, index)
      .reduce((acc, v) => acc + (v.duration || 0), 0);
    const videoStartTime = new Date(startTime.getTime() + durationBefore * 1000);
    
    return videoStartTime.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (playlistLoading || videosLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Edit Playlist</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {playlist?.name} - Arrange your videos
          </p>
        </div>
        <Button onClick={handleSave} disabled={updatePlaylistMutation.isPending}>
          {updatePlaylistMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Playlist Info Section */}
      {playlist && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>Scheduled Start</span>
              </div>
              <div className="font-medium mt-1">
                {formatDate(playlist.start_time)}
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>End Time (Auto)</span>
              </div>
              <div className="font-medium mt-1">
                {endTime ? formatDate(endTime) : '-'}
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Plus className="h-4 w-4" />
                <span>Total Videos</span>
              </div>
              <div className="font-medium mt-1">
                {playlistOrder.length} videos
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>Total Duration</span>
              </div>
              <div className="font-medium mt-1">
                {formatDuration(totalDuration)}
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Shield className="h-4 w-4" />
                <span>Permission</span>
              </div>
              <div className="mt-1">
                <Badge variant="outline">Draft</Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout - 70% Playlist Order, 30% Video Library */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* LEFT Column - Playlist Order (TABLE) - 7 columns (70%) */}
        <div className="lg:col-span-7 space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Playlist Order</h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {playlistOrder.length} videos • {formatDuration(totalDuration)}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Drag rows to reorder videos in playlist
          </p>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Airtime</TableHead>
                  <TableHead>Thumbnail</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="w-24">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {playlistOrder.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Plus className="h-8 w-8 opacity-50" />
                        <p>No videos in playlist</p>
                        <p className="text-sm">Select videos from the library</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  playlistOrder.map((video, index) => (
                    <TableRow
                      key={video.id}
                      className="cursor-move hover:bg-gray-50 dark:hover:bg-gray-700"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', index.toString());
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                        moveVideo(fromIndex, index);
                      }}
                    >
                      <TableCell>
                        <GripVertical className="h-4 w-4 text-gray-400" />
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {calculateAirtime(index)}
                      </TableCell>
                      <TableCell>
                        <div className="w-20 h-12 rounded overflow-hidden bg-gray-200">
                          <ThumbnailImage
                            src={video.thumbnail_url || '/placeholder-video.png'}
                            alt={video.title}
                            className="w-full h-full object-cover"
                            width={80}
                            height={48}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{video.title}</TableCell>
                      <TableCell className="text-sm">
                        {video.duration ? formatDuration(video.duration) : '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveVideo(video.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* RIGHT Column - Video Library (CARDS) - 3 columns (30%) */}
        <div className="lg:col-span-3 space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Video Library</h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {filteredVideos.length} videos
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Click cards to add to playlist
          </p>

          {/* Search */}
          <div className="mb-4">
            <Input
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Video Cards Grid */}
          <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto">
            {filteredVideos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No videos found
              </div>
            ) : (
              filteredVideos.map((video: Video) => {
                const isSelected = selectedVideos.some(sv => sv.id === video.id);
                
                return (
                  <div
                    key={video.id}
                    className={`relative group cursor-pointer rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => handleToggleVideo(video)}
                  >
                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 z-10">
                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                          <X className="h-3 w-3" />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4 p-4">
                      {/* Thumbnail */}
                      <div className="w-32 h-20 rounded overflow-hidden bg-gray-200 flex-shrink-0">
                        <ThumbnailImage
                          src={video.thumbnail_url || '/placeholder-video.png'}
                          alt={video.title}
                          className="w-full h-full object-cover"
                          width={128}
                          height={80}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm line-clamp-2 mb-2">
                          {video.title}
                        </h3>
                        {video.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                            {video.description}
                          </p>
                        )}

                        {/* Metadata */}
                        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{video.duration ? formatDuration(video.duration) : '-'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3 text-blue-500" />
                            <span>{formatViewCount(video.view_count)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreview(video);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {isSelected && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveVideo(video.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Unsaved Changes Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes to this playlist. Do you want to save them?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSaveDialogOpen(false);
                router.push('/dashboard/composer');
              }}
            >
              Discard
            </Button>
            <Button
              onClick={() => {
                setSaveDialogOpen(false);
                handleSave();
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Player Modal */}
      {previewVideo && (
        <VideoPlayerModal
          open={showPlayer}
          onOpenChange={setShowPlayer}
          video={previewVideo}
        />
      )}
    </div>
  );
}
