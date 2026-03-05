/**
 * Campaign Management Page for Videotron
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Play, Pause, Clock, Calendar, Target, Megaphone, Monitor, ChevronRight, Eye } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

interface ScreenGroup {
  id: string;
  name: string;
  location: string;
  screenCount: number;
  screens: string[];
}

export default function CampaignPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
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
          screens: ['Screen 1', 'Screen 2', 'Screen 3', 'Screen 4', 'Screen 5', 'Screen 6', 'Screen 7', 'Screen 8', 'Screen 9', 'Screen 10', 'Screen 11', 'Screen 12', 'Screen 13', 'Screen 14', 'Screen 15'],
        },
        {
          id: 'food-court',
          name: 'Food Court Group',
          location: 'Food Court',
          screenCount: 20,
          screens: ['Screen 1', 'Screen 2', 'Screen 3', 'Screen 4', 'Screen 5', 'Screen 6', 'Screen 7', 'Screen 8', 'Screen 9', 'Screen 10', 'Screen 11', 'Screen 12', 'Screen 13', 'Screen 14', 'Screen 15', 'Screen 16', 'Screen 17', 'Screen 18', 'Screen 19', 'Screen 20'],
        },
      ],
      budget: 50000000,
      spent: 27500000,
    },
    {
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
          screens: ['Screen 1', 'Screen 2', 'Screen 3', 'Screen 4', 'Screen 5', 'Screen 6', 'Screen 7', 'Screen 8', 'Screen 9', 'Screen 10', 'Screen 11', 'Screen 12', 'Screen 13', 'Screen 14', 'Screen 15'],
        },
        {
          id: 'extension',
          name: 'Extension Area Group',
          location: 'Extension Area',
          screenCount: 15,
          screens: ['Screen 1', 'Screen 2', 'Screen 3', 'Screen 4', 'Screen 5', 'Screen 6', 'Screen 7', 'Screen 8', 'Screen 9', 'Screen 10', 'Screen 11', 'Screen 12', 'Screen 13', 'Screen 14', 'Screen 15'],
        },
      ],
      budget: 75000000,
      spent: 0,
    },
    {
      id: 3,
      name: 'Summer Sale Grand Indonesia',
      description: 'Promo diskon musim panas',
      status: 'paused',
      startDate: '2026-01-15',
      endDate: '2026-02-28',
      tenant: 'Grand Indonesia',
      tenantId: 2,
      locations: 3,
      screens: 120,
      screenGroups: [
        {
          id: 'west-mall',
          name: 'West Mall Group',
          location: 'West Mall',
          screenCount: 40,
          screens: Array.from({ length: 40 }, (_, i) => `Screen ${i + 1}`),
        },
        {
          id: 'east-mall',
          name: 'East Mall Group',
          location: 'East Mall',
          screenCount: 50,
          screens: Array.from({ length: 50 }, (_, i) => `Screen ${i + 1}`),
        },
        {
          id: 'skybridge',
          name: 'Skybridge Group',
          location: 'Skybridge',
          screenCount: 30,
          screens: Array.from({ length: 30 }, (_, i) => `Screen ${i + 1}`),
        },
      ],
      budget: 100000000,
      spent: 45000000,
    },
  ]);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'scheduled' as Campaign['status'],
    startDate: '',
    endDate: '',
    tenant: '',
    tenantId: 0,
    locations: 0,
    screens: 0,
    budget: 0,
    screenGroups: [] as ScreenGroup[],
  });
  const [showScreenDialog, setShowScreenDialog] = useState(false);

  const tenants = [
    { value: 'mall-central-jakarta', label: 'Mall Central Jakarta' },
    { value: 'grand-indonesia', label: 'Grand Indonesia' },
    { value: 'plaza-indonesia', label: 'Plaza Indonesia' },
  ];

  const activeCount = campaigns.filter(c => c.status === 'active').length;
  const totalBudget = campaigns.reduce((acc, c) => acc + c.budget, 0);
  const totalSpent = campaigns.reduce((acc, c) => acc + c.spent, 0);
  const totalScreens = campaigns.reduce((acc, c) => acc + c.screens, 0);

  const viewCampaignScreens = (campaign: Campaign) => {
    router.push(`/dashboard/campaign/${campaign.id}`);
  };

  const handleAddCampaign = () => {
    const tenantObj = tenants.find(t => t.value === formData.tenant);
    const tenantId = parseInt(tenantObj?.value.split('-').pop() || '1');
    
    const newCampaign: Campaign = {
      id: campaigns.length + 1,
      name: formData.name,
      description: formData.description,
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate,
      tenant: tenantObj?.label || '',
      tenantId: tenantId,
      locations: formData.locations,
      screens: formData.screens,
      screenGroups: [],
      budget: formData.budget,
      spent: 0,
    };
    setCampaigns([...campaigns, newCampaign]);
    setAddDialogOpen(false);
    setFormData({ name: '', description: '', status: 'scheduled', startDate: '', endDate: '', tenant: '', tenantId: 0, locations: 0, screens: 0, budget: 0, screenGroups: [] });
    toast.success('Campaign created successfully');
  };

  const handleEditCampaign = () => {
    if (selectedCampaign) {
      const tenantObj = tenants.find(t => t.value === formData.tenant);
      const tenantId = parseInt(tenantObj?.value.split('-').pop() || '1');
      
      setCampaigns(campaigns.map(c =>
        c.id === selectedCampaign.id
          ? { 
              ...c, 
              ...formData, 
              tenant: tenantObj?.label || c.tenant,
              tenantId: tenantId,
            }
          : c
      ));
      setEditDialogOpen(false);
      setSelectedCampaign(null);
      setFormData({ name: '', description: '', status: 'scheduled', startDate: '', endDate: '', tenant: '', tenantId: 0, locations: 0, screens: 0, budget: 0, screenGroups: [] });
      toast.success('Campaign updated successfully');
    }
  };

  const handleDeleteCampaign = (id: number) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
    toast.success('Campaign deleted successfully');
  };

  const toggleStatus = (id: number) => {
    setCampaigns(campaigns.map(c => {
      if (c.id === id) {
        const newStatus: Campaign['status'] = c.status === 'active' ? 'paused' : 'active';
        return { ...c, status: newStatus };
      }
      return c;
    }));
    toast.success('Campaign status updated');
  };

  const openEditDialog = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description,
      status: campaign.status,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      tenant: campaign.name.toLowerCase().replace(/\s+/g, '-'),
      tenantId: campaign.tenantId,
      locations: campaign.locations,
      screens: campaign.screens,
      budget: campaign.budget,
      screenGroups: campaign.screenGroups,
    });
    setEditDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Megaphone className="h-8 w-8 text-primary" />
            Campaign Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage advertising campaigns for Videotron tenants
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Set up a new advertising campaign
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Promo Lebaran 2026"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="tenant">Tenant</Label>
                <Select value={formData.tenant} onValueChange={(value) => setFormData({ ...formData, tenant: value })}>
                  <SelectTrigger id="tenant">
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="locations">Locations</Label>
                  <Input
                    id="locations"
                    type="number"
                    value={formData.locations}
                    onChange={(e) => setFormData({ ...formData, locations: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="screens">Screens</Label>
                  <Input
                    id="screens"
                    type="number"
                    value={formData.screens}
                    onChange={(e) => setFormData({ ...formData, screens: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="budget">Budget (IDR)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                  placeholder="50000000"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCampaign}>Create Campaign</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeCount} active
            </p>
          </CardContent>
        </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Screens</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalScreens}</div>
              <p className="text-xs text-muted-foreground">
                Across all campaigns
              </p>
            </CardContent>
          </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {(totalBudget / 1000000).toFixed(0)}M
            </div>
            <p className="text-xs text-muted-foreground">
              Allocated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {(totalSpent / 1000000).toFixed(0)}M
            </div>
            <p className="text-xs text-muted-foreground">
              {((totalSpent / totalBudget) * 100).toFixed(0)}% utilized
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>Manage and monitor advertising campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Screen Groups</TableHead>
                <TableHead>Screens</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div>
                      <div className="font-semibold">{campaign.name}</div>
                      <div className="text-xs text-gray-500">{campaign.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>{campaign.tenant}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {campaign.screenGroups.map((group) => (
                        <div key={group.id} className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="text-xs">
                            {group.name}
                          </Badge>
                          <span className="text-gray-500">
                            {group.screenCount} screens
                          </span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-gray-400" />
                      <span>{campaign.screens}</span>
                      <span className="text-xs text-gray-500">({campaign.screenGroups.length} groups)</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-semibold">Rp {(campaign.budget / 1000000).toFixed(1)}M</div>
                      <div className="text-xs text-gray-500">
                        Spent: Rp {(campaign.spent / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      campaign.status === 'active' ? 'default' :
                      campaign.status === 'scheduled' ? 'secondary' :
                      campaign.status === 'paused' ? 'destructive' :
                      'outline'
                    }>
                      {campaign.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/campaign/${campaign.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="View Screens"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStatus(campaign.id)}
                            title={campaign.status === 'active' ? 'Pause' : 'Activate'}
                          >
                            {campaign.status === 'active' ? (
                              <Pause className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <Play className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(campaign)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCampaign(campaign.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
            <DialogDescription>
              Update campaign details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Campaign Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-tenant">Tenant</Label>
              <Select value={formData.tenant} onValueChange={(value) => setFormData({ ...formData, tenant: value })}>
                <SelectTrigger id="edit-tenant">
                  <SelectValue placeholder="Select tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-locations">Locations</Label>
                <Input
                  id="edit-locations"
                  type="number"
                  value={formData.locations}
                  onChange={(e) => setFormData({ ...formData, locations: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-screens">Screens</Label>
                <Input
                  id="edit-screens"
                  type="number"
                  value={formData.screens}
                  onChange={(e) => setFormData({ ...formData, screens: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-budget">Budget (IDR)</Label>
              <Input
                id="edit-budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCampaign}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
