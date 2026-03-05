/**
 * Layout Builder Component - Videotron
 * Visual layout editor with canvas, widgets, and API integration
 * TASK-B7: Integrated with Layouts API
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { layoutService } from '@/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  LayoutGrid, Save, Eye, Send, Trash2, X, ZoomIn, ZoomOut, Maximize2,
  Image as ImageIcon, Video, Clock, Cloud, Layers, Monitor, Play, Pause,
  SkipForward, ChevronDown, ChevronRight, Edit3, Palette, Settings,
  Plus, ArrowLeft, Calendar, MoreVertical, Edit as EditIcon, Undo, Redo,
  Loader2,
} from 'lucide-react';
import type { Layout, Layer, CanvasConfig } from '@/types';

type WidgetType = 'image' | 'video' | 'clock' | 'weather' | 'running_text';
type ResizeDirection = 'nw' | 'ne' | 'sw' | 'se';

interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  config?: Record<string, any>;
}

interface Resolution {
  id: string;
  name: string;
  width: number;
  height: number;
}

interface LayoutBuilderProps {
  layoutId?: string;
  initialLayout?: Layout;
  onSave?: (layout: Layout) => void;
  onCancel?: () => void;
  mode?: 'edit' | 'preview';
}

const WIDGETS = [
  { type: 'image' as WidgetType, label: 'Image', icon: ImageIcon },
  { type: 'video' as WidgetType, label: 'Video', icon: Video },
  { type: 'clock' as WidgetType, label: 'Clock', icon: Clock },
  { type: 'weather' as WidgetType, label: 'Weather', icon: Cloud },
  { type: 'running_text' as WidgetType, label: 'Running Text', icon: Cloud },
];

const PRESET_RESOLUTIONS: Resolution[] = [
  { id: 'fhd', name: 'Full HD', width: 1920, height: 1080 },
  { id: 'hd', name: 'HD Ready', width: 1280, height: 720 },
  { id: '4k', name: '4K UHD', width: 3840, height: 2160 },
  { id: 'v-fhd', name: 'Vertical FHD', width: 1080, height: 1920 },
];

const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1];
const GRID_SIZE = 10;
const MIN_SIZE = 50;
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export default function LayoutBuilder({
  layoutId,
  initialLayout,
  onSave,
  onCancel,
  mode = 'edit',
}: LayoutBuilderProps) {
  // State
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [layoutName, setLayoutName] = useState('Untitled Layout');
  const [isEditingName, setIsEditingName] = useState(false);
  const [zoom, setZoom] = useState(0.5);
  const [previewMode, setPreviewMode] = useState(mode === 'preview');
  const [showGrid, setShowGrid] = useState(true);
  const [showRuler, setShowRuler] = useState(false);
  const [showLayers, setShowLayers] = useState(true);
  const [showResolutionDialog, setShowResolutionDialog] = useState(false);
  const [customResolutions, setCustomResolutions] = useState<Resolution[]>([]);
  const [currentResolution, setCurrentResolution] = useState<Resolution>(PRESET_RESOLUTIONS[0]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Drag state
  const [draggedWidget, setDraggedWidget] = useState<Widget | null>(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [widgetStartPos, setWidgetStartPos] = useState({ x: 0, y: 0 });

  // Resize state
  const [resizingWidget, setResizingWidget] = useState<Widget | null>(null);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(null);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize from initialLayout
  useEffect(() => {
    if (initialLayout) {
      setLayoutName(initialLayout.name);
      if (initialLayout.canvas_config) {
        const matchingPreset = PRESET_RESOLUTIONS.find(
          r => r.width === initialLayout.canvas_config?.width && 
               r.height === initialLayout.canvas_config?.height
        );
        if (matchingPreset) {
          setCurrentResolution(matchingPreset);
        } else {
          setCurrentResolution({
            id: 'custom',
            name: 'Custom',
            width: initialLayout.canvas_config.width,
            height: initialLayout.canvas_config.height,
          });
        }
      }
      if (initialLayout.layers && initialLayout.layers.length > 0) {
        const convertedWidgets: Widget[] = initialLayout.layers.map(layer => ({
          id: layer.id || `widget-${Date.now()}-${Math.random()}`,
          type: layer.type,
          title: layer.type.toUpperCase(),
          x: layer.position.x,
          y: layer.position.y,
          width: layer.size.width,
          height: layer.size.height,
          zIndex: layer.zIndex || 1,
          config: layer.config,
        }));
        setWidgets(convertedWidgets);
      }
    }
  }, [initialLayout]);

  // Auto-save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const layers: Layer[] = widgets.map(widget => ({
        id: widget.id,
        type: widget.type,
        position: { x: widget.x, y: widget.y },
        size: { width: widget.width, height: widget.height },
        zIndex: widget.zIndex,
        config: widget.config,
      }));

      const canvasConfig: CanvasConfig = {
        width: currentResolution.width,
        height: currentResolution.height,
        orientation: currentResolution.width > currentResolution.height ? 'landscape' : 'portrait',
      };

      const layoutData = {
        name: layoutName,
        canvas_config: canvasConfig,
        layers,
      };

      if (layoutId) {
        return await layoutService.updateLayout(layoutId, layoutData);
      } else {
        return await layoutService.createLayout(layoutData);
      }
    },
    onSuccess: (response) => {
      toast.success('Layout saved successfully');
      setHasUnsavedChanges(false);
      if (onSave && response.layout) {
        onSave(response.layout);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save layout');
    },
  });

  // Auto-save effect
  useEffect(() => {
    if (hasUnsavedChanges && !previewMode && layoutId) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = setTimeout(() => {
        saveMutation.mutate();
      }, AUTO_SAVE_INTERVAL);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [hasUnsavedChanges, previewMode, layoutId]);

  // Mark as changed
  const markAsChanged = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  // Handlers
  const snapToGrid = (value: number): number => Math.round(value / GRID_SIZE) * GRID_SIZE;

  const handleAddWidget = (type: WidgetType) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      title: type.replace(/_/g, ' ').toUpperCase(),
      x: snapToGrid(100),
      y: snapToGrid(100),
      width: snapToGrid(400),
      height: snapToGrid(300),
      zIndex: widgets.length + 1,
    };
    setWidgets([...widgets, newWidget]);
    setSelectedWidget(newWidget);
    markAsChanged();
  };

  const handleSelectWidget = (widget: Widget) => setSelectedWidget(widget);
  
  const handleDeleteWidget = () => {
    if (selectedWidget) {
      setWidgets(widgets.filter(w => w.id !== selectedWidget.id));
      setSelectedWidget(null);
      markAsChanged();
    }
  };

  const handleUpdateWidget = (key: keyof Widget, value: any) => {
    if (selectedWidget) {
      setWidgets(widgets.map(w => (w.id === selectedWidget.id ? { ...w, [key]: value } : w)));
      setSelectedWidget({ ...selectedWidget, [key]: value });
      markAsChanged();
    }
  };

  // DRAG FUNCTIONALITY
  const handleDragStart = (e: React.MouseEvent, widget: Widget) => {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
    e.stopPropagation();
    setDraggedWidget(widget);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setWidgetStartPos({ x: widget.x, y: widget.y });
    setSelectedWidget(widget);
  };

  useEffect(() => {
    const handleDragMove = (e: MouseEvent) => {
      if (!draggedWidget) return;
      const deltaX = e.clientX - dragStartPos.x;
      const deltaY = e.clientY - dragStartPos.y;
      const canvasDeltaX = deltaX / zoom;
      const canvasDeltaY = deltaY / zoom;
      const newX = snapToGrid(widgetStartPos.x + canvasDeltaX);
      const newY = snapToGrid(widgetStartPos.y + canvasDeltaY);
      setWidgets(prev => prev.map(w => (w.id === draggedWidget.id ? { ...w, x: Math.max(0, newX), y: Math.max(0, newY) } : w)));
      setSelectedWidget(prev => prev?.id === draggedWidget.id ? { ...prev, x: Math.max(0, newX), y: Math.max(0, newY) } : prev);
      markAsChanged();
    };
    const handleDragEnd = () => setDraggedWidget(null);
    if (draggedWidget) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
    }
    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, [draggedWidget, dragStartPos, widgetStartPos, zoom, markAsChanged]);

  // RESIZE FUNCTIONALITY
  const handleResizeStart = (e: React.MouseEvent, widget: Widget, direction: ResizeDirection) => {
    e.stopPropagation();
    setResizingWidget(widget);
    setResizeDirection(direction);
    setResizeStartPos({ x: e.clientX, y: e.clientY });
    setResizeStartSize({ width: widget.width, height: widget.height });
    setSelectedWidget(widget);
  };

  useEffect(() => {
    const handleResizeMove = (e: MouseEvent) => {
      if (!resizingWidget || !resizeDirection) return;

      const deltaX = e.clientX - resizeStartPos.x;
      const deltaY = e.clientY - resizeStartPos.y;
      const canvasDeltaX = deltaX / zoom;
      const canvasDeltaY = deltaY / zoom;

      let newWidth = resizeStartSize.width;
      let newHeight = resizeStartSize.height;
      let newX = resizingWidget.x;
      let newY = resizingWidget.y;

      if (resizeDirection === 'se') {
        newWidth = snapToGrid(resizeStartSize.width + canvasDeltaX);
        newHeight = snapToGrid(resizeStartSize.height + canvasDeltaY);
      } else if (resizeDirection === 'sw') {
        newWidth = snapToGrid(resizeStartSize.width - canvasDeltaX);
        newHeight = snapToGrid(resizeStartSize.height + canvasDeltaY);
        newX = snapToGrid(resizingWidget.x + canvasDeltaX);
      } else if (resizeDirection === 'ne') {
        newWidth = snapToGrid(resizeStartSize.width + canvasDeltaX);
        newHeight = snapToGrid(resizeStartSize.height - canvasDeltaY);
        newY = snapToGrid(resizingWidget.y + canvasDeltaY);
      } else if (resizeDirection === 'nw') {
        newWidth = snapToGrid(resizeStartSize.width - canvasDeltaX);
        newHeight = snapToGrid(resizeStartSize.height - canvasDeltaY);
        newX = snapToGrid(resizingWidget.x + canvasDeltaX);
        newY = snapToGrid(resizingWidget.y + canvasDeltaY);
      }

      newWidth = Math.max(MIN_SIZE, newWidth);
      newHeight = Math.max(MIN_SIZE, newHeight);

      setWidgets(prev => prev.map(w => (w.id === resizingWidget.id ? { ...w, width: newWidth, height: newHeight, x: newX, y: newY } : w)));
      setSelectedWidget(prev => prev?.id === resizingWidget.id ? { ...prev, width: newWidth, height: newHeight, x: newX, y: newY } : prev);
      markAsChanged();
    };

    const handleResizeEnd = () => {
      setResizingWidget(null);
      setResizeDirection(null);
    };

    if (resizingWidget) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
    }
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [resizingWidget, resizeDirection, resizeStartPos, resizeStartSize, zoom, markAsChanged]);

  const getWidgetContent = (widget: Widget) => {
    const isSelected = selectedWidget?.id === widget.id;
    return (
      <div className={`w-full h-full flex items-center justify-center cursor-move transition-all ${isSelected && !previewMode ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`} style={{ backgroundColor: widget.type === 'video' ? '#1f2937' : '#ffffff', color: widget.type === 'video' ? '#9ca3af' : '#6b7280' }}>
        {widget.type === 'video' && <Video className="h-12 w-12" />}
        {widget.type === 'image' && <ImageIcon className="h-12 w-12" />}
        {widget.type === 'clock' && <div className="text-4xl font-bold text-gray-900">{new Date().toLocaleTimeString()}</div>}
        {widget.type === 'weather' && <div className="text-center"><Cloud className="h-12 w-12 mx-auto text-blue-500" /><p className="text-2xl font-bold mt-2">28°C</p></div>}
        {widget.type === 'running_text' && <div className="animate-marquee whitespace-nowrap"><span className="text-xl">⚡ Breaking news ticker...</span></div>}
      </div>
    );
  };

  const handleAddCustomResolution = () => {
    const name = prompt('Resolution name:');
    const width = parseInt(prompt('Width (px):') || '1920');
    const height = parseInt(prompt('Height (px):') || '1080');
    if (name && width && height) {
      const newRes: Resolution = { id: `custom-${Date.now()}`, name, width, height };
      setCustomResolutions([...customResolutions, newRes]);
      setCurrentResolution(newRes);
      markAsChanged();
    }
  };

  const handleManualSave = () => {
    saveMutation.mutate();
  };

  const allResolutions = [...PRESET_RESOLUTIONS, ...customResolutions];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onCancel && (
              <button onClick={onCancel} className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-xl">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">Back</span>
              </button>
            )}

            <div className="h-6 w-px bg-gray-300" />

            <button onClick={() => setIsEditingName(true)} className="flex items-center gap-2 text-lg font-semibold hover:bg-gray-100 px-3 py-2 rounded-xl">
              <LayoutGrid className="h-6 w-6 text-blue-600" />
              {isEditingName ? (
                <Input 
                  value={layoutName} 
                  onChange={(e) => { setLayoutName(e.target.value); markAsChanged(); }} 
                  onBlur={() => setIsEditingName(false)} 
                  autoFocus 
                  className="h-7 w-48" 
                />
              ) : (
                <span>{layoutName}</span>
              )}
              <Edit3 className="h-3 w-3 opacity-50" />
            </button>

            <button onClick={() => setShowResolutionDialog(!showResolutionDialog)} className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-xl hover:bg-gray-200">
              <Monitor className="h-4 w-4" />
              <span className="text-sm font-medium">{currentResolution.name}</span>
              <span className="text-xs text-gray-500">{currentResolution.width}x{currentResolution.height}</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            <Badge variant="outline" className="font-mono">{currentResolution.width}x{currentResolution.height}</Badge>
            
            {hasUnsavedChanges && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Unsaved changes
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(0.25, zoom - 0.25))} disabled={zoom <= 0.25}><ZoomOut className="h-4 w-4" /></Button>
            {ZOOM_LEVELS.map(level => (
              <button 
                key={level} 
                onClick={() => setZoom(level)} 
                className={`px-3 py-1.5 text-sm font-medium rounded-xl transition-all ${zoom === level ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                {Math.round(level * 100)}%
              </button>
            ))}
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(1, zoom + 0.25))} disabled={zoom >= 1}><ZoomIn className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setZoom(0.5)}><Maximize2 className="h-4 w-4" /></Button>

            <div className="h-6 w-px bg-gray-300 mx-4" />

            <Button variant="outline" size="sm" onClick={() => setShowGrid(!showGrid)} className={showGrid ? 'bg-blue-600 text-white' : ''}>Grid</Button>
            <Button variant="outline" size="sm" onClick={() => setShowRuler(!showRuler)} className={showRuler ? 'bg-blue-600 text-white' : ''}>Ruler</Button>
            <Button variant="outline" size="sm" onClick={() => setShowLayers(!showLayers)} className={showLayers ? 'bg-blue-600 text-white' : ''}>Layers</Button>

            <div className="h-6 w-px bg-gray-300 mx-4" />

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualSave}
              disabled={saveMutation.isPending || !hasUnsavedChanges}
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
            <Button 
              variant={previewMode ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {previewMode ? 'Exit' : 'Preview'}
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Send className="h-4 w-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>
      </div>

      {/* Resolution Dialog */}
      {showResolutionDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowResolutionDialog(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Select Resolution</h3>
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {allResolutions.map((res) => (
                <button 
                  key={res.id} 
                  onClick={() => { setCurrentResolution(res); setShowResolutionDialog(false); markAsChanged(); }} 
                  className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${currentResolution.id === res.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="flex items-center gap-3">
                    <Monitor className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-semibold">{res.name}</p>
                      <p className="text-xs text-gray-500">{res.width}x{res.height}</p>
                    </div>
                  </div>
                  {currentResolution.id === res.id && <Badge className="bg-blue-600">Active</Badge>}
                </button>
              ))}
            </div>
            <Button onClick={handleAddCustomResolution} className="w-full" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Add Custom Resolution
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Widget Library */}
        {!previewMode && (
          <div className="w-72 flex flex-col bg-gray-900">
            <div className="p-4 border-b border-gray-800">
              <p className="text-xs font-bold text-gray-400 uppercase mb-3">Widget Library</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {WIDGETS.map((widget) => {
                const Icon = widget.icon;
                return (
                  <div 
                    key={widget.type} 
                    onClick={() => handleAddWidget(widget.type)} 
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <Icon className="h-4 w-4 text-blue-500" />
                    </div>
                    <span className="text-sm font-medium text-white">{widget.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-6" onClick={() => setSelectedWidget(null)}>
          <div className="inline-block">
            <div className="grid" style={{ gridTemplateColumns: showRuler ? '24px auto' : 'auto', gridTemplateRows: showRuler ? '24px auto' : 'auto' }}>
              {showRuler && <div className="bg-gray-800"></div>}
              {showRuler && (
                <div className="bg-gray-800 text-white text-xs relative" style={{ width: `${currentResolution.width * zoom}px`, height: '24px' }}>
                  {Array.from({ length: Math.ceil(currentResolution.width / 100) }, (_, i) => {
                    const mark = i * 100;
                    if (mark > currentResolution.width) return null;
                    const leftPos = (mark / currentResolution.width) * 100;
                    return (
                      <div 
                        key={i} 
                        className="absolute top-0 bottom-0 border-r border-gray-600 text-center py-1 text-[10px]" 
                        style={{ left: `${leftPos}%`, width: `${(100 / currentResolution.width) * 100}%` }}
                      >
                        {mark}
                      </div>
                    );
                  })}
                </div>
              )}
              {showRuler && (
                <div className="bg-gray-800 text-white text-xs relative" style={{ height: `${currentResolution.height * zoom}px`, width: '24px' }}>
                  {Array.from({ length: Math.ceil(currentResolution.height / 100) }, (_, i) => {
                    const mark = i * 100;
                    if (mark > currentResolution.height) return null;
                    const topPos = (mark / currentResolution.height) * 100;
                    return (
                      <div 
                        key={i} 
                        className="absolute left-0 right-0 border-b border-gray-600 text-center py-1 text-[10px]" 
                        style={{ top: `${topPos}%`, height: `${(100 / currentResolution.height) * 100}%` }}
                      >
                        {mark}
                      </div>
                    );
                  })}
                </div>
              )}
              <div 
                ref={canvasRef} 
                className="bg-white shadow-2xl relative overflow-hidden" 
                style={{ 
                  width: `${currentResolution.width * zoom}px`, 
                  height: `${currentResolution.height * zoom}px`, 
                  backgroundImage: showGrid ? `linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)` : undefined, 
                  backgroundSize: `${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px` 
                }}
              >
                {widgets.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <LayoutGrid className="h-16 w-16 mx-auto mb-4" />
                      <p className="font-medium">Empty Canvas</p>
                      <p className="text-sm">Click widgets on the left to add</p>
                    </div>
                  </div>
                )}
                {widgets.map((widget) => (
                  <div 
                    key={widget.id} 
                    onMouseDown={(e) => handleDragStart(e, widget)} 
                    onClick={(e) => { e.stopPropagation(); handleSelectWidget(widget); }} 
                    className="absolute" 
                    style={{ 
                      left: `${widget.x * zoom}px`, 
                      top: `${widget.y * zoom}px`, 
                      width: `${widget.width * zoom}px`, 
                      height: `${widget.height * zoom}px`, 
                      zIndex: widget.zIndex, 
                      cursor: draggedWidget?.id === widget.id ? 'grabbing' : 'grab' 
                    }}
                  >
                    {getWidgetContent(widget)}
                    {selectedWidget?.id === widget.id && !previewMode && (
                      <>
                        <div className="resize-handle absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize hover:bg-blue-600 hover:scale-125 transition-transform" onMouseDown={(e) => handleResizeStart(e, widget, 'nw')} />
                        <div className="resize-handle absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize hover:bg-blue-600 hover:scale-125 transition-transform" onMouseDown={(e) => handleResizeStart(e, widget, 'ne')} />
                        <div className="resize-handle absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize hover:bg-blue-600 hover:scale-125 transition-transform" onMouseDown={(e) => handleResizeStart(e, widget, 'sw')} />
                        <div className="resize-handle absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize hover:bg-blue-600 hover:scale-125 transition-transform" onMouseDown={(e) => handleResizeStart(e, widget, 'se')} />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Layers & Properties */}
        {!previewMode && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            {showLayers && (
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-blue-600" />
                    <h3 className="font-bold text-sm">LAYERS</h3>
                  </div>
                  <span className="text-xs text-gray-500">{widgets.length}</span>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {widgets.slice().sort((a, b) => b.zIndex - a.zIndex).map((widget) => (
                    <div 
                      key={widget.id} 
                      onClick={() => handleSelectWidget(widget)} 
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${selectedWidget?.id === widget.id ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'}`}
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        {widget.type === 'video' && <Video className="h-4 w-4 text-blue-600" />}
                        {widget.type === 'clock' && <Clock className="h-4 w-4 text-blue-600" />}
                        {widget.type === 'image' && <ImageIcon className="h-4 w-4 text-blue-600" />}
                        {widget.type === 'weather' && <Cloud className="h-4 w-4 text-blue-600" />}
                        {widget.type === 'running_text' && <Cloud className="h-4 w-4 text-blue-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{widget.title}</p>
                        <p className="text-xs text-gray-500">Z: {widget.zIndex}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-4">
              <h2 className="font-bold text-sm mb-4">PROPERTIES</h2>
              {selectedWidget ? (
                <div className="space-y-4">
                  <div className="pb-3 border-b">
                    <p className="text-xs text-gray-500">SELECTED WIDGET</p>
                    <p className="font-semibold">{selectedWidget.title}</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500">Position</label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <label className="text-xs text-gray-400">X</label>
                          <Input 
                            type="number" 
                            value={selectedWidget.x} 
                            onChange={(e) => handleUpdateWidget('x', parseInt(e.target.value))} 
                            className="h-8" 
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Y</label>
                          <Input 
                            type="number" 
                            value={selectedWidget.y} 
                            onChange={(e) => handleUpdateWidget('y', parseInt(e.target.value))} 
                            className="h-8" 
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500">Size</label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <label className="text-xs text-gray-400">Width</label>
                          <Input 
                            type="number" 
                            value={selectedWidget.width} 
                            onChange={(e) => handleUpdateWidget('width', parseInt(e.target.value))} 
                            className="h-8" 
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Height</label>
                          <Input 
                            type="number" 
                            value={selectedWidget.height} 
                            onChange={(e) => handleUpdateWidget('height', parseInt(e.target.value))} 
                            className="h-8" 
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500">Layer</label>
                      <Input 
                        type="number" 
                        value={selectedWidget.zIndex} 
                        onChange={(e) => handleUpdateWidget('zIndex', parseInt(e.target.value))} 
                        className="h-8 mt-1" 
                      />
                    </div>
                  </div>
                  <Button variant="destructive" className="w-full" size="sm" onClick={handleDeleteWidget}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Widget
                  </Button>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <LayoutGrid className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Select a widget to edit properties</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes marquee { 
          0% { transform: translateX(100%); } 
          100% { transform: translateX(-100%); } 
        } 
        .animate-marquee { animation: marquee 20s linear infinite; }
      `}</style>
    </div>
  );
}
