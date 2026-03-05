/**
 * Screen Card Component - Videotron
 * Displays screen information with status indicator and actions
 */

'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Monitor, MoreVertical, Edit, Trash2, MapPin, Activity, Wifi, WifiOff } from 'lucide-react';
import type { Screen } from '@/types';

interface ScreenCardProps {
  screen: Screen;
  onEdit: (screen: Screen) => void;
  onDelete: (id: string) => void;
}

export function ScreenCard({ screen, onEdit, onDelete }: ScreenCardProps) {
  const isOnline = screen.status === 'online';
  const isMaintenance = screen.status === 'maintenance';
  
  const getStatusColor = () => {
    if (isMaintenance) return 'bg-yellow-500';
    return isOnline ? 'bg-green-500' : 'bg-red-500';
  };

  const getStatusBadgeVariant = () => {
    if (isMaintenance) return 'secondary' as const;
    return isOnline ? 'default' as const : 'destructive' as const;
  };

  const formatLastHeartbeat = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isOnline ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{screen.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{screen.device_id}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(screen)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(screen.id)}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant={getStatusBadgeVariant()} className="gap-1">
            <span className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            {screen.status}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          {screen.location && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>{screen.location}</span>
            </div>
          )}

          {screen.resolution && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Monitor className="h-4 w-4" />
              <span>{screen.resolution}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Activity className="h-4 w-4" />
            <span>Last heartbeat: {formatLastHeartbeat(screen.last_heartbeat)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
