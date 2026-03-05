/**
 * Users & Roles Page - Role Preset Management + User Management
 * Features: Role presets (CRUD), User management with role dropdown
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, rolePresetService } from '@/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, Pencil, Trash2, Shield, ShieldCheck, Badge } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import { User, UserRole, PageAccess } from '@/types/auth.types';
import { RolePreset, RolePresetCreate } from '@/types/role-preset.types';
import { RoleBadge } from '@/components/role-badge';

const ALL_PAGES = ['dashboard', 'channels', 'videos', 'composer', 'users', 'settings'] as const;

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Dialogs state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  
  // Form states
  const [createFormData, setCreateFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    confirmPassword: '',
    role: 'user' as UserRole,
    page_access: {} as PageAccess,
  });

  const [editFormData, setEditFormData] = useState({
    email: '',
    full_name: '',
    role: '' as UserRole | '',
    page_access: {} as PageAccess,
    is_active: true,
    password: '',
    confirmPassword: '',
  });

  const [roleFormData, setRoleFormData] = useState<RolePresetCreate>({
    name: '',
    description: '',
    page_access: {} as PageAccess,
  });

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<RolePreset | null>(null);

  // Fetch current user
  useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await authService.getCurrentUser();
      setCurrentUser(response.data);
      return response.data;
    },
  });

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await authService.getAllUsers();
      // Ensure we always return an array
      if (!response || !response.data) return [];
      if (Array.isArray(response.data)) return response.data as User[];
      if (Array.isArray(response)) return response as User[];
      return [];
    },
    enabled: !!currentUser,
  });

  const users = usersData || [];

  // Fetch role presets
  const { data: presetsData, isLoading: presetsLoading } = useQuery({
    queryKey: ['role-presets'],
    queryFn: async () => {
      const response = await rolePresetService.getAllPresets();
      // Ensure we always return an array
      if (!response || !response.data) return [];
      if (Array.isArray(response.data)) return response.data as RolePreset[];
      if (Array.isArray(response)) return response as RolePreset[];
      return [];
    },
    enabled: !!currentUser,
  });

  const presets = presetsData || [];

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setCreateDialogOpen(false);
      resetCreateForm();
      toast.success('User created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create user');
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: any }) =>
      authService.updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditDialogOpen(false);
      setSelectedUser(null);
      toast.success('User updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user');
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: authService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });

  // Create role preset mutation
  const createRoleMutation = useMutation({
    mutationFn: rolePresetService.createPreset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-presets'] });
      setRoleDialogOpen(false);
      setRoleFormData({
        name: '',
        description: '',
        page_access: {} as PageAccess,
      });
      toast.success('Role preset created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create role preset');
    },
  });

  // Delete role preset mutation
  const deleteRoleMutation = useMutation({
    mutationFn: rolePresetService.deletePreset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-presets'] });
      setSelectedPreset(null);
      toast.success('Role preset deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete role preset');
    },
  });

  // Helper functions
  const canManageUser = (targetUser: User): boolean => {
    if (!currentUser) return false;
    if (currentUser.id === targetUser.id) return false;
    if (currentUser.role === 'superadmin') return true;
    if (currentUser.role === 'admin' && targetUser.role === 'user') return true;
    return false;
  };

  const canEditUser = (targetUser: User): boolean => {
    if (!currentUser) return false;
    if (currentUser.id === targetUser.id) return true;
    return canManageUser(targetUser);
  };

  const resetCreateForm = () => {
    setCreateFormData({
      username: '',
      email: '',
      full_name: '',
      password: '',
      confirmPassword: '',
      role: 'user',
      page_access: {},
    });
  };

  const resetRoleForm = () => {
    setRoleFormData({
      name: '',
      description: '',
      page_access: {} as PageAccess,
    });
  };

  const handlePageAccessChange = (page: keyof PageAccess, checked: boolean) => {
    setRoleFormData(prev => ({
      ...prev,
      page_access: {
        ...prev.page_access,
        [page]: checked,
      },
    }));
  };

  // Handlers
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (createFormData.password !== createFormData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    createUserMutation.mutate(createFormData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    // Validate passwords match if provided
    if (editFormData.password && editFormData.password !== editFormData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    const data: any = {
      email: editFormData.email,
      full_name: editFormData.full_name,
      role: editFormData.role,
      page_access: editFormData.page_access,
      is_active: editFormData.is_active,
    };
    
    if (editFormData.password) {
      data.password = editFormData.password;
    }
    
    updateUserMutation.mutate({ userId: selectedUser.id, data });
  };

  const handleRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRoleMutation.mutate(roleFormData);
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      email: user.email,
      full_name: user.full_name || '',
      role: user.role,
      page_access: user.page_access || {},
      is_active: user.is_active,
      password: '',
      confirmPassword: '',
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const openRoleDeleteDialog = (preset: RolePreset) => {
    setSelectedPreset(preset);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    deleteUserMutation.mutate(selectedUser.id);
  };

  const handleDeleteRole = () => {
    if (!selectedPreset) return;
    deleteRoleMutation.mutate(selectedPreset.id);
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = presets.find(p => p.id === parseInt(presetId));
    if (preset) {
      setCreateFormData(prev => ({
        ...prev,
        role: 'user',
        page_access: preset.page_access,
      }));
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Users & Roles</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage system users and role presets
        </p>
      </div>

      {/* ROLE PRESETS SECTION */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Role Presets</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Predefined role configurations with page access permissions
            </p>
          </div>
          
          {/* Add Role Button - Only for admin/superadmin */}
          {currentUser?.role && currentUser.role !== 'user' && (
            <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetRoleForm}>
                  <Shield className="mr-2 h-4 w-4" />
                  Add Role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Role Preset</DialogTitle>
                  <DialogDescription>
                    Define a role template with specific page access permissions
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRoleSubmit}>
                  <div className="space-y-4 py-4">
                    {/* Role Name */}
                    <div className="space-y-2">
                      <Label htmlFor="role-name">Role Name *</Label>
                      <Input
                        id="role-name"
                        value={roleFormData.name}
                        onChange={(e) => setRoleFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Moderator, Editor, Viewer"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="role-description">Description</Label>
                      <Input
                        id="role-description"
                        value={roleFormData.description || ''}
                        onChange={(e) => setRoleFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of this role"
                      />
                    </div>

                    {/* Page Access Permissions */}
                    <div className="space-y-2">
                      <Label>Page Access Permissions *</Label>
                      <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg">
                        {ALL_PAGES.map((page) => (
                          <div key={page} className="flex items-center space-x-2">
                            <Checkbox
                              id={`page-${page}`}
                              checked={roleFormData.page_access[page] || false}
                              onCheckedChange={(checked) =>
                                handlePageAccessChange(page, checked as boolean)
                              }
                            />
                            <Label
                              htmlFor={`page-${page}`}
                              className="cursor-pointer capitalize"
                            >
                              {page === 'composer' ? 'Playlist' : page}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setRoleDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createRoleMutation.isPending}>
                      {createRoleMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          Create Role
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Role Presets Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Page Access</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {presetsLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : presets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No role presets found
                  </TableCell>
                </TableRow>
              ) : (
                presets.map((preset) => (
                  <TableRow key={preset.id}>
                    <TableCell className="font-medium">{preset.name}</TableCell>
                    <TableCell>{preset.description || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(preset.page_access || {}).map(([page, access]) => (
                          access && (
                            <span
                              key={page}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded text-xs capitalize"
                            >
                              {page === 'composer' ? 'Playlist' : page}
                            </span>
                          )
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {preset.is_system ? (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded text-xs">
                          System
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded text-xs">
                          Custom
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {!preset.is_system && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openRoleDeleteDialog(preset)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* USERS SECTION */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Users</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage system users and their permissions
            </p>
          </div>

          {/* Add User Button - Only for admin/superadmin */}
          {currentUser?.role && currentUser.role !== 'user' && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetCreateForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Create a new user account with role and permissions
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSubmit}>
                  <div className="space-y-4 py-4">
                    {/* Role Preset Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="role-preset">Role Preset</Label>
                      <Select onValueChange={handlePresetSelect}>
                        <SelectTrigger id="role-preset">
                          <SelectValue placeholder="Select a role preset" />
                        </SelectTrigger>
                        <SelectContent>
                          {presets.map((preset) => (
                            <SelectItem key={preset.id} value={preset.id.toString()}>
                              {preset.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        Select a preset to auto-fill page access permissions
                      </p>
                    </div>

                    {/* Username */}
                    <div className="space-y-2">
                      <Label htmlFor="username">Username *</Label>
                      <Input
                        id="username"
                        value={createFormData.username}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, username: e.target.value }))}
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={createFormData.email}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>

                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        value={createFormData.full_name}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        required
                      />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={createFormData.password}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={createFormData.confirmPassword}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                      />
                      {createFormData.password && createFormData.confirmPassword && createFormData.password !== createFormData.confirmPassword && (
                        <p className="text-xs text-red-500">Passwords do not match</p>
                      )}
                    </div>

                    {/* Selected Page Access Summary */}
                    {Object.keys(createFormData.page_access || {}).length > 0 && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <Label className="text-sm font-medium">Selected Permissions:</Label>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Object.entries(createFormData.page_access || {}).map(([page, access]) => (
                            access && (
                              <span
                                key={page}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded text-xs capitalize"
                              >
                                {page === 'composer' ? 'Playlist' : page}
                              </span>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createUserMutation.isPending}>
                      {createUserMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create User'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Users Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Page Access</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell>
                      {user.is_active ? (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded text-xs">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded text-xs">
                          Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {Object.values(user.page_access || {}).filter(Boolean).length === 6 ? (
                        <span className="text-xs text-gray-600">All pages</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(user.page_access || {}).map(([page, access]) => (
                            access && (
                              <span
                                key={page}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded text-xs capitalize"
                              >
                                {page === 'composer' ? 'Playlist' : page}
                              </span>
                            )
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {canEditUser(user) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {canManageUser(user) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(user)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              {/* Role - Only for superadmin */}
              {currentUser?.role === 'superadmin' && selectedUser && (
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    value={editFormData.role}
                    onValueChange={(value) => setEditFormData(prev => ({ ...prev, role: value as UserRole }))}
                  >
                    <SelectTrigger id="edit-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="superadmin">Superadmin</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Change user role (only superadmin can modify roles)
                  </p>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="edit-full_name">Full Name *</Label>
                <Input
                  id="edit-full_name"
                  value={editFormData.full_name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  required
                />
              </div>

              {/* Password (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="edit-password">New Password (Optional)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Leave blank to keep current password"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="edit-confirmPassword">Confirm New Password</Label>
                <Input
                  id="edit-confirmPassword"
                  type="password"
                  value={editFormData.confirmPassword}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Re-enter new password"
                />
                {editFormData.password && editFormData.confirmPassword && editFormData.password !== editFormData.confirmPassword && (
                  <p className="text-xs text-red-500">Passwords do not match</p>
                )}
              </div>

              {/* Is Active */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-is_active"
                  checked={editFormData.is_active}
                  onCheckedChange={(checked) =>
                    setEditFormData(prev => ({ ...prev, is_active: checked as boolean }))
                  }
                />
                <Label htmlFor="edit-is_active" className="cursor-pointer">
                  Active
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update User'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedPreset ? 'Delete Role Preset' : 'Delete User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedPreset
                ? `Are you sure you want to delete the role preset "${selectedPreset.name}"? This action cannot be undone.`
                : selectedUser
                ? `Are you sure you want to delete user "${selectedUser.full_name}"? This action cannot be undone.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={selectedPreset ? handleDeleteRole : handleDeleteUser}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
