/**
 * Dashboard Layout - TV Hub Version
 * Menu optimized for TV Hub features only
 */

'use client';

import React, { type ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import {
  LayoutDashboard,
  Video,
  Users,
  Settings,
  FileText,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  Calendar,
  Database,
  Plug,
} from 'lucide-react';

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // TV Hub Menu - Static (no dynamic switching)
  const navItems = React.useMemo(() => [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Channels',
      href: '/dashboard/channels',
      icon: Video,
    },
    {
      title: 'Videos',
      href: '/dashboard/videos',
      icon: Video,
    },
    {
      title: 'Playlists',
      href: '/dashboard/content/playlists',
      icon: Database,
    },
    {
      title: 'Schedule',
      href: '/dashboard/schedules',
      icon: Calendar,
    },
    {
      title: 'Analytics',
      href: '/dashboard/analytics',
      icon: FileText,
    },
    {
      title: 'Integrations',
      href: '/dashboard/integrations',
      icon: Plug,
    },
    {
      title: 'Notifications',
      href: '/dashboard/notifications',
      icon: Bell,
    },
    {
      title: '─────────────────',
      href: '#',
      icon: null,
      divider: true,
    },
    {
      title: 'Users',
      href: '/dashboard/users',
      icon: Users,
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ], []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isLoading) {
      return;
    }
    
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // Not authenticated - will redirect
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b bg-background sticky top-0 z-50">
        <h1 className="text-xl font-bold">StreamHub TV Hub</h1>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          className="p-2 rounded-lg hover:bg-muted"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-300 lg:hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold">Menu</h2>
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className="p-2 rounded-lg hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {navItems.map((item) => {
              if (item.divider) {
                return <div key={item.href} className="my-2 border-t" />;
              }
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.username || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <DashboardHeader />
      </div>
      
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            'hidden lg:flex sticky top-16 h-[calc(100vh-4rem)] border-r bg-background transition-all duration-300',
            sidebarCollapsed ? 'w-16' : 'w-64'
          )}
        >
          <nav className="space-y-1 p-4">
            {navItems.map((item) => {
              if (item.divider) {
                return <div key={item.href} className="my-2 border-t" />;
              }
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
                  {!sidebarCollapsed && <span>{item.title}</span>}
                </Link>
              );
            })}
          </nav>
          
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="absolute bottom-4 right-4 p-2 rounded-lg hover:bg-muted"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto lg:mt-0 mt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
