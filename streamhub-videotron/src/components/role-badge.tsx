/**
 * Role Badge Component
 * Displays user role with color coding
 */

'use client';

import { Badge } from '@/components/ui/badge';
import type { UserRole } from '@/types';
import { Shield, ShieldAlert, User } from 'lucide-react';

interface RoleBadgeProps {
  role: UserRole;
  showIcon?: boolean;
}

export function RoleBadge({ role, showIcon = true }: RoleBadgeProps) {
  const config = {
    superadmin: {
      label: 'Superadmin',
      variant: 'destructive' as const,
      icon: ShieldAlert,
      description: 'Full system access',
    },
    admin: {
      label: 'Admin',
      variant: 'default' as const,
      icon: Shield,
      description: 'Administrative access',
    },
    user: {
      label: 'User',
      variant: 'secondary' as const,
      icon: User,
      description: 'Regular user',
    },
  };

  const { label, variant, icon: Icon, description } = config[role];

  return (
    <Badge variant={variant} className="gap-1" title={description}>
      {showIcon && <Icon className="h-3 w-3" />}
      {label}
    </Badge>
  );
}
