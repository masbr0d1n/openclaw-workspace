/**
 * Device List Page - Videotron (alias to view-all-devices)
 */

'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function DeviceListPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = parseInt(params.id as string) || 1;

  useEffect(() => {
    // Redirect to existing view-all-devices page
    router.replace(`/dashboard/tenant/${tenantId}/view-all-devices`);
  }, [tenantId, router]);

  return (
    <div className="container mx-auto py-8 px-4">
      <p className="text-center text-gray-500">Redirecting to device list...</p>
    </div>
  );
}
