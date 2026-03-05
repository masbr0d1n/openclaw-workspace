/**
 * Screen Groups Page - Videotron
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Layers, Monitor, Plus, Edit, Trash2, ArrowLeft, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ScreenGroup {
  id: string;
  name: string;
  location: string;
  screenCount: number;
  tenant: string;
  status: 'active' | 'inactive';
}

export default function ScreenGroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<ScreenGroup[]>([
    {
      id: 'main-lobby',
      name: 'Main Lobby Group',
      location: 'Main Lobby',
      screenCount: 15,
      tenant: 'Mall Central Jakarta',
      status: 'active',
    },
    {
      id: 'food-court',
      name: 'Food Court Group',
      location: 'Food Court',
      screenCount: 20,
      tenant: 'Mall Central Jakarta',
      status: 'active',
    },
    {
      id: 'cinema',
      name: 'Cinema Area Group',
      location: 'Cinema Area',
      screenCount: 10,
      tenant: 'Mall Central Jakarta',
      status: 'inactive',
    },
  ]);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ScreenGroup | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    tenant: '',
  });

  const activeCount = groups.filter(g => g.status === 'active').length;
  const totalScreens = groups.reduce((acc, g) => acc + g.screenCount, 0);

  const handleAddGroup = () => {
    const newGroup: ScreenGroup = {
      id: formData.name.toLowerCase().replace(/\s+/g, '-'),
      name: formData.name,
      location: formData.location,
      tenant: formData.tenant,
      screenCount: 0,
      status: 'active',
    };
    setGroups([...groups, newGroup]);
    setAddDialogOpen(false);
    setFormData({ name: '', location: '', tenant: '' });
    toast.success('Screen group created successfully');
  };

  const handleEditGroup = () => {
    if (selectedGroup) {
      setGroups(groups.map(g =>
        g.id === selectedGroup.id
          ? { ...g, ...formData }
          : g
      ));
      setEditDialogOpen(false);
      setSelectedGroup(null);
      setFormData({ name: '', location: '', tenant: '' });
      toast.success('Screen group updated successfully');
    }
  };

  const handleDeleteGroup = (id: string) => {
    setGroups(groups.filter(g => g.id !== id));
    toast.success('Screen group deleted successfully');
  };

  const toggleStatus = (id: string) => {
    setGroups(groups.map(g =>
      g.id === id
        ? { ...g, status: g.status === 'active' ? 'inactive' as 'inactive' : 'active' as 'active' }
        : g
    ));
    toast.success('Group status toggled');
  };

  const openEditDialog = (group: ScreenGroup) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      location: group.location,
      tenant: group.tenant,
    });
    setEditDialogOpen(true);
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
                <label className="text-sm font-medium">Group Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Main Lobby Group"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Main Lobby"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tenant</label>
                <Input
                  value={formData.tenant}
                  onChange={(e) => setFormData({ ...formData, tenant: e.target.value })}
                  placeholder="e.g., Mall Central Jakarta"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddGroup}>Create Group</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groups.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeCount} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Screens</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScreens}</div>
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
            <div className="text-2xl font-bold">
              {new Set(groups.map(g => g.location)).size}
            </div>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Screens</TableHead>
                <TableHead>Status</TableHead>
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
                  <TableCell>{group.location}</TableCell>
                  <TableCell>{group.tenant}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-gray-400" />
                      <span>{group.screenCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={group.status === 'active' ? 'default' : 'secondary'}>
                      {group.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(group.id)}
                      >
                        {group.status === 'active' ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
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
              <label className="text-sm font-medium">Group Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tenant</label>
              <Input
                value={formData.tenant}
                onChange={(e) => setFormData({ ...formData, tenant: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditGroup}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
