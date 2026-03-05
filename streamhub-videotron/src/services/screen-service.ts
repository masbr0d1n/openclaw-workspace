/**
 * Screen Service - Videotron
 * Handles all screen/device management API calls
 */

import { apiClient } from '@/lib/api-client';
import type {
  ScreensResponse,
  ScreenResponse,
  Screen,
  ScreenCreate,
  ScreenUpdate,
  ScreenHeartbeat,
  ScreenListParams,
  ScreenGroupsResponse,
  ScreenGroupResponse,
  ScreenGroup,
  ScreenGroupCreate,
  HeartbeatResponse,
} from '@/types';

export const screenService = {
  /**
   * Get all screens with optional filtering and pagination
   */
  async getScreens(params?: ScreenListParams): Promise<ScreensResponse> {
    const response = await apiClient.get<ScreensResponse>(
      '/screens/',
      { params }
    );
    return response.data;
  },

  /**
   * Get screen by ID
   */
  async getScreenById(id: string): Promise<ScreenResponse> {
    const response = await apiClient.get<ScreenResponse>(
      `/screens/${id}`
    );
    return response.data;
  },

  /**
   * Create new screen
   */
  async createScreen(data: ScreenCreate): Promise<ScreenResponse> {
    const response = await apiClient.post<ScreenResponse>(
      '/screens/',
      data
    );
    return response.data;
  },

  /**
   * Update screen
   */
  async updateScreen(id: string, data: ScreenUpdate): Promise<ScreenResponse> {
    const response = await apiClient.put<ScreenResponse>(
      `/screens/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete screen
   */
  async deleteScreen(id: string): Promise<void> {
    await apiClient.delete(`/screens/${id}`);
  },

  /**
   * Send heartbeat for screen
   */
  async sendHeartbeat(id: string, status: ScreenHeartbeat['status']): Promise<HeartbeatResponse> {
    const response = await apiClient.post<HeartbeatResponse>(
      `/screens/${id}/heartbeat`,
      { status }
    );
    return response.data;
  },

  /**
   * Get all screen groups
   */
  async getScreenGroups(): Promise<ScreenGroupsResponse> {
    const response = await apiClient.get<ScreenGroupsResponse>(
      '/screens/groups'
    );
    return response.data;
  },

  /**
   * Create new screen group
   */
  async createScreenGroup(data: ScreenGroupCreate): Promise<ScreenGroupResponse> {
    const response = await apiClient.post<ScreenGroupResponse>(
      '/screens/groups',
      data
    );
    return response.data;
  },
};
