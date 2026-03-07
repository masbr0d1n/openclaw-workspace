/**
 * Playlists Frontend Integration
 * Connect Playlists tab to backend API
 * 
 * ✅ FIXED: Uses Next.js proxy (/api/v1) instead of direct backend calls
 */

// API Base URL - Use Next.js proxy (relative path)
const API_BASE = '/api/v1';

// Types
export interface Playlist {
  id: string;
  name: string;
  description?: string;
  default_duration: number;
  transition: 'fade' | 'slide' | 'none';
  loop: boolean;
  is_published: boolean;
  items_count: number;
  total_duration: number;
  used_in: number;
  created_at: string;
  updated_at: string;
}

export interface PlaylistItem {
  id: string;
  playlist_id: string;
  media_id: string;
  name: string;
  duration: number;
  order: number;
  media_type: 'video' | 'image';
}

export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  video_url?: string;
  thumbnail_url?: string;
  thumbnail_data?: string;
  duration?: number;
  content_type?: 'video' | 'image';
  width?: number;
  height?: number;
  created_at: string;
}

// API Service
export const playlistsApi = {
  // ==================== Playlists ====================

  /**
   * Get all playlists
   */
  async getPlaylists(publishedOnly = false): Promise<Playlist[]> {
    const url = `${API_BASE}/playlists/${publishedOnly ? '?published_only=true' : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch playlists');
    return res.json();
  },

  /**
   * Get playlist by ID with items
   */
  async getPlaylist(id: string): Promise<Playlist & { items: PlaylistItem[] }> {
    const res = await fetch(`${API_BASE}/playlists/${id}`);
    if (!res.ok) throw new Error('Failed to fetch playlist');
    return res.json();
  },

  /**
   * Create playlist
   */
  async createPlaylist(data: Partial<Playlist>): Promise<Playlist> {
    const res = await fetch(`${API_BASE}/playlists/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create playlist');
    return res.json();
  },

  /**
   * Save draft (convenience method)
   */
  async saveDraft(data: Partial<Playlist>): Promise<Playlist> {
    const res = await fetch(`${API_BASE}/playlists/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, is_published: false }),
    });
    if (!res.ok) throw new Error('Failed to save draft');
    return res.json();
  },

  /**
   * Update playlist
   */
  async updatePlaylist(id: string, data: Partial<Playlist>): Promise<Playlist> {
    const res = await fetch(`${API_BASE}/playlists/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update playlist');
    return res.json();
  },

  /**
   * Publish playlist
   */
  async publishPlaylist(id: string): Promise<Playlist> {
    const res = await fetch(`${API_BASE}/playlists/${id}/publish`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to publish playlist');
    return res.json();
  },

  /**
   * Delete playlist
   */
  async deletePlaylist(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/playlists/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete playlist');
  },

  // ==================== Playlist Items ====================

  /**
   * Get playlist items
   */
  async getPlaylistItems(playlistId: string): Promise<PlaylistItem[]> {
    const res = await fetch(`${API_BASE}/playlists/${playlistId}/items`);
    if (!res.ok) throw new Error('Failed to fetch playlist items');
    return res.json();
  },

  /**
   * Add item to playlist
   */
  async addPlaylistItem(
    playlistId: string,
    mediaId: string,
    duration: number
  ): Promise<PlaylistItem> {
    const res = await fetch(`${API_BASE}/playlists/${playlistId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_id: mediaId, duration }),
    });
    if (!res.ok) throw new Error('Failed to add item to playlist');
    return res.json();
  },

  /**
   * Update playlist item
   */
  async updatePlaylistItem(
    playlistId: string,
    itemId: string,
    data: { duration: number }
  ): Promise<PlaylistItem> {
    const res = await fetch(
      `${API_BASE}/playlists/${playlistId}/items/${itemId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    if (!res.ok) throw new Error('Failed to update playlist item');
    return res.json();
  },

  /**
   * Remove playlist item
   */
  async removePlaylistItem(playlistId: string, itemId: string): Promise<void> {
    const res = await fetch(
      `${API_BASE}/playlists/${playlistId}/items/${itemId}`,
      {
        method: 'DELETE',
      }
    );
    if (!res.ok) throw new Error('Failed to remove playlist item');
  },

  /**
   * Reorder playlist items (drag & drop)
   * @param playlistId - Playlist ID
   * @param itemOrders - Map of item_id to new order { "item_id_1": 1, "item_id_2": 2, ... }
   */
  async reorderPlaylistItems(
    playlistId: string,
    itemOrders: Record<string, number>
  ): Promise<void> {
    const res = await fetch(
      `${API_BASE}/playlists/${playlistId}/items/reorder`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemOrders),
      }
    );
    if (!res.ok) throw new Error('Failed to reorder playlist items');
  },

  /**
   * Clear all playlist items
   */
  async clearPlaylistItems(playlistId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/playlists/${playlistId}/items`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to clear playlist items');
  },

  // ==================== Media Library ====================

  /**
   * Get all media (videos/images) for Media Library sync
   */
  async getMediaLibrary(): Promise<MediaItem[]> {
    const res = await fetch(`${API_BASE}/videos/`);
    if (!res.ok) throw new Error('Failed to fetch media library');
    const data = await res.json();
    return data.data || data.videos || data || [];
  },
};

export default playlistsApi;
