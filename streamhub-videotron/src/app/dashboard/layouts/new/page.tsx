/**
 * New Layout Page - Redirect to composer
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewLayoutPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard/composer/new');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-lg font-medium">Redirecting to layout editor...</p>
      </div>
    </div>
  );
}
