/**
 * Dashboard Header
 * Header with user menu, logout, and login category badge
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, Settings, Monitor, Building2 } from 'lucide-react';

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const [loginCategory, setLoginCategory] = useState<'tv_hub' | 'videotron'>('tv_hub');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const category = localStorage.getItem('login_category') as 'tv_hub' | 'videotron' | 'tv_channel';
      // Convert old 'tv_channel' to 'tv_hub'
      setLoginCategory(category === 'videotron' ? 'videotron' : 'tv_hub');
    }
  }, []);

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">StreamHub</h1>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Dashboard
          </span>

          {/* Login Category Badge */}
          {loginCategory === 'videotron' ? (
            <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
              <Building2 className="h-3 w-3 mr-1" />
              Videotron
            </Badge>
          ) : (
            <Badge variant="default" className="bg-purple-600 hover:bg-purple-700">
              <Monitor className="h-3 w-3 mr-1" />
              TV Hub
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.username?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.full_name || user?.username}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
