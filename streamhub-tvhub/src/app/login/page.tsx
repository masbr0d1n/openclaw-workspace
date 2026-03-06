/**
 * Login Page - TV Hub
 * Modern Minimalist + Professional Design
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Shield, Lock, Mail, ArrowRight, Tv } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, setLoading } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('📍 Login page mounted');
    setLoading(false);
  }, [setLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🚀 Submitting login form...');
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      const { access_token, refresh_token, user } = data.data;

      // Store login category as tv_hub
      localStorage.setItem('login_category', 'tv_hub');

      // Use auth store login
      login(user, access_token, refresh_token);

      console.log('✅ Login successful');

      // Redirect to TV Hub dashboard
      router.push('/dashboard/channels');
    } catch (error) {
      console.error('❌ Login failed:', error);
      alert(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Modern Card Design */}
      <Card className="w-full max-w-md bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border-0 relative z-10 transition-all duration-300 hover:shadow-3xl">
        <CardHeader className="space-y-6 pb-6 pt-8 px-8">
          {/* Logo/Branding */}
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-110">
              <Tv className="w-8 h-8 text-white" />
            </div>
            <div className="text-center space-y-1">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StreamHub
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400 text-base font-medium">
                TV Hub Portal
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" />
                Username
              </Label>
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="username"
                  className="h-12 pl-11 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-500" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="h-12 pl-11 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent rounded-xl"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
          
          {/* Test Credentials */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
              <Shield className="w-3 h-3 text-green-500" />
              Test credentials:
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1 font-mono">
              <p>Username: <code className="bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded text-blue-600 dark:text-blue-400">sysop@test.com</code></p>
              <p>Password: <code className="bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded text-purple-600 dark:text-purple-400">password123</code></p>
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <Shield className="w-3 h-3" />
            <span>Secured with end-to-end encryption</span>
          </div>
        </CardContent>
      </Card>

      {/* Footer Branding */}
      <div className="absolute bottom-4 text-center text-white/60 text-xs">
        <p>© 2026 StreamHub. All rights reserved.</p>
      </div>
    </div>
  );
}
