/**
 * Campaign Composer - Campaign Content Management with Resolution Categories
 */

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, GripVertical, Play, Clock, Monitor, Megaphone, Save, LayoutGrid, Clapperboard } from 'lucide-react';
import { toast } from 'sonner';
import { ThumbnailImage } from '@/components/thumbnail-image';

interface CampaignContent {
  id: string;
  youtubeId?: string;
  title: string;
  duration: number;
  resolution: '1920x1080' | '2560x1440' | '3840x2160' | '1280x720';
  category: 'entertainment' | 'sport' | 'kids' | 'knowledge' | 'gaming' | 'advertisement';
  order: number;
}

interface ScreenGroup {
  id: string;
  name: string;
  location: string;
  screenCount: number;
}

export default function CampaignComposerPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = parseInt(params.campaignId as string);

  const [campaignName, setCampaignName] = useState('Promo Lebaran 2026');
  const [selectedResolution, setSelectedResolution] = useState<string>('1920x1080');
  const [selectedCategory, setSelectedCategory] = useState<string>('entertainment');

  const [contentLibrary] = useState<CampaignContent[]>([
    {
      id: '1',
      youtubeId: 'dQw4w9WgXcQ',
      title: 'Lebaran Greeting - Family',
      duration: 30.5,
      resolution: '1920x1080',
      category: 'entertainment',
      order: 0,
    },
    {
      id: '2',
      youtubeId: '9bZkp7q19f0',
      title: 'Product Showcase - Food',
      duration: 45.25,
      resolution: '1920x1080',
      category: 'advertisement',
      order: 1,
    },
    {
      id: '3',
      youtubeId: '0Kfw6aQiC7k',
      title: 'Kids Animation Promo',
      duration: 60.0,
      resolution: '1920x1080',
      category: 'kids',
      order: 2,
    },
    {
      id: '4',
      youtubeId: '9bZkp7q19f0',
      title: 'Sports Event Highlights',
      duration: 90.75,
      resolution: '2560x1440',
      category: 'sport',
      order: 3,
    },
    {
      id: '5',
      youtubeId: '0Kfw6aQiC7k',
      title: 'Documentary: Nature',
      duration: 120.5,
      resolution: '3840x2160',
      category: 'knowledge',
      order: 4,
    },
  ]);

  const [playlist, setPlaylist] = useState<CampaignContent[]>([
    {
      id: '1',
      youtubeId: 'dQw4w9WgXcQ',
      title: 'Lebaran Greeting - Family',
      duration: 30.5,
      resolution: '1920x1080',
      category: 'entertainment',
      order: 0,
    },
    {
      id: '2',
      youtubeId: '9bZkp7q19f0',
      title: 'Product Showcase - Food',
      duration: 45.25,
      resolution: '1920x1080',
      category: 'advertisement',
      order: 1,
    },
  ]);

  const [screenGroups] = useState<ScreenGroup[]>([
    { id: 'main-lobby', name: 'Main Lobby Group', location: 'Main Lobby', screenCount: 15 },
    { id: 'food-court', name: 'Food Court Group', location: 'Food Court', screenCount: 20 },
  ]);

  const resolutions = [
    { value: '1280x720', label: '720p (HD)' },
    { value: '1920x1080', label: '1080p (Full HD)' },
    { value: '2560x1440', label: '1440p (2K)' },
    { value: '3840x2160', label: '2160p (4K)' },
  ];

  const categories = [
    { value: 'entertainment', label: 'Entertainment', color: 'bg-purple-500' },
    { value: 'sport', label: 'Sport', color: 'bg-blue-500' },
    { value: 'kids', label: 'Kids', color: 'bg-green-500' },
    { value: 'knowledge', label: 'Knowledge', color: 'bg-yellow-500' },
    { value: 'gaming', label: 'Gaming', color: 'bg-red-500' },
    { value: 'advertisement', label: 'Advertisement', color: 'bg-orange-500' },
  ];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round((seconds % 60) * 100) / 100;
    return `${mins}m ${secs.toFixed(2)}s`;
  };

  const totalDuration = playlist.reduce((acc, item) => acc + item.duration, 0);

  const filteredContent = contentLibrary.filter(
    (item) =>
      (selectedResolution === 'all' || item.resolution === selectedResolution) &&
      (selectedCategory === 'all' || item.category === selectedCategory)
  );

  const addToPlaylist = (item: CampaignContent) => {
    const existing = playlist.find((p) => p.id === item.id);
    if (existing) {
      toast.error('Content already in playlist');
      return;
    }
    setPlaylist([
      ...playlist,
      { ...item, order: playlist.length },
    ]);
    toast.success('Added to playlist');
  };

  const removeFromPlaylist = (id: string) => {
    setPlaylist(playlist.filter((p) => p.id !== id));
    toast.success('Removed from playlist');
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newPlaylist = [...playlist];
    [newPlaylist[index - 1], newPlaylist[index]] = [newPlaylist[index], newPlaylist[index - 1]];
    setPlaylist(newPlaylist.map((item, i) => ({ ...item, order: i })));
  };

  const moveDown = (index: number) => {
    if (index === playlist.length - 1) return;
    const newPlaylist = [...playlist];
    [newPlaylist[index], newPlaylist[index + 1]] = [newPlaylist[index + 1], newPlaylist[index]];
    setPlaylist(newPlaylist.map((item, i) => ({ ...item, order: i })));
  };

  const handleSave = () => {
    toast.success('Campaign playlist saved successfully');
    router.push(`/dashboard/campaign/${campaignId}`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/campaign/${campaignId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Megaphone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Campaign Composer</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                <Clapperboard className="h-4 w-4" />
                {campaignName}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/campaign/${campaignId}`)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Playlist
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Playlist Items</CardTitle>
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playlist.length}</div>
            <p className="text-xs text-muted-foreground">
              Content items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(totalDuration / 60)}:{Math.round(totalDuration % 60).toString().padStart(2, '0')}
            </div>
            <p className="text-xs text-muted-foreground">
              Total runtime
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Screen Groups</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{screenGroups.length}</div>
            <p className="text-xs text-muted-foreground">
              {screenGroups.reduce((acc, sg) => acc + sg.screenCount, 0)} screens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Targeting</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {screenGroups.map((sg) => (
                <div key={sg.id} className="flex items-center gap-2">
                  <Badge variant="outline">{sg.name}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Content Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Resolution Category</Label>
              <Select value={selectedResolution} onValueChange={setSelectedResolution}>
                <SelectTrigger>
                  <SelectValue placeholder="All Resolutions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resolutions</SelectItem>
                  {resolutions.map((res) => (
                    <SelectItem key={res.value} value={res.value}>{res.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Content Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSelectedResolution('all');
                  setSelectedCategory('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Left: Media Library */}
        <div className="lg:col-span-3 space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Media Library</CardTitle>
              <CardDescription>
                {filteredContent.length} items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredContent.map((item) => {
                  const cat = categories.find((c) => c.value === item.category);
                  const res = resolutions.find((r) => r.value === item.resolution);
                  const inPlaylist = playlist.some((p) => p.id === item.id);
                  
                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900"
                    >
                      <div className="flex gap-3">
                        <div className="w-24 h-16 rounded overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                          {item.youtubeId ? (
                            <ThumbnailImage
                              src={`https://img.youtube.com/vi/${item.youtubeId}/mqdefault.jpg`}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              width={96}
                              height={64}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                              <Clapperboard className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm line-clamp-2">{item.title}</div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {res?.label}
                            </Badge>
                            <Badge variant="outline" className={`text-xs text-white ${cat?.color}`}>
                              {cat?.label}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDuration(item.duration)}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="w-full mt-3"
                        variant={inPlaylist ? "secondary" : "default"}
                        onClick={() => addToPlaylist(item)}
                        disabled={inPlaylist}
                      >
                        {inPlaylist ? 'Added' : <><Plus className="mr-1 h-3 w-3" /> Add</>}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Playlist Order */}
        <div className="lg:col-span-7 space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Campaign Playlist</CardTitle>
                  <CardDescription>
                    {playlist.length} items • {formatDuration(totalDuration)} total
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setPlaylist([])}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {playlist.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <LayoutGrid className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No content in playlist</p>
                  <p className="text-sm">Add content from the library to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {playlist.map((item, index) => {
                    const cat = categories.find((c) => c.value === item.category);
                    const res = resolutions.find((r) => r.value === item.resolution);
                    
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                      >
                        <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                        <div className="text-lg font-bold text-gray-400 w-6">{index + 1}</div>
                        
                        <div className="w-32 h-20 rounded overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                          {item.youtubeId ? (
                            <ThumbnailImage
                              src={`https://img.youtube.com/vi/${item.youtubeId}/mqdefault.jpg`}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              width={128}
                              height={80}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                              <Clapperboard className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold">{item.title}</div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {res?.label}
                            </Badge>
                            <Badge variant="outline" className={`text-xs text-white ${cat?.color}`}>
                              {cat?.label}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDuration(item.duration)}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                          >
                            ↑
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveDown(index)}
                            disabled={index === playlist.length - 1}
                          >
                            ↓
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromPlaylist(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Playlist Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Playlist Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Items:</span>
                  <span className="font-medium">{playlist.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Duration:</span>
                  <span className="font-medium">{formatDuration(totalDuration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Screen Groups:</span>
                  <span className="font-medium">{screenGroups.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Screens:</span>
                  <span className="font-medium">{screenGroups.reduce((acc, sg) => acc + sg.screenCount, 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
