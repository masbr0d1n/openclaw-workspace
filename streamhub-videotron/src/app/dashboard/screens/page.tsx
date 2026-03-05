/**
 * Screens Main Page - Videotron
 * Screen management with API integration
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Monitor, ListVideo, Layers, Plus, Search, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { screenService } from '@/services/screen-service';
import { ScreenCard } from '@/components/screen/ScreenCard';
import type { Screen, ScreenCreate, ScreenUpdate } from '@/types';

export default function ScreensPage() {
  const router = useRouter();
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formData, setFormData] = useState<ScreenCreate>({
    name: '',
    device_id: '',
    location: '',
    resolution: '',
  });

  // Fetch screens from API
  const fetchScreens = useCallback(async () => {
    try {
      setLoading(true);
      const response = await screenService.getScreens();
      setScreens(response.screens || []);
    } catch (error) {
      console.error('Failed to fetch screens:', error);
      toast.error('Failed to load screens');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchScreens();
  }, [fetchScreens]);

  // Auto-refresh every 30 seconds (heartbeat simulation)
  useEffect(() => {
    const interval = setInterval(fetchScreens, 30000);
    return () => clearInterval(interval);
  }, [fetchScreens]);

  // Filter screens
  const filteredScreens = screens.filter((screen) => {
    const matchesSearch = screen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         screen.device_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         screen.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || screen.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: screens.length,
    online: screens.filter(s => s.status === 'online').length,
    offline: screens.filter(s => s.status === 'offline').length,
    maintenance: screens.filter(s => s.status === 'maintenance').length,
  };

  // Handle add screen
  const handleAddScreen = async () => {
    try {
      await screenService.createScreen(formData);
      toast.success('Screen created successfully');
      setAddDialogOpen(false);
      setFormData({ name: '', device_id: '', location: '', resolution: '' });
      fetchScreens();
    } catch (error) {
      console.error('Failed to create screen:', error);
      toast.error('Failed to create screen');
    }
  };

  // Handle edit screen
  const handleEditScreen = async () => {
    if (!selectedScreen) return;
    
    try {
      const updateData: ScreenUpdate = {
        name: formData.name,
        device_id: formData.device_id,
        location: formData.location,
        resolution: formData.resolution,
      };
      await screenService.updateScreen(selectedScreen.id, updateData);
      toast.success('Screen updated successfully');
      setEditDialogOpen(false);
      setSelectedScreen(null);
      setFormData({ name: '', device_id: '', location: '', resolution: '' });
      fetchScreens();
    } catch (error) {
      console.error('Failed to update screen:', error);
      toast.error('Failed to update screen');
    }
  };

  // Handle delete screen
  const handleDeleteScreen = async (id: string) => {
    if (!confirm('Are you sure you want to delete this screen?')) return;
    
    try {
      await screenService.deleteScreen(id);
      toast.success('Screen deleted successfully');
      fetchScreens();
    } catch (error) {
      console.error('Failed to delete screen:', error);
      toast.error('Failed to delete screen');
    }
  };

  // Handle edit click
  const handleEditClick = (screen: Screen) => {
    setSelectedScreen(screen);
    setFormData({
      name: screen.name,
      device_id: screen.device_id,
      location: screen.location || '',
      resolution: screen.resolution || '',
    });
    setEditDialogOpen(true);
  };

  // Open add dialog
  const openAddDialog = () => {
    setFormData({ name: '', device_id: '', location: '', resolution: '' });
    setAddDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Monitor className="h-8 w-8 text-primary" />
            Screens Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage devices and screen groups
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchScreens} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Device
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.online} online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
            <Monitor className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.online}</div>
            <p className="text-xs text-muted-foreground">
              Active devices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline</CardTitle>
            <Monitor className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.offline}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Monitor className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.maintenance}</div>
            <p className="text-xs text-muted-foreground">
              Under maintenance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search screens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Screens Grid */}
        <div className="lg:col-span-2">
          {loading ? (
            <Card>
              <CardContent className="py-8">
                <div className="flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              </CardContent>
            </Card>
          ) : filteredScreens.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No screens found</p>
                <Button variant="link" onClick={openAddDialog}>Add your first screen</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredScreens.map((screen) => (
                <ScreenCard
                  key={screen.id}
                  screen={screen}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteScreen}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions & Groups Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/screens/devices">
                <Button variant="outline" className="w-full justify-start">
                  <ListVideo className="mr-2 h-4 w-4" />
                  Device List
                </Button>
              </Link>
              <Link href="/dashboard/screens/groups">
                <Button variant="outline" className="w-full justify-start">
                  <Layers className="mr-2 h-4 w-4" />
                  Screen Groups
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Screen Groups</CardTitle>
              <CardDescription>Organized screen collections</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/screens/groups">
                <Button variant="outline" className="w-full">
                  View All Groups
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Screen Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Screen</DialogTitle>
            <DialogDescription>
              Register a new screen device
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Screen Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Lobby TV"
              />
            </div>
            <div>
              <Label htmlFor="device_id">Device ID</Label>
              <Input
                id="device_id"
                value={formData.device_id}
                onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
                placeholder="e.g., device-001"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Main Lobby"
              />
            </div>
            <div>
              <Label htmlFor="resolution">Resolution</Label>
              <Input
                id="resolution"
                value={formData.resolution}
                onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                placeholder="e.g., 1920x1080"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddScreen}>Create Screen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Screen Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Screen</DialogTitle>
            <DialogDescription>
              Update screen information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Screen Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-device_id">Device ID</Label>
              <Input
                id="edit-device_id"
                value={formData.device_id}
                onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-resolution">Resolution</Label>
              <Input
                id="edit-resolution"
                value={formData.resolution}
                onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditScreen}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
