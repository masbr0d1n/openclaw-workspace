/**
 * Composer Page - Layout Management
 * List and manage layouts with quick access to editor
 * TASK-B7: Integrated with Layouts API
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
import { Loader2, Plus, MoreHorizontal, LayoutGrid, Eye, Edit, Trash2, Copy, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import type { Layout } from '@/types';
import { formatDate } from '@/lib/utils';

export default function ComposerPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // State for dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<Layout | null>(null);
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

  // Navigate to composer editor
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
          <h1 className="text-3xl font-bold">Layout Composer</h1>
          <p className="text-muted-foreground mt-1">
            Design and manage digital signage layouts
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/layouts/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Layout
        </Button>
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
            <p className="text-sm font-medium leading-none text-muted-foreground">Avg Layers</p>
            <p className="text-2xl font-bold">
              {layouts.length > 0 
                ? (layouts.reduce((acc, l) => acc + (l.layers?.length || 0), 0) / layouts.length).toFixed(1)
                : '0'
              }
            </p>
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
                          onClick={() => router.push(`/dashboard/layouts/${layout.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
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
      <AlertDialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate Layout</AlertDialogTitle>
            <AlertDialogDescription>
              Create a copy of &quot;{selectedLayout?.name}&quot;
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">New Layout Name</div>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={duplicateName}
                onChange={(e) => setDuplicateName(e.target.value)}
                placeholder="Layout name"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={duplicateMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDuplicateLayout}
              disabled={duplicateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {duplicateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Duplicating...
                </>
              ) : (
                'Duplicate Layout'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
