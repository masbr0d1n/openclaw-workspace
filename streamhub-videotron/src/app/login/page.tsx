/**
 * Login Page - Videotron
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
import { Loader2, Lock, Mail, Shield, Zap, CheckCircle } from 'lucide-react';

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
      console.log('📦 API Response:', data);
      
      // Backend returns: { status, statusCode, message, data: { access_token, refresh_token } }
      const responseData = data.data || data;
      const access_token = responseData.access_token;
      const refresh_token = responseData.refresh_token;
      
      console.log('🎫 Tokens received:', !!access_token, !!refresh_token);

      if (!access_token) {
        throw new Error('Invalid response from server: missing access token');
      }

      // Fetch user data with the token
      console.log('👤 Fetching user data...');
      const userResponse = await fetch('/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });
      
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const userData = await userResponse.json();
      console.log('📦 User Response:', userData);
      
      const user = userData.data || userData;
      
      if (!user) {
        throw new Error('Invalid user data received');
      }

      console.log('✅ User data received:', user);

      // Store login category as videotron
      localStorage.setItem('login_category', 'videotron');

      // Use auth store login with validated data
      login(user, access_token, refresh_token);
      console.log('✅ Auth store login called with user:', !!user);

      console.log('✅ Login successful');

      // Redirect to Videotron dashboard
      router.push('/dashboard/screens');
    } catch (error) {
      console.error('❌ Login failed:', error);
      alert(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 dark:from-purple-900 dark:via-indigo-900 dark:to-purple-950 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
      
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-0 overflow-hidden">
        {/* Gradient Top Border */}
        <div className="h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600"></div>
        
        <CardContent className="p-8 space-y-6">
          {/* Logo & Branding */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg mb-2">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Videotron
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400 text-base mt-1">
                StreamHub Digital Signage
              </CardDescription>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-500" />
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="username"
                className="h-12 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-500" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
                className="h-12 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}
            </Button>
          </form>
          
          {/* Trust Indicators */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                <span>Secure Login</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                <span>Encrypted</span>
              </div>
            </div>
          </div>

          {/* Test Credentials */}
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 border border-purple-100 dark:border-gray-700">
            <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Test credentials:
            </p>
            <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400 font-mono">
              <p>Username: <code className="bg-white dark:bg-gray-900 px-2 py-0.5 rounded text-purple-600 dark:text-purple-400">sysop@test.com</code></p>
              <p>Password: <code className="bg-white dark:bg-gray-900 px-2 py-0.5 rounded text-purple-600 dark:text-purple-400">password123</code></p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-4 text-center text-xs text-white/60 dark:text-white/40 z-10">
        <p>© 2026 StreamHub Videotron. All rights reserved.</p>
      </div>
    </div>
  );
}
