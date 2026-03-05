/**
 * Dashboard Home Page - Videotron
 * Digital Signage Network Overview
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, Video, Calendar, AlertCircle, Activity, Clock, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

interface Screen {
  id: string;
  name: string;
  status: 'online' | 'offline';
  location: string;
}

interface Activity {
  id: string;
  action: string;
  timestamp: string;
  type: 'upload' | 'schedule' | 'device' | 'screen';
}

export default function DashboardPage() {
  // Videotron data
  const videotronStats = {
    totalScreens: 24,
    activeContent: 128,
    activeSchedules: 6,
    alerts: 2,
  };

  const screens: Screen[] = [
    { id: '1', name: 'Lobby TV', status: 'online', location: 'Main Lobby' },
    { id: '2', name: 'Warehouse', status: 'offline', location: 'Warehouse' },
    { id: '3', name: 'Meeting Room 1', status: 'online', location: 'Meeting Room' },
    { id: '4', name: 'Branch Jakarta', status: 'online', location: 'Jakarta' },
    { id: '5', name: 'Food Court Display', status: 'online', location: 'Food Court' },
    { id: '6', name: 'Cinema Entrance', status: 'offline', location: 'Cinema Area' },
  ];

  const recentActivities: Activity[] = [
    { id: '1', action: 'Uploaded video.mp4', timestamp: '2 minutes ago', type: 'upload' },
    { id: '2', action: 'Schedule updated for Lobby TV', timestamp: '15 minutes ago', type: 'schedule' },
    { id: '3', action: 'Device rebooted: Meeting Room 1', timestamp: '1 hour ago', type: 'device' },
    { id: '4', action: 'New screen registered: Branch Jakarta', timestamp: '3 hours ago', type: 'screen' },
    { id: '5', action: 'Content library updated', timestamp: '5 hours ago', type: 'upload' },
  ];

  const playbackData = [
    { day: 'Mon', plays: 1450 },
    { day: 'Tue', plays: 1680 },
    { day: 'Wed', plays: 1820 },
    { day: 'Thu', plays: 1590 },
    { day: 'Fri', plays: 2100 },
    { day: 'Sat', plays: 2450 },
    { day: 'Sun', plays: 1980 },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome back! Here's your screen network overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Screens</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{videotronStats.totalScreens}</div>
            <p className="text-xs text-muted-foreground">
              {screens.filter(s => s.status === 'online').length} online, {screens.filter(s => s.status === 'offline').length} offline
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Content</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{videotronStats.activeContent}</div>
            <p className="text-xs text-muted-foreground">Videos, images, layouts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{videotronStats.activeSchedules}</div>
            <p className="text-xs text-muted-foreground">Playback schedules</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{videotronStats.alerts}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        {/* Screen Status */}
        <Card>
          <CardHeader>
            <CardTitle>Screen Status</CardTitle>
            <CardDescription>Real-time device monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {screens.map((screen) => (
                <div key={screen.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${screen.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="font-medium">{screen.name}</p>
                      <p className="text-sm text-muted-foreground">{screen.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {screen.status === 'online' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions in your network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-full">
                    {activity.type === 'upload' && <Video className="h-4 w-4" />}
                    {activity.type === 'schedule' && <Calendar className="h-4 w-4" />}
                    {activity.type === 'device' && <Activity className="h-4 w-4" />}
                    {activity.type === 'screen' && <Monitor className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Playback Statistics */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Playback Statistics</CardTitle>
          <CardDescription>Weekly content playback trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-48 gap-2">
            {playbackData.map((data) => (
              <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-primary rounded-t transition-all hover:opacity-80"
                  style={{ height: `${(data.plays / 2500) * 100}%` }}
                />
                <span className="text-xs text-muted-foreground">{data.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
