/**
 * Layout Types - Videotron
 * Digital signage layout definitions
 */

export interface CanvasConfig {
  width: number;
  height: number;
  orientation?: 'landscape' | 'portrait';
}

export interface LayerPosition {
  x: number;
  y: number;
}

export interface LayerSize {
  width: number;
  height: number;
}

export interface Layer {
  id?: string;
  type: 'image' | 'video' | 'clock' | 'weather' | 'running_text';
  position: LayerPosition;
  size: LayerSize;
  zIndex?: number;
  config?: Record<string, any>;
}

export interface Layout {
  id: string;
  name: string;
  canvas_config: CanvasConfig;
  layers: Layer[];
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface LayoutCreate {
  name: string;
  canvas_config: CanvasConfig;
  layers?: Layer[];
}

export interface LayoutUpdate {
  name?: string;
  canvas_config?: CanvasConfig;
  layers?: Layer[];
}

export interface LayoutDuplicate {
  name?: string;
}

export interface LayoutListParams {
  skip?: number;
  limit?: number;
  created_by?: number;
}

export interface LayoutsResponse {
  status: boolean;
  statusCode: number;
  message: string;
  layouts: Layout[];
  count: number;
}

export interface LayoutResponse {
  status: boolean;
  statusCode: number;
  message: string;
  layout: Layout;
}

export interface DuplicateLayoutResponse {
  status: boolean;
  statusCode: number;
  message: string;
  layout: Layout;
}
