/**
 * Channels Page
 * Complete channel management with table, create, edit, delete
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { channelService } from '@/services';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Loader2, Plus, MoreHorizontal, Power, PowerOff, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Channel } from '@/types';
import { formatDuration } from '@/lib/utils';

export default function ChannelsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // State for dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    category: 'sport' | 'entertainment' | 'kids' | 'knowledge' | 'gaming';
    description: string;
    logo_url: string;
  }>({
    name: '',
    category: 'entertainment',
    description: '',
    logo_url: '',
  });

  // Fetch channels
  const { data: channelsResponse, isLoading } = useQuery({
    queryKey: ['channels'],
    queryFn: () => channelService.getAll(),
  });

  const channels = channelsResponse?.data || [];

  // Create channel mutation
  const createMutation = useMutation({
    mutationFn: channelService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Channel created successfully');
      setCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create channel';
      toast.error(message);
    },
  });

  // Update channel mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      channelService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Channel updated successfully');
      setEditDialogOpen(false);
      setSelectedChannel(null);
      resetForm();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update channel';
      toast.error(message);
    },
  });

  // Delete channel mutation
  const deleteMutation = useMutation({
    mutationFn: channelService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Channel deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedChannel(null);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete channel';
      toast.error(message);
    },
  });

  // Toggle streaming mutation
  const toggleStreamingMutation = useMutation({
    mutationFn: ({ id, isOnAir }: { id: number; isOnAir: boolean }) =>
      isOnAir ? channelService.turnOffAir(id) : channelService.turnOnAir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Streaming status updated');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update streaming';
      toast.error(message);
    },
  });

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedChannel) {
      // Update
      updateMutation.mutate({ id: selectedChannel.id, data: formData });
    } else {
      // Create
      createMutation.mutate(formData);
    }
  };

  // Handle edit
  const handleEdit = (channel: Channel) => {
    setSelectedChannel(channel);
    setFormData({
      name: channel.name,
      category: channel.category,
      description: channel.description || '',
      logo_url: channel.logo_url || '',
    });
    setEditDialogOpen(true);
  };

  // Handle delete
  const handleDelete = (channel: Channel) => {
    setSelectedChannel(channel);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (selectedChannel) {
      deleteMutation.mutate(selectedChannel.id);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      category: 'entertainment',
      description: '',
      logo_url: '',
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Channels</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your streaming channels
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Channel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Channel</DialogTitle>
              <DialogDescription>
                Create a new streaming channel
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Channel Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="My Awesome Channel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="sport">Sport</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="kids">Kids</option>
                    <option value="knowledge">Knowledge</option>
                    <option value="gaming">Gaming</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Channel description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input
                    id="logo_url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCreateDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Channels Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : channels.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
          <p className="text-lg font-semibold mb-2">No channels found</p>
          <p className="text-sm">Create your first channel to get started!</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Streaming</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {channels.map((channel) => (
                <TableRow key={channel.id}>
                  <TableCell className="font-medium">{channel.name}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800">
                      {channel.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      channel.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                    }`}>
                      {channel.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        channel.is_on_air ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                      <span className="text-sm">
                        {channel.is_on_air ? 'On Air' : 'Off Air'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => toggleStreamingMutation.mutate({
                            id: channel.id,
                            isOnAir: channel.is_on_air,
                          })}
                          disabled={toggleStreamingMutation.isPending}
                        >
                          {channel.is_on_air ? (
                            <>
                              <PowerOff className="mr-2 h-4 w-4" />
                              Turn Off
                            </>
                          ) : (
                            <>
                              <Power className="mr-2 h-4 w-4" />
                              Turn On
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(channel)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(channel)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Channel</DialogTitle>
            <DialogDescription>
              Update channel information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Channel Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <select
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="sport">Sport</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="kids">Kids</option>
                  <option value="knowledge">Knowledge</option>
                  <option value="gaming">Gaming</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Channel</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedChannel?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedChannel(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
