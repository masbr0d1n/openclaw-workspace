'use client';

import { useState } from 'react';
import { 
  Layout, 
  Plus, 
  Settings, 
  Grip, 
  Play, 
  Layers,
  Image,
  Clock,
  FileVideo,
  ChevronRight,
  Edit2,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Layout Types
type LayoutType = 'full-screen-promo' | 'split-screen-news' | 'vertical-kiosk';

interface Zone {
  id: string;
  name: string;
  position: { x: number; y: number; width: number; height: number };
  playlistId?: string;
  playlistName?: string;
  widget: string;
}

interface LayoutTemplate {
  id: string;
  name: string;
  type: LayoutType;
  description: string;
  thumbnail: string;
  zones: Zone[];
}

// Default layout templates
const DEFAULT_LAYOUTS: LayoutTemplate[] = [
  {
    id: '1',
    name: 'Full Screen Promo',
    type: 'full-screen-promo',
    description: 'Single full-screen area for promotional content',
    thumbnail: 'bg-gradient-to-br from-blue-600 to-purple-600',
    zones: [
      { id: 'z1', name: 'Main Zone', position: { x: 0, y: 0, width: 100, height: 100 }, widget: 'video-player' }
    ]
  },
  {
    id: '2',
    name: 'Split Screen News',
    type: 'split-screen-news',
    description: 'Two zones side by side for news content',
    thumbnail: 'bg-gradient-to-br from-green-600 to-teal-600',
    zones: [
      { id: 'z1', name: 'Left Zone', position: { x: 0, y: 0, width: 50, height: 100 }, widget: 'video-player' },
      { id: 'z2', name: 'Right Zone', position: { x: 50, y: 0, width: 50, height: 100 }, widget: 'text-ticker' }
    ]
  },
  {
    id: '3',
    name: 'Vertical Kiosk',
    type: 'vertical-kiosk',
    description: 'Optimized for vertical displays with multiple zones',
    thumbnail: 'bg-gradient-to-br from-orange-600 to-red-600',
    zones: [
      { id: 'z1', name: 'Header', position: { x: 0, y: 0, width: 100, height: 15 }, widget: 'image' },
      { id: 'z2', name: 'Content', position: { x: 0, y: 15, width: 70, height: 70 }, widget: 'video-player' },
      { id: 'z3', name: 'Sidebar', position: { x: 70, y: 15, width: 30, height: 70 }, widget: 'playlist' },
      { id: 'z4', name: 'Footer', position: { x: 0, y: 85, width: 100, height: 15 }, widget: 'text-ticker' }
    ]
  }
];

// Available playlists for zone assignment
const AVAILABLE_PLAYLISTS = [
  { id: 'p1', name: 'Morning Promo' },
  { id: 'p2', name: 'News Feed' },
  { id: 'p3', name: 'Product Showcase' },
  { id: 'p4', name: 'Event Highlights' },
];

export function LayoutsContent() {
  const [layouts, setLayouts] = useState<LayoutTemplate[]>(DEFAULT_LAYOUTS);
  const [selectedLayout, setSelectedLayout] = useState<LayoutTemplate | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [zoneEditDialog, setZoneEditDialog] = useState(false);
  const [currentZone, setCurrentZone] = useState<Zone | null>(null);

  const handleLayoutClick = (layout: LayoutTemplate) => {
    setSelectedLayout(layout);
    setEditDialogOpen(true);
  };

  const handleZonePlaylistChange = (zoneId: string, playlistId: string) => {
    if (!selectedLayout) return;
    
    const playlist = AVAILABLE_PLAYLISTS.find(p => p.id === playlistId);
    const updatedZones = selectedLayout.zones.map(z => 
      z.id === zoneId 
        ? { ...z, playlistId, playlistName: playlist?.name }
        : z
    );
    
    setSelectedLayout({ ...selectedLayout, zones: updatedZones });
    
    // Update in layouts array
    setLayouts(layouts.map(l => 
      l.id === selectedLayout.id 
        ? { ...l, zones: updatedZones }
        : l
    ));
  };

  const getLayoutPreview = (layout: LayoutTemplate) => {
    switch (layout.type) {
      case 'full-screen-promo':
        return (
          <div className="w-full h-32 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-medium">100%</span>
          </div>
        );
      case 'split-screen-news':
        return (
          <div className="w-full h-32 flex gap-1 bg-gradient-to-br from-green-600 to-teal-600 rounded-lg p-1">
            <div className="flex-1 bg-white/20 rounded flex items-center justify-center">
              <span className="text-white text-xs">50%</span>
            </div>
            <div className="flex-1 bg-white/20 rounded flex items-center justify-center">
              <span className="text-white text-xs">50%</span>
            </div>
          </div>
        );
      case 'vertical-kiosk':
        return (
          <div className="w-full h-32 flex flex-col gap-1 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg p-1">
            <div className="h-[15%] bg-white/20 rounded flex items-center justify-center">
              <span className="text-white text-[8px]">Header</span>
            </div>
            <div className="flex-1 flex gap-1">
              <div className="flex-[7] bg-white/20 rounded flex items-center justify-center">
                <span className="text-white text-[8px]">Content</span>
              </div>
              <div className="flex-[3] bg-white/20 rounded flex items-center justify-center">
                <span className="text-white text-[8px]">Side</span>
              </div>
            </div>
            <div className="h-[15%] bg-white/20 rounded flex items-center justify-center">
              <span className="text-white text-[8px]">Footer</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Design Studio</h2>
          <p className="text-muted-foreground">
            Define screen layouts with zones, widgets, and dynamic areas
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Layout
        </Button>
      </div>

      {/* Layout Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {layouts.map((layout) => (
          <Card 
            key={layout.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleLayoutClick(layout)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Layout className="w-5 h-5" />
                {layout.name}
              </CardTitle>
              <CardDescription>{layout.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Preview */}
              <div className="mb-4">
                {getLayoutPreview(layout)}
              </div>
              
              {/* Zone Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Layers className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{layout.zones.length} Zones</span>
                </div>
                
                {/* Zone List */}
                <div className="space-y-1 ml-6">
                  {layout.zones.map((zone) => (
                    <div key={zone.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ChevronRight className="w-3 h-3" />
                      <span>{zone.name}</span>
                      <span className="text-blue-600">({zone.widget})</span>
                      {zone.playlistName && (
                        <span className="text-green-600">✓ {zone.playlistName}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Layout Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5" />
              {selectedLayout?.name} - Layout Editor
            </DialogTitle>
            <DialogDescription>
              Configure zones, widgets, and assign playlists
            </DialogDescription>
          </DialogHeader>
          
          {selectedLayout && (
            <div className="space-y-6">
              {/* Layout Preview */}
              <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                {getLayoutPreview(selectedLayout)}
              </div>

              {/* Zones Configuration */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Zone Configuration
                </h3>
                
                {selectedLayout.zones.map((zone) => (
                  <div key={zone.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{zone.name}</div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          {zone.widget}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {zone.position.width}% × {zone.position.height}%
                        </span>
                      </div>
                    </div>
                    
                    {/* Playlist Assignment */}
                    <div className="flex items-center gap-4">
                      <Label className="text-sm">Assign Playlist:</Label>
                      <Select 
                        value={zone.playlistId || ''} 
                        onValueChange={(value) => handleZonePlaylistChange(zone.id, value)}
                      >
                        <SelectTrigger className="w-[250px]">
                          <SelectValue placeholder="Select playlist..." />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_PLAYLISTS.map((playlist) => (
                            <SelectItem key={playlist.id} value={playlist.id}>
                              {playlist.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {zone.playlistName && (
                        <span className="text-sm text-green-600 flex items-center gap-1">
                          <Play className="w-3 h-3" /> {zone.playlistName}
                        </span>
                      )}
                    </div>
                    
                    {/* Widget Settings */}
                    <div className="flex items-center gap-4">
                      <Label className="text-sm">Widget:</Label>
                      <Select defaultValue={zone.widget}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video-player">Video Player</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="text-ticker">Text Ticker</SelectItem>
                          <SelectItem value="playlist">Playlist</SelectItem>
                          <SelectItem value="clock">Clock/Time</SelectItem>
                          <SelectItem value="weather">Weather</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={() => setEditDialogOpen(false)}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Layout
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}