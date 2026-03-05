/**
 * Media Library Page - Videotron
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Newspaper, Plus, Search, Filter, Upload } from 'lucide-react';
import { useState } from 'react';

interface Media {
  id: string;
  title: string;
  type: 'image' | 'video';
  category: string;
  duration?: number;
  size: string;
  uploadedAt: string;
}

export default function MediaLibraryPage() {
  const [media] = useState<Media[]>([
    {
      id: '1',
      title: 'Promo Lebaran 2026',
      type: 'video',
      category: 'Advertisement',
      duration: 30.5,
      size: '45.2 MB',
      uploadedAt: '2026-02-27',
    },
    {
      id: '2',
      title: 'Food Court Banner',
      type: 'image',
      category: 'Advertisement',
      size: '2.1 MB',
      uploadedAt: '2026-02-26',
    },
    {
      id: '3',
      title: 'Kids Animation',
      type: 'video',
      category: 'Entertainment',
      duration: 120.0,
      size: '85.6 MB',
      uploadedAt: '2026-02-25',
    },
  ]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Newspaper className="h-8 w-8 text-primary" />
            Media Library
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all your media files
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Upload Media
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add from URL
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Media</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{media.length}</div>
            <p className="text-xs text-muted-foreground">
              Files
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Videos</CardTitle>
            <Newspaper className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{media.filter(m => m.type === 'video').length}</div>
            <p className="text-xs text-muted-foreground">
              Video files
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Images</CardTitle>
            <Newspaper className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{media.filter(m => m.type === 'image').length}</div>
            <p className="text-xs text-muted-foreground">
              Image files
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <Newspaper className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.1 GB</div>
            <p className="text-xs text-muted-foreground">
              Used space
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search media..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Media Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Media Files</CardTitle>
          <CardDescription>All uploaded media content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((item) => (
              <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {item.type === 'video' ? (
                    <div className="text-center">
                      <Newspaper className="h-12 w-12 mx-auto text-gray-400" />
                      <p className="text-sm text-gray-500 mt-2">{item.duration}s</p>
                    </div>
                  ) : (
                    <Newspaper className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <div className="p-3">
                  <p className="font-medium text-sm line-clamp-1">{item.title}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="text-xs">{item.category}</Badge>
                    <span className="text-xs text-gray-500">{item.size}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
