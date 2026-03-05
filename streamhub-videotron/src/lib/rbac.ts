/**
 * Role-Based Access Control (RBAC) for Videotron
 */

export type UserRole = 'superadmin' | 'tenant_admin' | 'editor' | 'viewer';

export interface Permission {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface RolePermissions {
  dashboard: Permission;
  screens: Permission;
  content: Permission;
  schedules: Permission;
  layouts: Permission;
  analytics: Permission;
  users: Permission;
  integrations: Permission;
  settings: Permission;
  tenants: Permission;
  subscriptions: Permission;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  superadmin: {
    dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    screens: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    content: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    schedules: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    layouts: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    analytics: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    users: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    integrations: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    settings: { canView: true, canCreate: false, canEdit: true, canDelete: false },
    tenants: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    subscriptions: { canView: true, canCreate: true, canEdit: true, canDelete: false },
  },
  tenant_admin: {
    dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    screens: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    content: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    schedules: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    layouts: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    analytics: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    users: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    integrations: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    settings: { canView: true, canCreate: false, canEdit: true, canDelete: false },
    tenants: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    subscriptions: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  },
  editor: {
    dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    screens: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    content: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    schedules: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    layouts: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    analytics: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    users: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    integrations: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    settings: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    tenants: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    subscriptions: { canView: false, canCreate: false, canEdit: false, canDelete: false },
  },
  viewer: {
    dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    screens: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    content: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    schedules: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    layouts: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    analytics: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    users: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    integrations: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    settings: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    tenants: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    subscriptions: { canView: false, canCreate: false, canEdit: false, canDelete: false },
  },
};

export function hasPermission(role: UserRole, resource: keyof RolePermissions, action: keyof Permission): boolean {
  return ROLE_PERMISSIONS[role][resource][action];
}

export function canViewMenu(role: UserRole, menuItem: string): boolean {
  const menuMap: Record<string, keyof RolePermissions> = {
    dashboard: 'dashboard',
    screens: 'screens',
    content: 'content',
    schedules: 'schedules',
    layouts: 'layouts',
    analytics: 'analytics',
    users: 'users',
    integrations: 'integrations',
    settings: 'settings',
    tenants: 'tenants',
    subscriptions: 'subscriptions',
  };

  const resource = menuMap[menuItem];
  if (!resource) return false;

  return ROLE_PERMISSIONS[role][resource].canView;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  tenant_admin: 'Tenant Admin',
  editor: 'Editor',
  viewer: 'Viewer',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  superadmin: 'Platform Owner - Full access to all tenants and features',
  tenant_admin: 'Manage users, screens, content, and view analytics',
  editor: 'Upload content and manage schedules',
  viewer: 'View analytics only',
};
