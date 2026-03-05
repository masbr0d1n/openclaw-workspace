/**
 * Integrations Page - Videotron
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plug, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function IntegrationsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Plug className="h-8 w-8 text-primary" />
            Integrations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Connect with external services and APIs
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Integration
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Available Integrations</CardTitle>
            <CardDescription>Connect your favorite services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">YouTube API</p>
                    <p className="text-sm text-gray-500">Import videos from YouTube</p>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Vimeo API</p>
                    <p className="text-sm text-gray-500">Import videos from Vimeo</p>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weather API</p>
                    <p className="text-sm text-gray-500">Display weather information</p>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrations Hub</CardTitle>
            <CardDescription>Manage your connections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <Plug className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="font-medium text-lg">Integration Management</p>
              <p className="text-sm mt-2">Connect and manage third-party services</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
