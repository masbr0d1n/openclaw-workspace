/**
 * Role Preset Types
 */

export interface PageAccess {
  dashboard?: boolean;
  channels?: boolean;
  videos?: boolean;
  composer?: boolean;
  users?: boolean;
  settings?: boolean;
}

export interface RolePreset {
  id: number;
  name: string;
  description: string | null;
  page_access: PageAccess;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
}

export interface RolePresetCreate {
  name: string;
  description?: string;
  page_access: PageAccess;
}

export interface RolePresetUpdate {
  name?: string;
  description?: string;
  page_access?: PageAccess;
  is_active?: boolean;
}

export interface RolePresetListResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: RolePreset[];
}
