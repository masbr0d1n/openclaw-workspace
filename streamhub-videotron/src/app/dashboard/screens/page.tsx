/**
 * Screens Main Page - Videotron
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Monitor, ListVideo, Layers, ArrowRight, BarChart, Plus } from 'lucide-react';
import Link from 'next/link';

export default function ScreensPage() {
  const router = useRouter();

  const stats = {
    totalDevices: 95,
    onlineDevices: 87,
    totalGroups: 12,
    activeGroups: 10,
  };

  const recentDevices = [
    { id: 'DEV-001', name: 'Player 1 - Main Lobby', status: 'online', location: 'Main Lobby' },
    { id: 'DEV-002', name: 'Player 2 - Food Court', status: 'online', location: 'Food Court' },
    { id: 'DEV-003', name: 'Player 1 - Cinema', status: 'offline', location: 'Cinema Area' },
  ];

  const recentGroups = [
    { id: 1, name: 'Main Lobby Group', screens: 15, location: 'Main Lobby' },
    { id: 2, name: 'Food Court Group', screens: 20, location: 'Food Court' },
  ];

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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Device
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDevices}</div>
            <p className="text-xs text-muted-foreground">
              {stats.onlineDevices} online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Screen Groups</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGroups}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeGroups} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline</CardTitle>
            <Monitor className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalDevices - stats.onlineDevices}
            </div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Locations
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
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
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard/screens/groups">
                <Button variant="outline" className="w-full justify-start">
                  <Layers className="mr-2 h-4 w-4" />
                  Screen Groups
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Screen management at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Recent Devices</p>
                  <div className="space-y-2">
                    {recentDevices.map((device) => (
                      <div key={device.id} className="flex items-center justify-between p-2 rounded border">
                        <div>
                          <p className="text-sm font-medium">{device.name}</p>
                          <p className="text-xs text-gray-500">{device.location}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${device.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Groups Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Screen Groups</CardTitle>
            <CardDescription>Organized screen collections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentGroups.map((group) => (
                <div key={group.id} className="p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{group.name}</p>
                      <p className="text-sm text-gray-500">{group.location}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-semibold">{group.screens}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/dashboard/screens/groups">
              <Button variant="outline" className="w-full mt-4">
                View All Groups
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
