'use client';

import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Copy,
  Layout,
  Grid3X3,
  Monitor,
  Smartphone,
  Tv
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

// Template Types
type Category = 'all' | 'promo' | 'corporate' | 'event' | 'announcement';
type AspectRatio = 'all' | '16:9' | '9:16' | '32:9';

interface Template {
  id: string;
  name: string;
  category: Category;
  aspectRatio: string;
  thumbnail: string;
  description: string;
}

// Default templates
const DEFAULT_TEMPLATES: Template[] = [
  {
    id: '1',
    name: 'Promo Sale',
    category: 'promo',
    aspectRatio: '16:9',
    thumbnail: 'bg-gradient-to-br from-red-500 to-orange-500',
    description: ' promotional content'
  },
  {
    id: '2',
    name: 'Flash Discount',
    category: 'promo',
    aspectRatio: '16:9',
    thumbnail: 'bg-gradient-to-br from-yellow-500 to-amber-500',
    description: 'Flash sale promotional'
  },
  {
    id: '3',
    name: 'Event Banner',
    category: 'event',
    aspectRatio: '9:16',
    thumbnail: 'bg-gradient-to-br from-purple-500 to-pink-500',
    description: 'Vertical event promotion'
  },
  {
    id: '4',
    name: 'Corporate Welcome',
    category: 'corporate',
    aspectRatio: '16:9',
    thumbnail: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    description: 'Corporate welcome message'
  },
  {
    id: '5',
    name: 'Announcement',
    category: 'announcement',
    aspectRatio: '32:9',
    thumbnail: 'bg-gradient-to-br from-green-500 to-teal-500',
    description: 'Wide screen announcement'
  },
  {
    id: '6',
    name: 'Product Launch',
    category: 'promo',
    aspectRatio: '16:9',
    thumbnail: 'bg-gradient-to-br from-indigo-500 to-violet-500',
    description: 'Product launch promo'
  }
];

export function TemplatesContent() {
  const [templates] = useState<Template[]>(DEFAULT_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<Category>('all');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('all');

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'all' || template.category === category;
    const matchesAspect = aspectRatio === 'all' || template.aspectRatio === aspectRatio;
    return matchesSearch && matchesCategory && matchesAspect;
  });

  // Get aspect ratio icon
  const getAspectIcon = (ratio: string) => {
    switch (ratio) {
      case '16:9': return <Monitor className="w-4 h-4" />;
      case '9:16': return <Smartphone className="w-4 h-4" />;
      case '32:9': return <Tv className="w-4 h-4" />;
      default: return <Grid3X3 className="w-4 h-4" />;
    }
  };

  // Get preview placeholder
  const getPreview = (template: Template) => {
    const aspectClass = 
      template.aspectRatio === '16:9' ? 'aspect-video' :
      template.aspectRatio === '9:16' ? 'aspect-[9/16]' :
      'aspect-[32/9]';
    
    return (
      <div className={`w-full ${aspectClass} ${template.thumbnail} rounded-lg flex items-center justify-center`}>
        <Layout className="w-8 h-8 text-white/50" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Templates</h2>
          <p className="text-muted-foreground">
            Create and manage reusable content templates
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <Select value={category} onValueChange={(value) => setCategory(value as Category)}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="promo">Promo</SelectItem>
            <SelectItem value="corporate">Corporate</SelectItem>
            <SelectItem value="event">Event</SelectItem>
            <SelectItem value="announcement">Announcement</SelectItem>
          </SelectContent>
        </Select>

        {/* Aspect Ratio Filter */}
        <Select value={aspectRatio} onValueChange={(value) => setAspectRatio(value as AspectRatio)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Aspect Ratio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratios</SelectItem>
            <SelectItem value="16:9">16:9</SelectItem>
            <SelectItem value="9:16">9:16</SelectItem>
            <SelectItem value="32:9">32:9</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Template Cards Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No templates found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Preview */}
              <CardContent className="p-4">
                {getPreview(template)}
              </CardContent>

              {/* Info */}
              <CardFooter className="flex flex-col items-start gap-2 pb-4">
                <div>
                  <h3 className="font-semibold">{template.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {getAspectIcon(template.aspectRatio)}
                    <span>{template.aspectRatio}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 w-full pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Copy className="w-3 h-3 mr-1" />
                    Duplicate
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}