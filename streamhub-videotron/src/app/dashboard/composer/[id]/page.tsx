/**
 * Layout Editor Page
 * Full-screen layout editor with LayoutBuilder component (lazy loaded)
 * TASK-B7: Integrated with Layouts API
 * PERFORMANCE: Code splitting with dynamic import
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { layoutService } from '@/services';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Layout } from '@/types';

// Lazy load LayoutBuilder for code splitting
const LayoutBuilder = dynamic(
  () => import('@/components/composer/LayoutBuilder'),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    ),
    ssr: false, // LayoutBuilder is client-only
  }
);

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
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    }>
      <LayoutBuilder
        layoutId={layoutId === 'new' ? undefined : layoutId}
        initialLayout={layout || undefined}
        onSave={handleSave}
        onCancel={handleCancel}
        mode="edit"
      />
    </Suspense>
  );
}
