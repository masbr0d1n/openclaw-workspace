/**
 * View All Devices Page
 */

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { ArrowLeft, Monitor, Server, HardDrive, Wifi, Battery, Search, RefreshCw, CheckCircle, XCircle, AlertCircle, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Device {
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
  signal?: number;
  battery?: number;
}

export default function ViewAllDevicesPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = parseInt(params.id as string);

  const [searchTerm, setSearchTerm] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'player' as 'player' | 'server' | 'storage' | 'network',
    model: '',
    ip: '',
    mac: '',
    location: '',
  });
  const [devices, setDevices] = useState<Device[]>([
    {
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
    },
    {
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
    },
    {
      id: 'DEV-003',
      name: 'Player 1 - Food Court',
      type: 'player',
      model: 'Raspberry Pi 4',
      status: 'offline',
      ip: '192.168.1.103',
      mac: 'B8:27:EB:12:34:58',
      location: 'Food Court',
      uptime: '0d 0h 0m',
      cpu: 0,
      memory: 0,
      storage: 0,
    },
    {
      id: 'SRV-001',
      name: 'Content Server',
      type: 'server',
      model: 'Dell PowerEdge R740',
      status: 'online',
      ip: '192.168.1.10',
      mac: '00:1E:67:12:34:56',
      location: 'Server Room',
      uptime: '45d 12h 30m',
      cpu: 25,
      memory: 67,
      storage: 78,
    },
    {
      id: 'STR-001',
      name: 'NAS Storage',
      type: 'storage',
      model: 'Synology DS920+',
      status: 'online',
      ip: '192.168.1.20',
      mac: '00:11:32:12:34:56',
      location: 'Server Room',
      uptime: '45d 12h 15m',
      cpu: 10,
      memory: 35,
      storage: 82,
    },
    {
      id: 'NET-001',
      name: 'Wireless AP Main',
      type: 'network',
      model: 'Ubiquiti UniFi AP',
      status: 'online',
      ip: '192.168.1.1',
      mac: 'DC:9F:DB:12:34:56',
      location: 'Main Lobby',
      uptime: '60d 8h 45m',
      cpu: 5,
      memory: 25,
      storage: 45,
      signal: -35,
    },
    {
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
    },
  ]);

  const deviceTypes = [
    { value: 'player', label: 'Player', description: 'Content playback device' },
    { value: 'server', label: 'Server', description: 'Backend server' },
    { value: 'storage', label: 'Storage', description: 'NAS or storage device' },
    { value: 'network', label: 'Network', description: 'Router, switch, or AP' },
  ];

  const handleAddDevice = () => {
    const newDevice: Device = {
      id: `DEV-${String(devices.length + 1).padStart(3, '0')}`,
      name: formData.name,
      type: formData.type,
      model: formData.model,
      status: 'online',
      ip: formData.ip,
      mac: formData.mac,
      location: formData.location,
      uptime: '0d 0h 0m',
      cpu: 0,
      memory: 0,
      storage: 0,
    };
    setDevices([...devices, newDevice]);
    setAddDialogOpen(false);
    setFormData({ name: '', type: 'player', model: '', ip: '', mac: '', location: '' });
    toast.success('Device added successfully');
  };

  const handleEditDevice = () => {
    if (selectedDevice) {
      setDevices(devices.map(d =>
        d.id === selectedDevice.id
          ? { ...d, ...formData }
          : d
      ));
      setEditDialogOpen(false);
      setSelectedDevice(null);
      setFormData({ name: '', type: 'player', model: '', ip: '', mac: '', location: '' });
      toast.success('Device updated successfully');
    }
  };

  const handleDeleteDevice = (id: string) => {
    setDevices(devices.filter(d => d.id !== id));
    toast.success('Device removed successfully');
  };

  const openEditDialog = (device: Device) => {
    setSelectedDevice(device);
    setFormData({
      name: device.name,
      type: device.type,
      model: device.model,
      ip: device.ip,
      mac: device.mac,
      location: device.location,
    });
    setEditDialogOpen(true);
  };

  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.ip.includes(searchTerm)
  );

  const onlineCount = filteredDevices.filter(d => d.status === 'online').length;
  const offlineCount = filteredDevices.filter(d => d.status === 'offline').length;
  const warningCount = filteredDevices.filter(d => d.status === 'warning').length;

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'player': return Monitor;
      case 'server': return Server;
      case 'storage': return HardDrive;
      case 'network': return Wifi;
      default: return Monitor;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return CheckCircle;
      case 'offline': return XCircle;
      case 'warning': return AlertCircle;
      default: return AlertCircle;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/tenant/${tenantId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">View All Devices</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor and manage all devices for this tenant
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Device
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Device</DialogTitle>
                <DialogDescription>
                  Register a new device for this tenant
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="d-name">Device Name</Label>
                  <Input
                    id="d-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Player 1 - Main Lobby"
                  />
                </div>
                <div>
                  <Label htmlFor="d-type">Device Type</Label>
                  <Select value={formData.type} onValueChange={(value: 'player' | 'server' | 'storage' | 'network') => setFormData({ ...formData, type: value })}>
                    <SelectTrigger id="d-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {deviceTypes.map(dt => (
                        <SelectItem key={dt.value} value={dt.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{dt.label}</span>
                            <span className="text-xs text-muted-foreground">{dt.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="d-model">Model</Label>
                  <Input
                    id="d-model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g., Raspberry Pi 4"
                  />
                </div>
                <div>
                  <Label htmlFor="d-ip">IP Address</Label>
                  <Input
                    id="d-ip"
                    value={formData.ip}
                    onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                    placeholder="e.g., 192.168.1.101"
                  />
                </div>
                <div>
                  <Label htmlFor="d-mac">MAC Address</Label>
                  <Input
                    id="d-mac"
                    value={formData.mac}
                    onChange={(e) => setFormData({ ...formData, mac: e.target.value })}
                    placeholder="e.g., B8:27:EB:12:34:56"
                  />
                </div>
                <div>
                  <Label htmlFor="d-location">Location</Label>
                  <Input
                    id="d-location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Main Lobby"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddDevice}>Add Device</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
            <div className="text-2xl font-bold">{filteredDevices.length}</div>
            <p className="text-xs text-muted-foreground">
              Connected devices
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
              Healthy devices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warning</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warningCount}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offlineCount}</div>
            <p className="text-xs text-muted-foreground">
              Disconnected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by device name, type, location, or IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Devices Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Devices</CardTitle>
          <CardDescription>Real-time device monitoring and status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>IP / MAC</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Uptime</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No devices found
                  </TableCell>
                </TableRow>
              ) : (
                filteredDevices.map((device) => {
                  const DeviceIcon = getDeviceIcon(device.type);
                  const StatusIcon = getStatusIcon(device.status);
                  
                  return (
                    <TableRow key={device.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <DeviceIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <Link
                              href={`/dashboard/tenant/${tenantId}/device/${device.id}`}
                              className="font-medium hover:text-primary hover:underline cursor-pointer"
                            >
                              {device.name}
                            </Link>
                            <div className="text-xs text-gray-500">{device.model}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{device.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{device.ip}</div>
                          <div className="text-xs text-gray-500">{device.mac}</div>
                        </div>
                      </TableCell>
                      <TableCell>{device.location}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
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
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="w-16">CPU:</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  device.cpu > 80 ? 'bg-red-500' :
                                  device.cpu > 60 ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${device.cpu}%` }}
                              />
                            </div>
                            <span className="w-8 text-right">{device.cpu}%</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="w-16">RAM:</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  device.memory > 80 ? 'bg-red-500' :
                                  device.memory > 60 ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${device.memory}%` }}
                              />
                            </div>
                            <span className="w-8 text-right">{device.memory}%</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="w-16">Disk:</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-blue-500 h-1.5 rounded-full"
                                style={{ width: `${device.storage}%` }}
                              />
                            </div>
                            <span className="w-8 text-right">{device.storage}%</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {device.uptime}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(device)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDevice(device.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Device</DialogTitle>
            <DialogDescription>
              Update device information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="e-name">Device Name</Label>
              <Input
                id="e-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="e-type">Device Type</Label>
              <Select value={formData.type} onValueChange={(value: 'player' | 'server' | 'storage' | 'network') => setFormData({ ...formData, type: value })}>
                <SelectTrigger id="e-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {deviceTypes.map(dt => (
                    <SelectItem key={dt.value} value={dt.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{dt.label}</span>
                        <span className="text-xs text-muted-foreground">{dt.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="e-model">Model</Label>
              <Input
                id="e-model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="e-ip">IP Address</Label>
              <Input
                id="e-ip"
                value={formData.ip}
                onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="e-mac">MAC Address</Label>
              <Input
                id="e-mac"
                value={formData.mac}
                onChange={(e) => setFormData({ ...formData, mac: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="e-location">Location</Label>
              <Input
                id="e-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditDevice}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
