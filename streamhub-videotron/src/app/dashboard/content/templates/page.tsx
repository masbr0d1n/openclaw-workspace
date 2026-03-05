/**
 * Templates Page - Videotron
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderTree, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TemplatesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FolderTree className="h-8 w-8 text-primary" />
            Templates
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Pre-made templates for quick setup
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Start Templates</CardTitle>
            <CardDescription>Get started quickly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Daily Playlist</p>
                    <p className="text-sm text-gray-500">Rotating content throughout the day</p>
                  </div>
                  <FolderTree className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Event Campaign</p>
                    <p className="text-sm text-gray-500">Special event playlists</p>
                  </div>
                  <FolderTree className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Promotional Loop</p>
                    <p className="text-sm text-gray-500">Continuous promotion</p>
                  </div>
                  <FolderTree className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Templates</CardTitle>
            <CardDescription>Organized by content type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <FolderTree className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="font-medium text-lg">Template Library</p>
              <p className="text-sm mt-2">More templates coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
