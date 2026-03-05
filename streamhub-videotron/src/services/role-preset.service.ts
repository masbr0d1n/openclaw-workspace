/**
 * Role Preset Service - API calls for role preset management
 */

import apiClient from '@/lib/api-client';
import { RolePreset, RolePresetCreate, RolePresetUpdate, RolePresetListResponse } from '@/types/role-preset.types';

export const rolePresetService = {
  /**
   * Get all role presets
   */
  async getAllPresets(includeInactive: boolean = false): Promise<RolePresetListResponse> {
    const response = await apiClient.get<RolePresetListResponse>('/role-presets', {
      params: { include_inactive: includeInactive }
    });
    return response.data;
  },

  /**
   * Get role preset by ID
   */
  async getPresetById(presetId: number): Promise<{ status: boolean; data: RolePreset }> {
    const response = await apiClient.get<{ status: boolean; data: RolePreset }>(`/role-presets/${presetId}`);
    return response.data;
  },

  /**
   * Create new role preset
   */
  async createPreset(data: RolePresetCreate): Promise<{ status: boolean; data: RolePreset }> {
    const response = await apiClient.post<{ status: boolean; data: RolePreset }>('/role-presets', data);
    return response.data;
  },

  /**
   * Update role preset
   */
  async updatePreset(presetId: number, data: RolePresetUpdate): Promise<{ status: boolean; data: RolePreset }> {
    const response = await apiClient.put<{ status: boolean; data: RolePreset }>(`/role-presets/${presetId}`, data);
    return response.data;
  },

  /**
   * Delete role preset
   */
  async deletePreset(presetId: number): Promise<{ status: boolean; data: { id: number; name: string } }> {
    const response = await apiClient.delete<{ status: boolean; data: { id: number; name: string } }>(
      `/role-presets/${presetId}`
    );
    return response.data;
  },
};
