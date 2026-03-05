/**
 * Video Service
 */

import { apiClient } from '@/lib/api-client';
import type {
  ApiResponse,
  Video,
  VideoCreate,
  VideoUpdate,
  VideoListParams,
} from '@/types';

export const videoService = {
  /**
   * Get all videos
   */
  async getAll(params?: VideoListParams): Promise<ApiResponse<Video[]>> {
    const response = await apiClient.get<ApiResponse<Video[]>>(
      '/videos/',
      { params }
    );
    return response.data;
  },

  /**
   * Get all videos with params
   */
  async getAllWithParams(params: VideoListParams): Promise<ApiResponse<Video[]>> {
    const response = await apiClient.get<ApiResponse<Video[]>>(
      '/videos/',
      { params }
    );
    return response.data;
  },

  /**
   * Get video by ID
   */
  async getById(id: number): Promise<ApiResponse<Video>> {
    const response = await apiClient.get<ApiResponse<Video>>(
      `/videos/${id}`
    );
    return response.data;
  },

  /**
   * Get video by YouTube ID
   */
  async getByYoutubeId(youtubeId: string): Promise<ApiResponse<Video>> {
    const response = await apiClient.get<ApiResponse<Video>>(
      `/videos/youtube/${youtubeId}`
    );
    return response.data;
  },

  /**
   * Create new video
   */
  async create(data: VideoCreate): Promise<ApiResponse<Video>> {
    const response = await apiClient.post<ApiResponse<Video>>(
      '/videos/',
      data
    );
    return response.data;
  },

  /**
   * Update video
   */
  async update(id: number, data: VideoUpdate): Promise<ApiResponse<Video>> {
    const response = await apiClient.put<ApiResponse<Video>>(
      `/videos/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete video
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/videos/${id}`);
  },

  /**
   * Increment video view count
   */
  async incrementView(id: number): Promise<void> {
    await apiClient.post(`/videos/${id}/view`);
  },
};
