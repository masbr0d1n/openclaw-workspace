/**
 * Playlist Types
 */

import { Video } from './video.types';

export interface Playlist {
  id: number;
  name: string;
  channel_id: number;
  channel_name?: string;
  start_time: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  video_count: number;
  videos?: Video[]; // Array of videos when fetching single playlist
  created_at: string;
  updated_at: string;
}

export interface CreatePlaylistInput {
  name: string;
  channel_id: number;
  start_time: string;
}

export interface UpdatePlaylistInput {
  name?: string;
  channel_id?: number;
  start_time?: string;
  status?: 'scheduled' | 'live' | 'completed' | 'cancelled';
}

export interface PlaylistResponse {
  id: number;
  name: string;
  channel_id: number;
  channel_name: string;
  start_time: string;
  status: string;
  video_count: number;
  created_at: string;
  updated_at: string;
}
