/**
 * Logs & Reports Page
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Activity, Users, Video, TrendingUp } from 'lucide-react';

export default function LogsReportsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Logs & Reports</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View system logs, activity reports, and analytics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">456</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+5%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Videos Streamed</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,345</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+23%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">
              Uptime this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest system activities and events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { user: 'superadmin', action: 'Created new playlist', time: '2 min ago', status: 'success' },
                { user: 'testuser2', action: 'Uploaded video', time: '5 min ago', status: 'success' },
                { user: 'admin', action: 'Updated channel settings', time: '10 min ago', status: 'success' },
                { user: 'system', action: 'Scheduled backup', time: '1 hour ago', status: 'info' },
                { user: 'testuser2', action: 'Deleted video', time: '2 hours ago', status: 'warning' },
              ].map((log, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{log.user}</span>
                      <Badge variant={
                        log.status === 'success' ? 'default' :
                        log.status === 'warning' ? 'destructive' : 'secondary'
                      }>
                        {log.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {log.action}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">{log.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Reports */}
        <Card>
          <CardHeader>
            <CardTitle>System Reports</CardTitle>
            <CardDescription>Generated reports and analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Daily Activity Report', date: 'Today, 9:00 AM', size: '2.3 MB' },
                { name: 'Weekly Performance Summary', date: 'Yesterday, 11:00 PM', size: '5.1 MB' },
                { name: 'User Engagement Report', date: 'Feb 25, 2026', size: '3.8 MB' },
                { name: 'System Health Check', date: 'Feb 24, 2026', size: '1.2 MB' },
                { name: 'Error Logs', date: 'Feb 23, 2026', size: '890 KB' },
              ].map((report, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium">{report.name}</div>
                      <div className="text-xs text-gray-500">{report.date}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">{report.size}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Advanced Analytics</CardTitle>
          <CardDescription>More features coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-dashed">
              <Activity className="h-8 w-8 mb-2 text-gray-400" />
              <h3 className="font-medium mb-1">Real-time Monitoring</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Live system metrics and performance indicators
              </p>
            </div>
            <div className="p-4 rounded-lg border border-dashed">
              <TrendingUp className="h-8 w-8 mb-2 text-gray-400" />
              <h3 className="font-medium mb-1">Trend Analysis</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Historical data and trend visualization
              </p>
            </div>
            <div className="p-4 rounded-lg border border-dashed">
              <FileText className="h-8 w-8 mb-2 text-gray-400" />
              <h3 className="font-medium mb-1">Custom Reports</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generate custom reports on demand
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
