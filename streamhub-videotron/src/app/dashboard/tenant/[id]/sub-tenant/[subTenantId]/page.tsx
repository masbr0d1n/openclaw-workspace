/**
 * Sub-tenant Detail Page with Edit Capability
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Monitor, Edit, CheckCircle, XCircle, Save, Building2, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface SubTenantDetail {
  id: number;
  tenantId: number;
  tenantName: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  screens: number;
  status: 'active' | 'inactive';
}

export default function SubTenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = parseInt(params.id as string);
  const subTenantId = parseInt(params.subTenantId as string);

  const [subTenant, setSubTenant] = useState<SubTenantDetail | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: 0,
    lng: 0,
    screens: 0,
  });

  useEffect(() => {
    // Mock data - fetch from API in production
    const mockSubTenants: Record<string, SubTenantDetail> = {
      '1-1': {
        id: 1,
        tenantId: 1,
        tenantName: 'Mall Central Jakarta',
        name: 'Main Lobby',
        address: 'Lobby Utama, Lt. 1',
        lat: -6.1937,
        lng: 106.8230,
        screens: 15,
        status: 'active',
      },
      '1-2': {
        id: 2,
        tenantId: 1,
        tenantName: 'Mall Central Jakarta',
        name: 'Food Court',
        address: 'Lt. 3, Food Court Area',
        lat: -6.1940,
        lng: 106.8235,
        screens: 20,
        status: 'active',
      },
      '1-3': {
        id: 3,
        tenantId: 1,
        tenantName: 'Mall Central Jakarta',
        name: 'Cinema Area',
        address: 'Lt. 5, XXI Cinema',
        lat: -6.1945,
        lng: 106.8228,
        screens: 10,
        status: 'inactive',
      },
    };

    const data = mockSubTenants[`${tenantId}-${subTenantId}`];
    if (data) {
      setSubTenant(data);
      setFormData({
        name: data.name,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        screens: data.screens,
      });
    }
  }, [tenantId, subTenantId]);

  const handleSave = () => {
    if (!subTenant) return;

    const updated: SubTenantDetail = {
      ...subTenant,
      ...formData,
    };

    setSubTenant(updated);
    setIsEditing(false);
    toast.success('Sub-tenant updated successfully');
  };

  const handleCancel = () => {
    if (subTenant) {
      setFormData({
        name: subTenant.name,
        address: subTenant.address,
        lat: subTenant.lat,
        lng: subTenant.lng,
        screens: subTenant.screens,
      });
    }
    setIsEditing(false);
  };

  if (!subTenant) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/tenant/${tenantId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card className="mt-4">
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Sub-tenant not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/tenant/${tenantId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tenant
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-gray-400" />
              <h1 className="text-3xl font-bold">{subTenant.tenantName}</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {subTenant.address}
            </p>
          </div>
        </div>
        <Button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          variant={isEditing ? 'default' : 'outline'}
        >
          {isEditing ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="mr-2 h-4 w-4" />
              Edit Sub-tenant
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
              <CardDescription>Sub-tenant details and configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Location Name</Label>
                  {isEditing ? (
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  ) : (
                    <div className="text-lg font-semibold">{subTenant.name}</div>
                  )}
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Status</Label>
                  <Badge variant={subTenant.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                    {subTenant.status}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-500">Address</Label>
                {isEditing ? (
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                ) : (
                  <div className="text-sm">{subTenant.address}</div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Latitude</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.0001"
                      value={formData.lat}
                      onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                    />
                  ) : (
                    <div className="font-mono text-sm">{subTenant.lat.toFixed(6)}</div>
                  )}
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Longitude</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.0001"
                      value={formData.lng}
                      onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                    />
                  ) : (
                    <div className="font-mono text-sm">{subTenant.lng.toFixed(6)}</div>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-500">Number of Screens</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.screens}
                    onChange={(e) => setFormData({ ...formData, screens: parseInt(e.target.value) || 0 })}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-gray-400" />
                    <span className="text-lg font-semibold">{subTenant.screens}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Map */}
          <Card>
            <CardHeader>
              <CardTitle>Location Map</CardTitle>
              <CardDescription>Geographic location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-[300px] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-16 w-16 mx-auto text-primary mb-4" />
                    <p className="text-lg font-semibold">{subTenant.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {subTenant.lat.toFixed(4)}, {subTenant.lng.toFixed(4)}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm">
                      <Monitor className="h-4 w-4" />
                      {subTenant.screens} screens
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats & Actions */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Screens</span>
                <span className="font-semibold">{subTenant.screens}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <Badge variant={subTenant.status === 'active' ? 'default' : 'secondary'}>
                  {subTenant.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Tenant</span>
                <span className="font-semibold">{subTenant.tenantName}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/dashboard/tenant/${tenantId}/configure-screens`)}
              >
                <Monitor className="mr-2 h-4 w-4" />
                Configure Screens
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/dashboard/tenant/${tenantId}/view-all-devices`)}
              >
                <Monitor className="mr-2 h-4 w-4" />
                View Devices
              </Button>
            </CardContent>
          </Card>

          {/* Last Updated */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Created: Jan 15, 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Last updated: Feb 27, 2026</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel button when editing */}
      {isEditing && (
        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
