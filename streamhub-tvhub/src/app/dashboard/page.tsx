/**
 * Dashboard Home Page - TV Hub Version
 * Channel streaming & playlist management overview
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Calendar, Database, Activity, TrendingUp, Clock, PlayCircle } from 'lucide-react';

export default function DashboardPage() {
  // TV Hub stats
  const tvHubStats = {
    totalChannels: 12,
    totalVideos: 345,
    totalPlaylists: 28,
    totalViews: 125430,
  };

  const recentChannels = [
    { id: '1', name: 'News Channel', status: 'live', viewers: 1240 },
    { id: '2', name: 'Sports HD', status: 'live', viewers: 3580 },
    { id: '3', name: 'Music TV', status: 'offline', viewers: 0 },
    { id: '4', name: 'Kids Channel', status: 'live', viewers: 890 },
  ];

  const recentActivities = [
    { id: '1', action: 'New video uploaded: "Morning News"', timestamp: '2 minutes ago', type: 'upload' },
    { id: '2', action: 'Playlist updated: "Evening Schedule"', timestamp: '15 minutes ago', type: 'playlist' },
    { id: '3', action: 'Channel started streaming: "Sports HD"', timestamp: '1 hour ago', type: 'channel' },
    { id: '4', action: 'Schedule created for tomorrow', timestamp: '3 hours ago', type: 'schedule' },
  ];

  const viewershipData = [
    { day: 'Mon', viewers: 14500 },
    { day: 'Tue', viewers: 16800 },
    { day: 'Wed', viewers: 18200 },
    { day: 'Thu', viewers: 15900 },
    { day: 'Fri', viewers: 21000 },
    { day: 'Sat', viewers: 24500 },
    { day: 'Sun', viewers: 19800 },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's your TV Hub overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Channels</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tvHubStats.totalChannels}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +2 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tvHubStats.totalVideos}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +15 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Playlists</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tvHubStats.totalPlaylists}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +3 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tvHubStats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12.5% from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Active Channels */}
        <Card>
          <CardHeader>
            <CardTitle>Active Channels</CardTitle>
            <CardDescription>Currently streaming channels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentChannels.map((channel) => (
                <div key={channel.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${channel.status === 'live' ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <div>
                      <p className="font-medium">{channel.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{channel.status}</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {channel.viewers > 0 ? `${channel.viewers.toLocaleString()} viewers` : '-'}
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
            <CardDescription>Latest updates across your TV Hub</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Viewership Chart Placeholder */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Weekly Viewership</CardTitle>
          <CardDescription>Total viewers over the past 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end justify-between gap-2">
            {viewershipData.map((data) => (
              <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-primary rounded-t"
                  style={{ height: `${(data.viewers / 25000) * 100}%` }}
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
