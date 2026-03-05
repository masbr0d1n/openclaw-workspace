/**
 * Sub-tenants View Page
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
import { ArrowLeft, MapPin, Monitor, Plus, Edit, Trash2, CheckCircle, XCircle, Building2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface SubTenant {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  screens: number;
  status: 'active' | 'inactive';
}

export default function SubTenantsViewPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = parseInt(params.id as string);

  const [subTenants, setSubTenants] = useState<SubTenant[]>([
    {
      id: 1,
      name: 'Main Lobby',
      address: 'Lobby Utama, Lt. 1',
      lat: -6.1937,
      lng: 106.8230,
      screens: 15,
      status: 'active',
    },
    {
      id: 2,
      name: 'Food Court',
      address: 'Lt. 3, Food Court Area',
      lat: -6.1940,
      lng: 106.8235,
      screens: 20,
      status: 'active',
    },
    {
      id: 3,
      name: 'Cinema Area',
      address: 'Lt. 5, XXI Cinema',
      lat: -6.1945,
      lng: 106.8228,
      screens: 10,
      status: 'inactive',
    },
  ]);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSubTenant, setSelectedSubTenant] = useState<SubTenant | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: 0,
    lng: 0,
    screens: 0,
  });

  const activeCount = subTenants.filter(st => st.status === 'active').length;
  const totalScreens = subTenants.reduce((acc, st) => acc + st.screens, 0);

  const handleAddSubTenant = () => {
    const newSubTenant: SubTenant = {
      id: subTenants.length + 1,
      name: formData.name,
      address: formData.address,
      lat: formData.lat,
      lng: formData.lng,
      screens: formData.screens,
      status: 'active',
    };
    setSubTenants([...subTenants, newSubTenant]);
    setAddDialogOpen(false);
    setFormData({ name: '', address: '', lat: 0, lng: 0, screens: 0 });
    toast.success('Sub-tenant added successfully');
  };

  const handleEditSubTenant = () => {
    if (selectedSubTenant) {
      setSubTenants(subTenants.map(st =>
        st.id === selectedSubTenant.id
          ? { ...st, ...formData }
          : st
      ));
      setEditDialogOpen(false);
      setSelectedSubTenant(null);
      setFormData({ name: '', address: '', lat: 0, lng: 0, screens: 0 });
      toast.success('Sub-tenant updated successfully');
    }
  };

  const handleDeleteSubTenant = (id: number) => {
    setSubTenants(subTenants.filter(st => st.id !== id));
    toast.success('Sub-tenant removed successfully');
  };

  const toggleStatus = (id: number) => {
    setSubTenants(subTenants.map(st =>
      st.id === id
        ? { ...st, status: st.status === 'active' ? 'inactive' as 'inactive' : 'active' as 'active' }
        : st
    ));
    toast.success('Status toggled');
  };

  const openEditDialog = (subTenant: SubTenant) => {
    setSelectedSubTenant(subTenant);
    setFormData({
      name: subTenant.name,
      address: subTenant.address,
      lat: subTenant.lat,
      lng: subTenant.lng,
      screens: subTenant.screens,
    });
    setEditDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/tenant/${tenantId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">All Sub-tenants</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage all locations for this tenant
            </p>
          </div>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Location</DialogTitle>
              <DialogDescription>
                Create a new sub-tenant location
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Location Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Main Lobby"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g., Lobby Utama, Lt. 1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="0.0001"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                    placeholder="-6.1937"
                  />
                </div>
                <div>
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="0.0001"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                    placeholder="106.8230"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="screens">Number of Screens</Label>
                <Input
                  id="screens"
                  type="number"
                  value={formData.screens}
                  onChange={(e) => setFormData({ ...formData, screens: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 15"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSubTenant}>Add Location</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subTenants.length}</div>
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
              Across all locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sub-tenants Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Locations</CardTitle>
          <CardDescription>Complete list of sub-tenant locations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Coordinates</TableHead>
                <TableHead>Screens</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subTenants.map((subTenant) => (
                <TableRow key={subTenant.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/tenant/${tenantId}/sub-tenant/${subTenant.id}`}
                      className="font-semibold hover:text-primary hover:underline flex items-center gap-2"
                    >
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {subTenant.name}
                    </Link>
                  </TableCell>
                  <TableCell>{subTenant.address}</TableCell>
                  <TableCell>
                    <div className="font-mono text-sm">
                      {subTenant.lat.toFixed(4)}, {subTenant.lng.toFixed(4)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-gray-400" />
                      <span>{subTenant.screens}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={subTenant.status === 'active' ? 'default' : 'secondary'}>
                      {subTenant.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(subTenant.id)}
                      >
                        {subTenant.status === 'active' ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(subTenant)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSubTenant(subTenant.id)}
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
            <DialogTitle>Edit Location</DialogTitle>
            <DialogDescription>
              Update sub-tenant information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Location Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-lat">Latitude</Label>
                <Input
                  id="edit-lat"
                  type="number"
                  step="0.0001"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit-lng">Longitude</Label>
                <Input
                  id="edit-lng"
                  type="number"
                  step="0.0001"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                />
              </div>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubTenant}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
