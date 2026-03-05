/**
 * Composer Page (Playlist Management)
 * Create and manage streaming playlists
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playlistService } from '@/services';
import { channelService } from '@/services';
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
  DialogTrigger,
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
import { Loader2, Plus, MoreHorizontal, Play, Trash2, Calendar, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import type { Playlist, Channel } from '@/types';
import { formatDate } from '@/lib/utils';

export default function ComposerPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // State for dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Form state
  const [playlistName, setPlaylistName] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [startTime, setStartTime] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  // Fetch channels (only when authenticated)
  const { data: channels, isLoading: channelsLoading } = useQuery({
    queryKey: ['channels'],
    queryFn: async () => {
      const response = await channelService.getAll();
      return response.data || [];
    },
    enabled: isAuthenticated,
  });

  // Fetch playlists (only when authenticated)
  const { data: playlists, isLoading: playlistsLoading } = useQuery({
    queryKey: ['playlists'],
    queryFn: async () => {
      const response = await playlistService.getAll();
      return response.data || [];
    },
    enabled: isAuthenticated,
  });

  // Create playlist mutation
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; channel_id: number; start_time: string }) => {
      return await playlistService.create(data);
    },
    onSuccess: () => {
      toast.success('Playlist created successfully');
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      handleResetForm();
      setCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create playlist');
    },
  });

  // Delete playlist mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await playlistService.delete(id);
    },
    onSuccess: () => {
      toast.success('Playlist deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      setDeleteDialogOpen(false);
      setSelectedPlaylist(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete playlist');
    },
  });

  // Handle create playlist
  const handleCreatePlaylist = () => {
    if (!playlistName.trim()) {
      toast.error('Please enter playlist name');
      return;
    }
    if (!selectedChannel) {
      toast.error('Please select a channel');
      return;
    }
    if (!startTime) {
      toast.error('Please select start time');
      return;
    }

    createMutation.mutate({
      name: playlistName,
      channel_id: parseInt(selectedChannel),
      start_time: startTime,
    });
  };

  // Handle delete playlist
  const handleDeletePlaylist = () => {
    if (selectedPlaylist) {
      deleteMutation.mutate(selectedPlaylist.id);
    }
  };

  // Reset form
  const handleResetForm = () => {
    setPlaylistName('');
    setSelectedChannel('');
    setStartTime('');
  };

  // Get channel name by ID
  const getChannelName = (channelId: number) => {
    const channel = channels?.find((c: Channel) => c.id === channelId);
    return channel?.name || 'Unknown Channel';
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const styles = {
      scheduled: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      live: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return styles[status as keyof typeof styles] || styles.scheduled;
  };

  if (playlistsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Composer</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage streaming playlists
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Playlist</DialogTitle>
              <DialogDescription>
                Schedule a new streaming playlist for your channel
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Playlist Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Playlist Name</Label>
                <Input
                  id="name"
                  placeholder="Enter playlist name"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                />
              </div>

              {/* Channel Selection */}
              <div className="space-y-2">
                <Label htmlFor="channel">Channel</Label>
                <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                  <SelectTrigger id="channel">
                    <SelectValue placeholder="Select a channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {channels?.map((channel: Channel) => (
                      <SelectItem key={channel.id} value={channel.id.toString()}>
                        {channel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Time */}
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleResetForm}
                disabled={createMutation.isPending}
              >
                Reset
              </Button>
              <Button
                onClick={handleCreatePlaylist}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Playlist'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Playlists Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Channel</TableHead>
              <TableHead>Playlist Name</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Videos</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {playlists && playlists.length > 0 ? (
              playlists.map((playlist: Playlist) => (
                <TableRow key={playlist.id}>
                  <TableCell className="font-medium">
                    {getChannelName(playlist.channel_id)}
                  </TableCell>
                  <TableCell>{playlist.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(playlist.start_time)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                        playlist.status
                      )}`}
                    >
                      {playlist.status}
                    </span>
                  </TableCell>
                  <TableCell>{playlist.video_count} videos</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/dashboard/composer/${playlist.id}/edit`)}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Playlist
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Play className="h-4 w-4 mr-2" />
                          Start Stream
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedPlaylist(playlist);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Calendar className="h-8 w-8" />
                    <p>No playlists found. Create your first playlist to get started.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Playlist</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedPlaylist?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePlaylist}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
