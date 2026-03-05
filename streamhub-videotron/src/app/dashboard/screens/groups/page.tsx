/**
 * Screen Groups Page - Videotron
 * Screen group management with API integration
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Layers, Monitor, Plus, Edit, Trash2, ArrowLeft, MapPin, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { screenService } from '@/services/screen-service';
import type { ScreenGroup, Screen } from '@/types';

export default function ScreenGroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<ScreenGroup[]>([]);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ScreenGroup | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    screen_ids: [] as string[],
  });

  // Fetch data from API
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [groupsResponse, screensResponse] = await Promise.all([
        screenService.getScreenGroups(),
        screenService.getScreens(),
      ]);
      setGroups(groupsResponse.groups || []);
      setScreens(screensResponse.screens || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate stats
  const totalGroups = groups.length;
  const totalScreensInGroups = groups.reduce((acc, group) => acc + group.screen_ids.length, 0);
  const uniqueLocations = new Set(screens.map(s => s.location).filter(Boolean)).size;

  // Handle add group
  const handleAddGroup = async () => {
    try {
      await screenService.createScreenGroup({
        name: formData.name,
        screen_ids: formData.screen_ids,
      });
      toast.success('Screen group created successfully');
      setAddDialogOpen(false);
      setFormData({ name: '', screen_ids: [] });
      fetchData();
    } catch (error) {
      console.error('Failed to create group:', error);
      toast.error('Failed to create screen group');
    }
  };

  // Handle delete group
  const handleDeleteGroup = async (id: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;
    
    // Note: Backend doesn't have delete endpoint yet, this is a placeholder
    toast.info('Delete functionality will be available soon');
    // await screenService.deleteScreenGroup(id); // TODO: Implement when backend ready
  };

  // Open edit dialog
  const openEditDialog = (group: ScreenGroup) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      screen_ids: group.screen_ids || [],
    });
    setEditDialogOpen(true);
  };

  // Handle screen selection
  const toggleScreenSelection = (screenId: string) => {
    setFormData({
      ...formData,
      screen_ids: formData.screen_ids.includes(screenId)
        ? formData.screen_ids.filter(id => id !== screenId)
        : [...formData.screen_ids, screenId],
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/screens">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Layers className="h-8 w-8 text-primary" />
              Screen Groups
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Organize screens into manageable groups
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Screen Group</DialogTitle>
                <DialogDescription>
                  Organize screens into a group
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Group Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Main Lobby Group"
                  />
                </div>
                <div>
                  <Label>Select Screens</Label>
                  <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-2">
                    {screens.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No screens available. Create screens first.
                      </p>
                    ) : (
                      screens.map((screen) => (
                        <div
                          key={screen.id}
                          className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                            formData.screen_ids.includes(screen.id)
                              ? 'bg-primary/10 border-primary'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 border'
                          }`}
                          onClick={() => toggleScreenSelection(screen.id)}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                              formData.screen_ids.includes(screen.id)
                                ? 'bg-primary border-primary'
                                : 'border-gray-300'
                            }`}>
                              {formData.screen_ids.includes(screen.id) && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm font-medium">{screen.name}</span>
                          </div>
                          <Badge variant={screen.status === 'online' ? 'default' : 'secondary'}>
                            {screen.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.screen_ids.length} screen(s) selected
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddGroup} disabled={!formData.name || formData.screen_ids.length === 0}>
                  Create Group
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGroups}</div>
            <p className="text-xs text-muted-foreground">
              Active groups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Screens</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScreensInGroups}</div>
            <p className="text-xs text-muted-foreground">
              Across all groups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueLocations}</div>
            <p className="text-xs text-muted-foreground">
              Locations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Groups Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Screen Groups</CardTitle>
          <CardDescription>Manage and organize screen groups</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No screen groups yet</p>
              <Button variant="link" onClick={() => setAddDialogOpen(true)}>Create your first group</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group Name</TableHead>
                  <TableHead>Screens</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{group.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-gray-400" />
                        <span>{group.screen_ids?.length || 0} screens</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {new Date(group.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(group)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGroup(group.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Screen Group</DialogTitle>
            <DialogDescription>
              Update group information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Group Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Select Screens</Label>
              <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-2">
                {screens.map((screen) => (
                  <div
                    key={screen.id}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                      formData.screen_ids.includes(screen.id)
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 border'
                    }`}
                    onClick={() => toggleScreenSelection(screen.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        formData.screen_ids.includes(screen.id)
                          ? 'bg-primary border-primary'
                          : 'border-gray-300'
                      }`}>
                        {formData.screen_ids.includes(screen.id) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium">{screen.name}</span>
                    </div>
                    <Badge variant={screen.status === 'online' ? 'default' : 'secondary'}>
                      {screen.status}
                    </Badge>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formData.screen_ids.length} screen(s) selected
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.info('Update functionality will be available soon');
              setEditDialogOpen(false);
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
