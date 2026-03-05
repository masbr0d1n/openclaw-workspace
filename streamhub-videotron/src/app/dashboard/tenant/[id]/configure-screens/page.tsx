/**
 * Configure Screens Page
 */

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2, Monitor, Play, Pause, Settings, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Screen {
  id: number;
  name: string;
  location: string;
  resolution: string;
  status: 'online' | 'offline';
  currentContent: string;
}

export default function ConfigureScreensPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = parseInt(params.id as string);

  const [screens, setScreens] = useState<Screen[]>([
    {
      id: 1,
      name: 'Screen 1 - Main Lobby',
      location: 'Main Lobby',
      resolution: '1920x1080',
      status: 'online',
      currentContent: 'Advertisement Loop A',
    },
    {
      id: 2,
      name: 'Screen 2 - Main Lobby',
      location: 'Main Lobby',
      resolution: '1920x1080',
      status: 'online',
      currentContent: 'Promo Video',
    },
    {
      id: 3,
      name: 'Screen 1 - Food Court',
      location: 'Food Court',
      resolution: '3840x2160',
      status: 'offline',
      currentContent: 'No Content',
    },
    {
      id: 4,
      name: 'Screen 1 - Cinema',
      location: 'Cinema Area',
      resolution: '1920x1080',
      status: 'online',
      currentContent: 'Movie Schedule',
    },
  ]);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    resolution: '',
    currentContent: '',
  });

  const locations = ['Main Lobby', 'Food Court', 'Cinema Area'];
  const resolutions = ['1920x1080', '2560x1440', '3840x2160', '1280x720'];

  const handleAddScreen = () => {
    // Auto-generate screen name based on location
    const existingScreensInLocation = screens.filter(s => s.location === formData.location);
    const nextNumber = existingScreensInLocation.length + 1;
    const autoName = `Screen ${nextNumber} - ${formData.location}`;

    const newScreen: Screen = {
      id: screens.length + 1,
      name: formData.name || autoName,
      location: formData.location,
      resolution: formData.resolution,
      status: 'offline',
      currentContent: formData.currentContent || 'No Content',
    };
    setScreens([...screens, newScreen]);
    setAddDialogOpen(false);
    setFormData({ name: '', location: '', resolution: '', currentContent: '' });
    toast.success(`Screen "${newScreen.name}" added successfully`);
  };

  const handleEditScreen = () => {
    if (selectedScreen) {
      setScreens(screens.map(s => 
        s.id === selectedScreen.id 
          ? { ...s, ...formData } 
          : s
      ));
      setEditDialogOpen(false);
      setSelectedScreen(null);
      setFormData({ name: '', location: '', resolution: '', currentContent: '' });
      toast.success('Screen updated successfully');
    }
  };

  const handleDeleteScreen = (id: number) => {
    setScreens(screens.filter(s => s.id !== id));
    toast.success('Screen deleted successfully');
  };

  const toggleScreenStatus = (id: number) => {
    setScreens(screens.map(s => 
      s.id === id 
        ? { ...s, status: s.status === 'online' ? 'offline' : 'online' as 'online' | 'offline' } 
        : s
    ));
    toast.success('Screen status toggled');
  };

  const openEditDialog = (screen: Screen) => {
    setSelectedScreen(screen);
    setFormData({
      name: screen.name,
      location: screen.location,
      resolution: screen.resolution,
      currentContent: screen.currentContent,
    });
    setEditDialogOpen(true);
  };

  const onlineCount = screens.filter(s => s.status === 'online').length;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/tenant/${tenantId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Configure Screens</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage screens for this tenant
            </p>
          </div>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Screen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Screen</DialogTitle>
              <DialogDescription>
                Configure a new screen for this tenant
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Screen Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Screen 1 - Main Lobby"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(loc => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="resolution">Resolution</Label>
                <Select value={formData.resolution} onValueChange={(value) => setFormData({ ...formData, resolution: value })}>
                  <SelectTrigger id="resolution">
                    <SelectValue placeholder="Select resolution" />
                  </SelectTrigger>
                  <SelectContent>
                    {resolutions.map(res => (
                      <SelectItem key={res} value={res}>{res}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="content">Current Content</Label>
                <Input
                  id="content"
                  value={formData.currentContent}
                  onChange={(e) => setFormData({ ...formData, currentContent: e.target.value })}
                  placeholder="e.g., Advertisement Loop A"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddScreen}>Add Screen</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Screens</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{screens.length}</div>
            <p className="text-xs text-muted-foreground">
              Configured screens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onlineCount}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{screens.length - onlineCount}</div>
            <p className="text-xs text-muted-foreground">
              Not connected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations.length}</div>
            <p className="text-xs text-muted-foreground">
              Coverage areas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Screens Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Screens</CardTitle>
          <CardDescription>Configure and manage individual screens</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Screen Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Resolution</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Content</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {screens.map((screen) => (
                <TableRow key={screen.id}>
                  <TableCell className="font-medium">{screen.name}</TableCell>
                  <TableCell>{screen.location}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{screen.resolution}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={screen.status === 'online' ? 'default' : 'secondary'}>
                      {screen.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{screen.currentContent}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleScreenStatus(screen.id)}
                      >
                        {screen.status === 'online' ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(screen)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteScreen(screen.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Screen</DialogTitle>
            <DialogDescription>
              Update screen configuration
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
              <Label htmlFor="edit-location">Location</Label>
              <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                <SelectTrigger id="edit-location">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-resolution">Resolution</Label>
              <Select value={formData.resolution} onValueChange={(value) => setFormData({ ...formData, resolution: value })}>
                <SelectTrigger id="edit-resolution">
                  <SelectValue placeholder="Select resolution" />
                </SelectTrigger>
                <SelectContent>
                  {resolutions.map(res => (
                    <SelectItem key={res} value={res}>{res}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-content">Current Content</Label>
              <Input
                id="edit-content"
                value={formData.currentContent}
                onChange={(e) => setFormData({ ...formData, currentContent: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditScreen}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
