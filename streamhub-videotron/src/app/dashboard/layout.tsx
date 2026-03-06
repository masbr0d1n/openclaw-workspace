/**
 * Dashboard Layout - Videotron
 * Digital Signage Network Management
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
  Monitor,
  FolderOpen,
  Calendar,
  Palette,
  BarChart3,
  Users,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user, checkAuth } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);
  
  // Videotron Menu Items
  const navItems = React.useMemo(() => [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Screens',
      href: '/dashboard/screens',
      icon: Monitor,
    },
    {
      title: 'Screen Groups',
      href: '/dashboard/screens/groups',
      icon: Monitor,
    },
    {
      title: 'Content Library',
      href: '/dashboard/content',
      icon: FolderOpen,
    },
    {
      title: 'Layouts (Composer)',
      href: '/dashboard/layouts',
      icon: Palette,
    },
    {
      title: 'Schedules (Playback)',
      href: '/dashboard/schedules',
      icon: Calendar,
    },
    {
      title: 'Campaigns',
      href: '/dashboard/campaign',
      icon: FolderOpen,
    },
    {
      title: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
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

  // Detect loading timeout (safety mechanism for infinite loading)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isLoading) {
      // Set a 10-second timeout to detect stuck loading state
      timeoutId = setTimeout(() => {
        console.error('⏰ LOADING TIMEOUT: isLoading has been true for 10 seconds!');
        console.error('  - isAuthenticated:', isAuthenticated);
        console.error('  - user:', user);
        setLoadingTimeout(true);
        
        // If we have inconsistent state (auth=true, user=null), force re-auth
        if (isAuthenticated && !user) {
          console.error('⚠️ Inconsistent state detected, attempting recovery...');
          checkAuth();
        }
      }, 10000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading, isAuthenticated, user, checkAuth]);

  // Log mount
  useEffect(() => {
    console.log('🏠 Dashboard layout mounted (Videotron)');
    console.log('👤 User:', user);
    console.log('✅ isAuthenticated:', isAuthenticated);
    console.log('⏳ isLoading:', isLoading);
  }, [user, isAuthenticated, isLoading]);

  // Redirect to login if not authenticated
  useEffect(() => {
    // Wait for auth check to complete
    if (isLoading && !loadingTimeout) {
      console.log('⏳ Still loading auth state, waiting...');
      return;
    }
    
    // If timeout occurred with inconsistent state, force recovery
    if (loadingTimeout && isAuthenticated && !user) {
      console.warn('⚠️ Recovery mode: Clearing corrupted state');
      router.push('/login');
      return;
    }
    
    console.log('🔍 Dashboard auth check:');
    console.log('  - isLoading:', isLoading);
    console.log('  - isAuthenticated:', isAuthenticated);
    console.log('  - user:', user);
    
    // CRITICAL FIX: Check both isAuthenticated AND user
    // isAuthenticated can be true from persisted state, but user might be null
    if (!isAuthenticated || !user) {
      console.log('❌ Not authenticated or user is null, redirecting to login');
      router.push('/login');
    } else {
      console.log('✅ Authenticated, showing dashboard');
    }
  }, [isLoading, isAuthenticated, user, router, loadingTimeout]);

  // Show loading while checking auth
  if (isLoading) {
    console.log('⏳ Showing loading spinner...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // CRITICAL FIX: Check both isAuthenticated AND user
  // Persisted state might have isAuthenticated=true but user=null
  if (!isAuthenticated || !user) {
    console.log('❌ Not authenticated or user is null, returning null (will redirect)');
    return null;
  }

  console.log('✅ Rendering dashboard layout');
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b bg-background sticky top-0 z-50">
        <h1 className="text-xl font-bold">StreamHub Videotron</h1>
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
                  <Icon className="h-4 w-4 flex-shrink-0" />
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
                  <Icon className="h-4 w-4 flex-shrink-0" />
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
