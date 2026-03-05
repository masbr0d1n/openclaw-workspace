/**
 * Screen Types - Videotron
 */

export interface Screen {
  id: string;
  device_id: string;
  name: string;
  location: string | null;
  resolution: string | null;
  status: 'online' | 'offline' | 'maintenance';
  last_heartbeat: string | null;
  api_key: string;
  created_at: string;
  updated_at: string;
}

export interface ScreenCreate {
  name: string;
  device_id: string;
  location?: string;
  resolution?: string;
}

export interface ScreenUpdate {
  name?: string;
  device_id?: string;
  location?: string;
  resolution?: string;
  status?: 'online' | 'offline' | 'maintenance';
}

export interface ScreenHeartbeat {
  status: 'online' | 'offline' | 'maintenance';
}

export interface ScreenGroup {
  id: string;
  name: string;
  screen_ids: string[];
  created_at: string;
}

export interface ScreenGroupCreate {
  name: string;
  screen_ids: string[];
}

export interface ScreenListParams {
  skip?: number;
  limit?: number;
  status?: 'online' | 'offline' | 'maintenance';
  search?: string;
}

export interface ScreensResponse {
  status: boolean;
  statusCode: number;
  message: string;
  screens: Screen[];
  count: number;
}

export interface ScreenResponse {
  status: boolean;
  statusCode: number;
  message: string;
  screen: Screen;
}

export interface ScreenGroupsResponse {
  status: boolean;
  statusCode: number;
  message: string;
  groups: ScreenGroup[];
  count: number;
}

export interface ScreenGroupResponse {
  status: boolean;
  statusCode: number;
  message: string;
  group: ScreenGroup;
}

export interface HeartbeatResponse {
  success: boolean;
  last_heartbeat: string;
  message: string;
}
