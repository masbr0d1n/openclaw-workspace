/**
 * Device Detail Page with Screen Information
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Monitor, Server, HardDrive, Wifi, MapPin, Building2, Settings, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Screen {
  id: number;
  name: string;
  resolution: string;
  status: 'online' | 'offline';
  orientation: 'landscape' | 'portrait';
}

interface DeviceDetail {
  id: string;
  name: string;
  type: 'player' | 'server' | 'storage' | 'network';
  model: string;
  status: 'online' | 'offline' | 'warning';
  ip: string;
  mac: string;
  location: string;
  uptime: string;
  cpu: number;
  memory: number;
  storage: number;
  screens: Screen[];
  tenant: {
    id: number;
    name: string;
  };
  subTenant: {
    id: number;
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
}

export default function DeviceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = parseInt(params.id as string);
  const deviceId = params.deviceId as string;

  const [device, setDevice] = useState<DeviceDetail | null>(null);

  useEffect(() => {
    // Mock data - fetch from API in production
    const mockDevices: Record<string, DeviceDetail> = {
      'DEV-001': {
        id: 'DEV-001',
        name: 'Player 1 - Main Lobby',
        type: 'player',
        model: 'Raspberry Pi 4',
        status: 'online',
        ip: '192.168.1.101',
        mac: 'B8:27:EB:12:34:56',
        location: 'Main Lobby',
        uptime: '15d 4h 23m',
        cpu: 15,
        memory: 45,
        storage: 62,
        tenant: {
          id: 1,
          name: 'Mall Central Jakarta',
        },
        subTenant: {
          id: 1,
          name: 'Main Lobby',
          address: 'Lobby Utama, Lt. 1',
          lat: -6.1937,
          lng: 106.8230,
        },
        screens: [
          { id: 1, name: 'Screen 1', resolution: '1920x1080', status: 'online', orientation: 'landscape' },
          { id: 2, name: 'Screen 2', resolution: '1920x1080', status: 'online', orientation: 'landscape' },
        ],
      },
      'DEV-002': {
        id: 'DEV-002',
        name: 'Player 2 - Main Lobby',
        type: 'player',
        model: 'Raspberry Pi 4',
        status: 'online',
        ip: '192.168.1.102',
        mac: 'B8:27:EB:12:34:57',
        location: 'Main Lobby',
        uptime: '15d 4h 21m',
        cpu: 18,
        memory: 48,
        storage: 65,
        tenant: {
          id: 1,
          name: 'Mall Central Jakarta',
        },
        subTenant: {
          id: 1,
          name: 'Main Lobby',
          address: 'Lobby Utama, Lt. 1',
          lat: -6.1937,
          lng: 106.8230,
        },
        screens: [
          { id: 3, name: 'Screen 3', resolution: '1920x1080', status: 'online', orientation: 'landscape' },
        ],
      },
      'DEV-004': {
        id: 'DEV-004',
        name: 'Player 1 - Cinema',
        type: 'player',
        model: 'Raspberry Pi 4',
        status: 'warning',
        ip: '192.168.1.104',
        mac: 'B8:27:EB:12:34:59',
        location: 'Cinema Area',
        uptime: '5d 2h 15m',
        cpu: 85,
        memory: 92,
        storage: 88,
        tenant: {
          id: 1,
          name: 'Mall Central Jakarta',
        },
        subTenant: {
          id: 3,
          name: 'Cinema Area',
          address: 'Lt. 5, XXI Cinema',
          lat: -6.1945,
          lng: 106.8228,
        },
        screens: [
          { id: 4, name: 'Screen 4', resolution: '3840x2160', status: 'online', orientation: 'landscape' },
          { id: 5, name: 'Screen 5', resolution: '3840x2160', status: 'offline', orientation: 'portrait' },
        ],
      },
    };

    setDevice(mockDevices[deviceId] || null);
  }, [deviceId]);

  if (!device) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/tenant/${tenantId}/view-all-devices`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card className="mt-4">
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Device not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getDeviceIcon = () => {
    switch (device.type) {
      case 'player': return Monitor;
      case 'server': return Server;
      case 'storage': return HardDrive;
      case 'network': return Wifi;
      default: return Monitor;
    }
  };

  const getStatusIcon = () => {
    switch (device.status) {
      case 'online': return CheckCircle;
      case 'offline': return XCircle;
      case 'warning': return AlertCircle;
      default: return AlertCircle;
    }
  };

  const DeviceIcon = getDeviceIcon();
  const StatusIcon = getStatusIcon();

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/tenant/${tenantId}/view-all-devices`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Devices
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <DeviceIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{device.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                <StatusIcon className={`h-4 w-4 ${
                  device.status === 'online' ? 'text-green-500' :
                  device.status === 'offline' ? 'text-red-500' :
                  'text-yellow-500'
                }`} />
                <Badge variant={
                  device.status === 'online' ? 'default' :
                  device.status === 'offline' ? 'secondary' :
                  'destructive'
                }>
                  {device.status}
                </Badge>
                <span>•</span>
                <span>{device.model}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Device Info & Screens */}
        <div className="lg:col-span-2 space-y-6">
          {/* Device Information */}
          <Card>
            <CardHeader>
              <CardTitle>Device Information</CardTitle>
              <CardDescription>Technical details and configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Device ID</p>
                  <p className="font-semibold">{device.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <Badge variant="outline">{device.type}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">IP Address</p>
                  <p className="font-mono">{device.ip}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">MAC Address</p>
                  <p className="font-mono text-sm">{device.mac}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-semibold">{device.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Uptime</p>
                  <p className="font-semibold">{device.uptime}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connected Screens */}
          <Card>
            <CardHeader>
              <CardTitle>Connected Screens</CardTitle>
              <CardDescription>{device.screens.length} screen(s) connected to this device</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {device.screens.map((screen) => (
                  <div
                    key={screen.id}
                    className="p-4 rounded-lg border bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="font-semibold">{screen.name}</p>
                          <p className="text-xs text-gray-500">{screen.resolution}</p>
                        </div>
                      </div>
                      <Badge variant={screen.status === 'online' ? 'default' : 'secondary'} className="text-xs">
                        {screen.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Badge variant="outline" className="text-xs">
                        {screen.orientation}
                      </Badge>
                      <span className="text-xs">
                        ID: {screen.id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Real-time resource usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{device.cpu}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        device.cpu > 80 ? 'bg-red-500' :
                        device.cpu > 60 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${device.cpu}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{device.memory}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        device.memory > 80 ? 'bg-red-500' :
                        device.memory > 60 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${device.memory}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Storage Usage</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{device.storage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${device.storage}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Location & Context */}
        <div className="space-y-6">
          {/* Tenant Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Tenant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Tenant Name</p>
                <p className="font-semibold">{device.tenant.name}</p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/dashboard/tenant/${device.tenant.id}`)}
              >
                View Tenant Details
              </Button>
            </CardContent>
          </Card>

          {/* Sub-tenant Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Sub-tenant Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Location Name</p>
                <p className="font-semibold">{device.subTenant.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-sm">{device.subTenant.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Latitude</p>
                  <p className="font-mono text-sm">{device.subTenant.lat.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Longitude</p>
                  <p className="font-mono text-sm">{device.subTenant.lng.toFixed(6)}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/dashboard/tenant/${tenantId}/sub-tenant/${device.subTenant.id}`)}
              >
                View Location Details
              </Button>
            </CardContent>
          </Card>

          {/* Device Condition */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Device Condition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Overall Status</span>
                  <Badge variant={
                    device.status === 'online' ? 'default' :
                    device.status === 'offline' ? 'secondary' :
                    'destructive'
                  }>
                    {device.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Screens</span>
                  <span className="font-semibold">{device.screens.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Online</span>
                  <span className="font-semibold text-green-500">
                    {device.screens.filter(s => s.status === 'online').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Offline</span>
                  <span className="font-semibold text-red-500">
                    {device.screens.filter(s => s.status === 'offline').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
