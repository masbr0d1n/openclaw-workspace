/**
 * Layout Editor Page
 * Full-screen layout editor with LayoutBuilder component
 * TASK-B7: Integrated with Layouts API
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { layoutService } from '@/services';
import LayoutBuilder from '@/components/composer/LayoutBuilder';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Layout } from '@/types';

export default function LayoutEditorPage() {
  const params = useParams();
  const router = useRouter();
  const layoutId = params.id as string;

  const [layout, setLayout] = useState<Layout | null>(null);

  // Fetch layout detail
  const { data: layoutData, isLoading, error } = useQuery({
    queryKey: ['layout', layoutId],
    queryFn: async () => {
      const response = await layoutService.getLayoutById(layoutId);
      return response.layout;
    },
    enabled: !!layoutId && layoutId !== 'new',
  });

  useEffect(() => {
    if (layoutData) {
      setLayout(layoutData);
    }
  }, [layoutData]);

  useEffect(() => {
    if (error) {
      toast.error('Failed to load layout');
    }
  }, [error]);

  const handleSave = (savedLayout: Layout) => {
    setLayout(savedLayout);
    // If this was a new layout, redirect to the edit page
    if (layoutId === 'new') {
      router.push(`/dashboard/composer/${savedLayout.id}`);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/composer');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <LayoutBuilder
      layoutId={layoutId === 'new' ? undefined : layoutId}
      initialLayout={layout || undefined}
      onSave={handleSave}
      onCancel={handleCancel}
      mode="edit"
    />
  );
}
