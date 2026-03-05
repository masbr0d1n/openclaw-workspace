/**
 * Channel Types
 */

export interface Channel {
  id: number;
  name: string;
  description: string | null;
  category: 'sport' | 'entertainment' | 'kids' | 'knowledge' | 'gaming';
  logo_url: string | null;
  is_on_air: boolean;
  started_streaming_at: string | null;
  stopped_streaming_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChannelCreate {
  name: string;
  category: Channel['category'];
  description?: string;
  logo_url?: string;
}

export interface ChannelUpdate {
  name?: string;
  category?: Channel['category'];
  description?: string;
  logo_url?: string;
  is_active?: boolean;
}

export interface ChannelListParams {
  skip?: number;
  limit?: number;
  category?: Channel['category'];
  is_active?: boolean;
}

export interface StreamingStatus {
  channel_id: number;
  status: 'on-air' | 'off-air';
  started_at: string | null;
  stopped_at: string | null;
  stream_url: string | null;
  message: string;
}
