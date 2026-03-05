/**
 * Layouts Page - Videotron
 * List and manage digital signage layouts
 * Integrated with Layouts API (TASK-B7)
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { layoutService } from '@/services';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, MoreHorizontal, LayoutGrid, Eye, Edit, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import type { Layout } from '@/types';
import { formatDate } from '@/lib/utils';

export default function LayoutsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // State for dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<Layout | null>(null);

  // Form state
  const [layoutName, setLayoutName] = useState('');
  const [duplicateName, setDuplicateName] = useState('');

  // Fetch layouts
  const { data: layoutsData, isLoading: layoutsLoading } = useQuery({
    queryKey: ['layouts'],
    queryFn: async () => {
      const response = await layoutService.getLayouts();
      return response;
    },
    enabled: isAuthenticated,
  });

  const layouts = layoutsData?.layouts || [];

  // Create layout mutation
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; canvas_config: any; layers?: any[] }) => {
      return await layoutService.createLayout(data);
    },
    onSuccess: () => {
      toast.success('Layout created successfully');
      queryClient.invalidateQueries({ queryKey: ['layouts'] });
      setLayoutName('');
      setCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create layout');
    },
  });

  // Delete layout mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await layoutService.deleteLayout(id);
    },
    onSuccess: () => {
      toast.success('Layout deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['layouts'] });
      setDeleteDialogOpen(false);
      setSelectedLayout(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete layout');
    },
  });

  // Duplicate layout mutation
  const duplicateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name?: string }) => {
      return await layoutService.duplicateLayout(id, name ? { name } : undefined);
    },
    onSuccess: () => {
      toast.success('Layout duplicated successfully');
      queryClient.invalidateQueries({ queryKey: ['layouts'] });
      setDuplicateDialogOpen(false);
      setDuplicateName('');
      setSelectedLayout(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to duplicate layout');
    },
  });

  // Handle create layout
  const handleCreateLayout = () => {
    if (!layoutName.trim()) {
      toast.error('Please enter layout name');
      return;
    }

    createMutation.mutate({
      name: layoutName,
      canvas_config: {
        width: 1920,
        height: 1080,
        orientation: 'landscape' as const,
      },
      layers: [],
    });
  };

  // Handle delete layout
  const handleDeleteLayout = () => {
    if (selectedLayout) {
      deleteMutation.mutate(selectedLayout.id);
    }
  };

  // Handle duplicate layout
  const handleDuplicateLayout = () => {
    if (selectedLayout) {
      duplicateMutation.mutate({
        id: selectedLayout.id,
        name: duplicateName.trim() || undefined,
      });
    }
  };

  // Open duplicate dialog
  const handleOpenDuplicateDialog = (layout: Layout) => {
    setSelectedLayout(layout);
    setDuplicateName(`${layout.name} (Copy)`);
    setDuplicateDialogOpen(true);
  };

  // Navigate to composer for editing
  const handleEditLayout = (layoutId: string) => {
    router.push(`/dashboard/composer/${layoutId}`);
  };

  // Get layer count badge color
  const getLayerCountBadge = (count: number) => {
    if (count === 0) return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    if (count < 5) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
  };

  if (layoutsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Layouts</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage digital signage layouts
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Layout
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Layout</DialogTitle>
              <DialogDescription>
                Start with a blank canvas. You can add widgets and configure the layout in the composer.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Layout Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Layout Name</Label>
                <Input
                  id="name"
                  placeholder="Enter layout name"
                  value={layoutName}
                  onChange={(e) => setLayoutName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setLayoutName('')}
                disabled={createMutation.isPending}
              >
                Reset
              </Button>
              <Button
                onClick={handleCreateLayout}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Layout'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-col space-y-1.5">
            <p className="text-sm font-medium leading-none text-muted-foreground">Total Layouts</p>
            <p className="text-2xl font-bold">{layouts.length}</p>
          </div>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-col space-y-1.5">
            <p className="text-sm font-medium leading-none text-muted-foreground">With Layers</p>
            <p className="text-2xl font-bold">{layouts.filter(l => l.layers?.length > 0).length}</p>
          </div>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-col space-y-1.5">
            <p className="text-sm font-medium leading-none text-muted-foreground">Empty Layouts</p>
            <p className="text-2xl font-bold">{layouts.filter(l => !l.layers || l.layers.length === 0).length}</p>
          </div>
        </div>
      </div>

      {/* Layouts Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Layout Name</TableHead>
              <TableHead>Resolution</TableHead>
              <TableHead>Layers</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {layouts && layouts.length > 0 ? (
              layouts.map((layout: Layout) => (
                <TableRow key={layout.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <LayoutGrid className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{layout.name}</p>
                        <p className="text-xs text-muted-foreground">ID: {layout.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {layout.canvas_config?.width || 1920}x{layout.canvas_config?.height || 1080}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getLayerCountBadge(layout.layers?.length || 0)}>
                      {layout.layers?.length || 0} layers
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {formatDate(layout.created_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {formatDate(layout.updated_at)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditLayout(layout.id)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Layout
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/dashboard/composer/${layout.id}?view=preview`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleOpenDuplicateDialog(layout)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedLayout(layout);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <LayoutGrid className="h-8 w-8" />
                    <p>No layouts found. Create your first layout to get started.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Layout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedLayout?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLayout}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate Dialog */}
      <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Layout</DialogTitle>
            <DialogDescription>
              Create a copy of &quot;{selectedLayout?.name}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="duplicateName">New Layout Name</Label>
              <Input
                id="duplicateName"
                placeholder="Layout name"
                value={duplicateName}
                onChange={(e) => setDuplicateName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDuplicateDialogOpen(false)}
              disabled={duplicateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDuplicateLayout}
              disabled={duplicateMutation.isPending}
            >
              {duplicateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Duplicating...
                </>
              ) : (
                'Duplicate Layout'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
