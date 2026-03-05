/**
 * Campaign Detail Page - Screen Groups and Targeted Screens
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Monitor, Play, Pause, Edit, Trash2, ChevronRight, MapPin, Calendar, Target, Megaphone, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ScreenGroup {
  id: string;
  name: string;
  location: string;
  screenCount: number;
  screens: Array<{
    id: string;
    name: string;
    resolution: string;
    status: 'online' | 'offline';
  }>;
}

interface Campaign {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'scheduled' | 'paused' | 'completed';
  startDate: string;
  endDate: string;
  tenant: string;
  tenantId: number;
  locations: number;
  screens: number;
  screenGroups: ScreenGroup[];
  budget: number;
  spent: number;
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = parseInt(params.campaignId as string);

  const [campaign, setCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    // Mock data - fetch from API in production
    const mockCampaigns: Record<number, Campaign> = {
      1: {
        id: 1,
        name: 'Promo Lebaran 2026',
        description: 'Campaign promosi Ramadhan dan Lebaran',
        status: 'active',
        startDate: '2026-02-15',
        endDate: '2026-04-15',
        tenant: 'Mall Central Jakarta',
        tenantId: 1,
        locations: 2,
        screens: 35,
        screenGroups: [
          {
            id: 'main-lobby',
            name: 'Main Lobby Group',
            location: 'Main Lobby',
            screenCount: 15,
            screens: Array.from({ length: 15 }, (_, i) => ({
              id: `scr-ml-${i + 1}`,
              name: `Screen ${i + 1} - Main Lobby`,
              resolution: '1920x1080',
              status: i < 12 ? 'online' : 'offline',
            })),
          },
          {
            id: 'food-court',
            name: 'Food Court Group',
            location: 'Food Court',
            screenCount: 20,
            screens: Array.from({ length: 20 }, (_, i) => ({
              id: `scr-fc-${i + 1}`,
              name: `Screen ${i + 1} - Food Court`,
              resolution: '1920x1080',
              status: i < 18 ? 'online' : 'offline',
            })),
          },
        ],
        budget: 50000000,
        spent: 27500000,
      },
      2: {
        id: 2,
        name: 'Grand Opening Plaza Indonesia',
        description: 'Campaign pembukaan gedung baru',
        status: 'scheduled',
        startDate: '2026-03-01',
        endDate: '2026-03-31',
        tenant: 'Plaza Indonesia',
        tenantId: 3,
        locations: 2,
        screens: 30,
        screenGroups: [
          {
            id: 'main-entrance',
            name: 'Main Entrance Group',
            location: 'Main Entrance',
            screenCount: 15,
            screens: Array.from({ length: 15 }, (_, i) => ({
              id: `scr-me-${i + 1}`,
              name: `Screen ${i + 1} - Main Entrance`,
              resolution: '1920x1080',
              status: 'offline',
            })),
          },
          {
            id: 'extension',
            name: 'Extension Area Group',
            location: 'Extension Area',
            screenCount: 15,
            screens: Array.from({ length: 15 }, (_, i) => ({
              id: `scr-ea-${i + 1}`,
              name: `Screen ${i + 1} - Extension Area`,
              resolution: '1920x1080',
              status: 'offline',
            })),
          },
        ],
        budget: 75000000,
        spent: 0,
      },
    };

    setCampaign(mockCampaigns[campaignId] || null);
  }, [campaignId]);

  if (!campaign) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/campaign')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Campaigns
        </Button>
        <Card className="mt-4">
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Campaign not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const toggleStatus = () => {
    const newStatus: Campaign['status'] = campaign.status === 'active' ? 'paused' : 'active';
    setCampaign({ ...campaign, status: newStatus });
    toast.success(`Campaign ${newStatus}`);
  };

  const onlineScreens = campaign.screenGroups.reduce(
    (acc, group) => acc + group.screens.filter(s => s.status === 'online').length,
    0
  );

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/campaign')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Megaphone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{campaign.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{campaign.description}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={toggleStatus}>
            {campaign.status === 'active' ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                {campaign.status === 'paused' ? 'Resume' : 'Start'}
              </>
            )}
          </Button>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={
              campaign.status === 'active' ? 'default' :
              campaign.status === 'scheduled' ? 'secondary' :
              campaign.status === 'paused' ? 'destructive' :
              'outline'
            } className="capitalize">
              {campaign.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div>{new Date(campaign.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              <div className="text-gray-500">to {new Date(campaign.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Screen Groups</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.screenGroups.length}</div>
            <p className="text-xs text-muted-foreground">
              {campaign.locations} locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Screens</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.screens}</div>
            <p className="text-xs text-muted-foreground">
              {onlineScreens} online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Rp {(campaign.budget / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">
              Rp {(campaign.spent / 1000000).toFixed(1)}M spent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Screen Groups */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Monitor className="h-6 w-6" />
            Screen Groups & Targeted Screens
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Detailed view of all screen groups and individual screens assigned to this campaign
          </p>
        </div>

        {campaign.screenGroups.map((group, groupIndex) => {
          const onlineCount = group.screens.filter(s => s.status === 'online').length;
          
          return (
            <Card key={group.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Monitor className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {group.name}
                        <Badge variant="outline">{group.screenCount} screens</Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4" />
                        {group.location}
                        <span>•</span>
                        <span>{onlineCount} online, {group.screenCount - onlineCount} offline</span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                      Add Screen
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.screens.map((screen) => (
                    <div
                      key={screen.id}
                      className="p-4 rounded-lg border bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Monitor className={`h-4 w-4 ${screen.status === 'online' ? 'text-green-500' : 'text-gray-400'}`} />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{screen.name}</p>
                            <p className="text-xs text-gray-500">{screen.resolution}</p>
                          </div>
                        </div>
                        <Badge variant={screen.status === 'online' ? 'default' : 'secondary'} className="text-xs">
                          {screen.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-xs text-gray-500">ID: {screen.id}</span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Screen Group Button */}
      <div className="mt-6">
        <Button variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add New Screen Group
        </Button>
      </div>
    </div>
  );
}
