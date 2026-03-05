/**
 * Channel Service
 */

import { apiClient } from '@/lib/api-client';
import type {
  ApiResponse,
  PaginatedResponse,
  Channel,
  ChannelCreate,
  ChannelUpdate,
  ChannelListParams,
  StreamingStatus,
} from '@/types';

export const channelService = {
  /**
   * Get all channels
   */
  async getAll(params?: ChannelListParams): Promise<ApiResponse<Channel[]>> {
    const response = await apiClient.get<ApiResponse<Channel[]>>(
      '/channels/',
      { params }
    );
    return response.data;
  },

  /**
   * Get channel by ID
   */
  async getById(id: number): Promise<ApiResponse<Channel>> {
    const response = await apiClient.get<ApiResponse<Channel>>(
      `/channels/${id}`
    );
    return response.data;
  },

  /**
   * Create new channel
   */
  async create(data: ChannelCreate): Promise<ApiResponse<Channel>> {
    const response = await apiClient.post<ApiResponse<Channel>>(
      '/channels/',
      data
    );
    return response.data;
  },

  /**
   * Update channel
   */
  async update(id: number, data: ChannelUpdate): Promise<ApiResponse<Channel>> {
    const response = await apiClient.put<ApiResponse<Channel>>(
      `/channels/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete channel
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/channels/${id}`);
  },

  /**
   * Turn on channel for streaming
   */
  async turnOnAir(id: number): Promise<ApiResponse<StreamingStatus>> {
    const response = await apiClient.post<ApiResponse<StreamingStatus>>(
      `/streaming/channels/${id}/on-air`
    );
    return response.data;
  },

  /**
   * Turn off channel streaming
   */
  async turnOffAir(id: number): Promise<ApiResponse<StreamingStatus>> {
    const response = await apiClient.post<ApiResponse<StreamingStatus>>(
      `/streaming/channels/${id}/off-air`
    );
    return response.data;
  },

  /**
   * Get channel streaming status
   */
  async getStreamingStatus(id: number): Promise<ApiResponse<StreamingStatus>> {
    const response = await apiClient.get<ApiResponse<StreamingStatus>>(
      `/streaming/channels/${id}/status`
    );
    return response.data;
  },
};
