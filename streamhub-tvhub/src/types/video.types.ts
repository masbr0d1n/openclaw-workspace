/**
 * Video types
 */

export interface Video {
  id: number;
  title: string;
  description: string | null;
  youtube_id: string;
  channel_id: number;
  thumbnail_url: string | null;
  thumbnail_data: string | null;
  video_url: string | null;
  duration: number | null;
  view_count: number;
  is_live: boolean;
  is_active: boolean;
  
  // Video metadata from FFmpeg
  width: number | null;
  height: number | null;
  video_codec: string | null;
  video_bitrate: number | null;
  audio_codec: string | null;
  audio_bitrate: number | null;
  fps: number | null;
  
  created_at: string;
  updated_at: string;
}

export interface VideoCreate {
  title: string;
  description?: string;
  youtube_id: string;
  channel_id: number;
  thumbnail_url?: string;
  duration?: number;
  is_live?: boolean;
  is_active?: boolean;
}

export interface VideoUpdate {
  title?: string;
  description?: string;
  thumbnail_url?: string;
  duration?: number;
  view_count?: number;
  is_live?: boolean;
  is_active?: boolean;
}

export interface VideoListParams {
  skip?: number;
  limit?: number;
  channel_id?: number;
  is_active?: boolean;
  is_live?: boolean;
  search?: string;
}

export interface VideoListResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: Video[];
  count: number;
}
