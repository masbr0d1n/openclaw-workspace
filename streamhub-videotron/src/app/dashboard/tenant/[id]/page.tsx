/**
 * Tenant Detail Page with Sub-tenants and Map
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Monitor, Users, Building2, CheckCircle, XCircle, Settings } from 'lucide-react';
import Link from 'next/link';

interface SubTenant {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  screens: number;
  status: 'active' | 'inactive';
}

interface TenantDetail {
  id: number;
  name: string;
  location: string;
  status: 'active' | 'inactive';
  totalScreens: number;
  logo: string;
  subTenants: SubTenant[];
}

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = parseInt(params.id as string);

  const [tenant, setTenant] = useState<TenantDetail | null>(null);

  useEffect(() => {
    // Mock data - in production, fetch from API
    const mockTenants: Record<number, TenantDetail> = {
      1: {
        id: 1,
        name: 'Mall Central Jakarta',
        location: 'Jakarta Pusat',
        status: 'active',
        totalScreens: 45,
        logo: 'MCJ',
        subTenants: [
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
        ],
      },
      2: {
        id: 2,
        name: 'Grand Indonesia',
        location: 'Jakarta Pusat',
        status: 'active',
        totalScreens: 120,
        logo: 'GI',
        subTenants: [
          {
            id: 1,
            name: 'West Mall Atrium',
            address: 'West Mall, GF',
            lat: -6.1950,
            lng: 106.8220,
            screens: 40,
            status: 'active',
          },
          {
            id: 2,
            name: 'East Mall Atrium',
            address: 'East Mall, GF',
            lat: -6.1955,
            lng: 106.8230,
            screens: 50,
            status: 'active',
          },
          {
            id: 3,
            name: 'Skybridge',
            address: 'Bridge Level 3',
            lat: -6.1952,
            lng: 106.8225,
            screens: 30,
            status: 'active',
          },
        ],
      },
      3: {
        id: 3,
        name: 'Plaza Indonesia',
        location: 'Jakarta Pusat',
        status: 'inactive',
        totalScreens: 30,
        logo: 'PI',
        subTenants: [
          {
            id: 1,
            name: 'Main Entrance',
            address: 'GF, Main Entrance',
            lat: -6.1960,
            lng: 106.8240,
            screens: 15,
            status: 'inactive',
          },
          {
            id: 2,
            name: 'Extension Area',
            address: 'Extension Building, GF',
            lat: -6.1965,
            lng: 106.8245,
            screens: 15,
            status: 'inactive',
          },
        ],
      },
    };

    setTenant(mockTenants[tenantId] || null);
  }, [tenantId]);

  if (!tenant) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/tenant')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Tenant not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeSubTenants = tenant.subTenants.filter(st => st.status === 'active').length;
  const activeScreens = tenant.subTenants.reduce((acc, st) => st.status === 'active' ? acc + st.screens : acc, 0);
  const totalDevices = tenant.subTenants.reduce((acc, st) => acc + st.screens, 0);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/tenant')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tenants
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
              {tenant.logo}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{tenant.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {tenant.location}
              </p>
            </div>
          </div>
        </div>
        <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'} className="text-sm">
          {tenant.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Link href={`/dashboard/tenant/${tenant.id}/view-sub-tenants`} className="block">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sub-tenants</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tenant.subTenants.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeSubTenants} active
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/dashboard/tenant/${tenant.id}/configure-screens`} className="block">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Screens</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tenant.totalScreens}</div>
              <p className="text-xs text-muted-foreground">
                {activeScreens} active
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/dashboard/tenant/${tenant.id}/view-all-devices`} className="block">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDevices}</div>
              <p className="text-xs text-muted-foreground">
                All locations
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/dashboard/tenant/${tenant.id}/view-locations`} className="block">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Locations</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeSubTenants}</div>
              <p className="text-xs text-muted-foreground">
                out of {tenant.subTenants.length} locations
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/dashboard/tenant/${tenant.id}/view-subscription`} className="block">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscription</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{tenant.status}</div>
              <p className="text-xs text-muted-foreground">
                {tenant.status === 'active' ? 'Valid until Dec 2026' : 'Expired - Renew required'}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map */}
        <Card>
          <CardHeader>
            <CardTitle>Location Map</CardTitle>
            <CardDescription>Sub-tenant locations with screen distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              {/* Simple map visualization */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">Map View</p>
                  <p className="text-sm text-gray-500">
                    {tenant.subTenants.length} locations in {tenant.location}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {tenant.subTenants.map((st, i) => (
                      <div 
                        key={st.id}
                        className="px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors"
                        style={{
                          backgroundColor: st.status === 'active' ? '#22c55e' : '#94a3b8',
                          color: 'white',
                        }}
                      >
                        {st.name.split(' ')[0]}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Decorative grid lines */}
              <div className="absolute inset-0 opacity-10">
                <div className="w-full h-full" style={{
                  backgroundImage: `
                    linear-gradient(90deg, #000 1px, transparent 1px),
                    linear-gradient(#000 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sub-tenants List */}
        <Card>
          <CardHeader>
            <CardTitle>Sub-tenant Locations</CardTitle>
            <CardDescription>Detailed list of all locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {tenant.subTenants.map((subTenant) => (
                <div
                  key={subTenant.id}
                  className="p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <Link
                        href={`/dashboard/tenant/${tenant.id}/sub-tenant/${subTenant.id}`}
                        className="font-semibold flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {subTenant.name}
                      </Link>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {subTenant.address}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                        <span className="font-mono">
                          Lat: {subTenant.lat.toFixed(4)}
                        </span>
                        <span className="font-mono">
                          Lng: {subTenant.lng.toFixed(4)}
                        </span>
                      </div>
                    </div>
                    <Badge variant={subTenant.status === 'active' ? 'default' : 'secondary'}>
                      {subTenant.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Monitor className="h-4 w-4" />
                      <span>{subTenant.screens} screens</span>
                    </div>
                    {subTenant.status === 'active' && (
                      <div className="flex items-center gap-1 text-green-500 text-xs">
                        <CheckCircle className="h-3 w-3" />
                        Online
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage tenant settings and screens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href={`/dashboard/tenant/${tenant.id}/configure-screens`}>
              <Button variant="outline" className="h-20 w-full flex flex-col gap-2">
                <Settings className="h-6 w-6" />
                <span>Configure Screens</span>
              </Button>
            </Link>
            <Link href={`/dashboard/tenant/${tenant.id}/manage-access`}>
              <Button variant="outline" className="h-20 w-full flex flex-col gap-2">
                <Users className="h-6 w-6" />
                <span>Manage Access</span>
              </Button>
            </Link>
            <Link href={`/dashboard/tenant/${tenant.id}/view-all-devices`}>
              <Button variant="outline" className="h-20 w-full flex flex-col gap-2">
                <Monitor className="h-6 w-6" />
                <span>View All Devices</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
