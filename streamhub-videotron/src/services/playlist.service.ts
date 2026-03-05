/**
 * Playlist Service
 * Handles playlist API calls
 */

import { apiClient } from '@/lib/api-client';
import type {
  ApiResponse,
  Playlist,
  CreatePlaylistInput,
  UpdatePlaylistInput,
  PlaylistResponse,
} from '@/types';

export const playlistService = {
  /**
   * Get all playlists
   */
  async getAll(): Promise<ApiResponse<Playlist[]>> {
    const response = await apiClient.get<ApiResponse<Playlist[]>>('/playlists');
    return response.data;
  },

  /**
   * Get playlist by ID
   */
  async getById(id: number): Promise<ApiResponse<Playlist>> {
    const response = await apiClient.get<ApiResponse<Playlist>>(`/playlists/${id}`);
    return response.data;
  },

  /**
   * Create new playlist
   */
  async create(data: CreatePlaylistInput): Promise<ApiResponse<Playlist>> {
    const response = await apiClient.post<ApiResponse<Playlist>>('/playlists', data);
    return response.data;
  },

  /**
   * Update playlist
   */
  async update(id: number, data: UpdatePlaylistInput): Promise<ApiResponse<Playlist>> {
    const response = await apiClient.put<ApiResponse<Playlist>>(`/playlists/${id}`, data);
    return response.data;
  },

  /**
   * Delete playlist
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/playlists/${id}`);
    return response.data;
  },

  /**
   * Get playlist videos
   */
  async getVideos(id: number): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get<ApiResponse<any[]>>(`/playlists/${id}/videos`);
    return response.data;
  },
  /**
   * Update playlist videos
   */
  async updatePlaylistVideos(playlistId: number, videoIds: number[]): Promise<{ status: boolean; data: Playlist }> {
    const response = await apiClient.put<{ status: boolean; data: Playlist }>(
      `/playlists/${playlistId}/videos`,
      { video_ids: videoIds }
    );
    return response.data;
  },
};
