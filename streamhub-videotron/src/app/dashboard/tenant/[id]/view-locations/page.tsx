/**
 * Locations View Page - Geographic Overview
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Monitor, CheckCircle, XCircle, Navigation } from 'lucide-react';
import Link from 'next/link';

interface Location {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  screens: number;
  status: 'active' | 'inactive';
  distance?: number;
}

export default function LocationsViewPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = parseInt(params.id as string);

  const [locations, setLocations] = useState<Location[]>([
    {
      id: 1,
      name: 'Main Lobby',
      address: 'Lobby Utama, Lt. 1',
      lat: -6.1937,
      lng: 106.8230,
      screens: 15,
      status: 'active',
      distance: 0.0,
    },
    {
      id: 2,
      name: 'Food Court',
      address: 'Lt. 3, Food Court Area',
      lat: -6.1940,
      lng: 106.8235,
      screens: 20,
      status: 'active',
      distance: 0.5,
    },
    {
      id: 3,
      name: 'Cinema Area',
      address: 'Lt. 5, XXI Cinema',
      lat: -6.1945,
      lng: 106.8228,
      screens: 10,
      status: 'inactive',
      distance: 0.8,
    },
  ]);

  const activeCount = locations.filter(l => l.status === 'active').length;
  const totalScreens = locations.reduce((acc, l) => acc + l.screens, 0);

  const openInMap = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/tenant/${tenantId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Locations Overview</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Geographic distribution of all locations
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations.length}</div>
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
            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {locations.reduce((acc, l) => acc + (l.distance || 0), 0).toFixed(1)} km
            </div>
            <p className="text-xs text-muted-foreground">
              Total spread
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Map and List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Location Map</CardTitle>
            <CardDescription>Visual overview of all locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              {/* Simple map visualization */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center w-full px-8">
                  <div className="flex flex-wrap gap-3 justify-center mb-6">
                    {locations.map((location) => (
                      <div
                        key={location.id}
                        className="cursor-pointer group"
                        onClick={() => openInMap(location.lat, location.lng)}
                      >
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center transition-all group-hover:scale-110 shadow-lg"
                          style={{
                            backgroundColor: location.status === 'active' ? '#22c55e' : '#94a3b8',
                            color: 'white',
                          }}
                        >
                          <MapPin className="h-6 w-6" />
                        </div>
                        <p className="text-xs mt-2 font-medium text-center">
                          {location.name.split(' ')[0]}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click any marker to open in Google Maps
                  </p>
                </div>
              </div>

              {/* Decorative grid */}
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

        {/* Location List */}
        <Card>
          <CardHeader>
            <CardTitle>Location Details</CardTitle>
            <CardDescription>Complete list with coordinates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className="p-4 rounded-lg border bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <Link
                        href={`/dashboard/tenant/${tenantId}/sub-tenant/${location.id}`}
                        className="font-semibold hover:text-primary hover:underline"
                      >
                        {location.name}
                      </Link>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {location.address}
                      </p>
                    </div>
                    <Badge variant={location.status === 'active' ? 'default' : 'secondary'}>
                      {location.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Latitude</p>
                      <p className="font-mono">{location.lat.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Longitude</p>
                      <p className="font-mono">{location.lng.toFixed(6)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Monitor className="h-4 w-4" />
                      <span>{location.screens} screens</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openInMap(location.lat, location.lng)}
                      className="text-xs"
                    >
                      <Navigation className="mr-1 h-3 w-3" />
                      Open in Maps
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
