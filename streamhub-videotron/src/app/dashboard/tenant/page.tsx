/**
 * Tenant Page - For Videotron Category
 */

'use client';

import { useState } from 'react';
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
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Building2, Plus, Edit, Trash2, Settings, Users, Monitor } from 'lucide-react';
import { toast } from 'sonner';

export default function TenantPage() {
  const [tenants, setTenants] = useState([
    {
      id: 1,
      name: 'Mall Central Jakarta',
      location: 'Jakarta Pusat',
      status: 'active',
      screens: 45,
      logo: 'MCJ',
    },
    {
      id: 2,
      name: 'Grand Indonesia',
      location: 'Jakarta Pusat',
      status: 'active',
      screens: 120,
      logo: 'GI',
    },
    {
      id: 3,
      name: 'Plaza Indonesia',
      location: 'Jakarta Pusat',
      status: 'maintenance',
      screens: 30,
      logo: 'PI',
    },
  ]);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<typeof tenants[0] | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    screens: 0,
    logo: '',
  });

  const handleAddTenant = () => {
    const newTenant = {
      id: tenants.length + 1,
      ...formData,
      status: 'active' as const,
    };
    setTenants([...tenants, newTenant]);
    setAddDialogOpen(false);
    setFormData({ name: '', location: '', screens: 0, logo: '' });
    toast.success('Tenant added successfully');
  };

  const handleEditTenant = () => {
    if (selectedTenant) {
      setTenants(tenants.map(t => 
        t.id === selectedTenant.id 
          ? { ...t, ...formData } 
          : t
      ));
      setEditDialogOpen(false);
      setSelectedTenant(null);
      setFormData({ name: '', location: '', screens: 0, logo: '' });
      toast.success('Tenant updated successfully');
    }
  };

  const handleDeleteTenant = (id: number) => {
    setTenants(tenants.filter(t => t.id !== id));
    toast.success('Tenant deleted successfully');
  };

  const openEditDialog = (tenant: typeof tenants[0]) => {
    setSelectedTenant(tenant);
    setFormData({
      name: tenant.name,
      location: tenant.location,
      screens: tenant.screens,
      logo: tenant.logo,
    });
    setEditDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Tenant Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage videotron tenants and their screen configurations
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Tenant</DialogTitle>
              <DialogDescription>
                Create a new tenant for videotron network
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Tenant Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Mall Central Jakarta"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Jakarta Pusat"
                />
              </div>
              <div>
                <Label htmlFor="screens">Number of Screens</Label>
                <Input
                  id="screens"
                  type="number"
                  value={formData.screens}
                  onChange={(e) => setFormData({ ...formData, screens: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 50"
                />
              </div>
              <div>
                <Label htmlFor="logo">Logo Code</Label>
                <Input
                  id="logo"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="e.g., MCJ"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTenant}>Add Tenant</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenants.length}</div>
            <p className="text-xs text-muted-foreground">
              Active deployments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Screens</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tenants.reduce((acc, t) => acc + t.screens, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all tenants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tenants.filter(t => t.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Online and running
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tenants Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tenants</CardTitle>
          <CardDescription>Manage and monitor videotron tenants</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Tenant Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Screens</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <div className="w-10 h-10 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold">
                      {tenant.logo}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link 
                      href={`/dashboard/tenant/${tenant.id}`}
                      className="font-medium hover:underline text-primary"
                    >
                      {tenant.name}
                    </Link>
                  </TableCell>
                  <TableCell>{tenant.location}</TableCell>
                  <TableCell>
                    <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'}>
                      {tenant.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-gray-400" />
                      {tenant.screens}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(tenant)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTenant(tenant.id)}
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
            <DialogTitle>Edit Tenant</DialogTitle>
            <DialogDescription>
              Update tenant information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Tenant Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              <Label htmlFor="edit-screens">Number of Screens</Label>
              <Input
                id="edit-screens"
                type="number"
                value={formData.screens}
                onChange={(e) => setFormData({ ...formData, screens: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="edit-logo">Logo Code</Label>
              <Input
                id="edit-logo"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTenant}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
