/**
 * Layout Service - Videotron
 * Handles all layout management API calls
 */

import { apiClient } from '@/lib/api-client';
import type {
  LayoutsResponse,
  LayoutResponse,
  Layout,
  LayoutCreate,
  LayoutUpdate,
  LayoutDuplicate,
  LayoutListParams,
  DuplicateLayoutResponse,
} from '@/types';

export const layoutService = {
  /**
   * Get all layouts with optional filtering and pagination
   */
  async getLayouts(params?: LayoutListParams): Promise<LayoutsResponse> {
    const response = await apiClient.get<LayoutsResponse>(
      '/layouts/',
      { params }
    );
    return response.data;
  },

  /**
   * Get layout by ID
   */
  async getLayoutById(id: string): Promise<LayoutResponse> {
    const response = await apiClient.get<LayoutResponse>(
      `/layouts/${id}`
    );
    return response.data;
  },

  /**
   * Create new layout
   */
  async createLayout(data: LayoutCreate): Promise<LayoutResponse> {
    const response = await apiClient.post<LayoutResponse>(
      '/layouts/',
      data
    );
    return response.data;
  },

  /**
   * Update layout
   */
  async updateLayout(id: string, data: LayoutUpdate): Promise<LayoutResponse> {
    const response = await apiClient.put<LayoutResponse>(
      `/layouts/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete layout
   */
  async deleteLayout(id: string): Promise<void> {
    await apiClient.delete(`/layouts/${id}`);
  },

  /**
   * Duplicate layout
   */
  async duplicateLayout(id: string, data?: LayoutDuplicate): Promise<DuplicateLayoutResponse> {
    const response = await apiClient.post<DuplicateLayoutResponse>(
      `/layouts/${id}/duplicate`,
      data || {}
    );
    return response.data;
  },
};
