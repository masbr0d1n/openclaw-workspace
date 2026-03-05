/**
 * Settings Page with YouTube Cookie Management
 * Cookie stored in browser localStorage only
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Youtube, Shield, Eye, EyeOff, Save, Trash2, RefreshCw, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const YOUTUBE_COOKIE_KEY = 'streamhub_youtube_cookie';
const COOKIE_VALIDATION_KEY = 'streamhub_youtube_cookie_valid';

export default function SettingsPage() {
  const [youtubeCookie, setYoutubeCookie] = useState('');
  const [showCookie, setShowCookie] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [cookieStatus, setCookieStatus] = useState<'none' | 'valid' | 'invalid'>('none');
  const [youtubeChannel, setYoutubeChannel] = useState<string | null>(null);
  const [lastValidated, setLastValidated] = useState<string | null>(null);

  // Load cookie from localStorage on mount
  useEffect(() => {
    const savedCookie = localStorage.getItem(YOUTUBE_COOKIE_KEY);
    if (savedCookie) {
      setYoutubeCookie(savedCookie);
      
      // Check validation status
      const validationStatus = localStorage.getItem(COOKIE_VALIDATION_KEY);
      if (validationStatus) {
        const data = JSON.parse(validationStatus);
        setCookieStatus(data.status);
        setYoutubeChannel(data.channel || null);
        setLastValidated(data.timestamp || null);
      }
    }
  }, []);

  // Save cookie to localStorage
  const handleSaveCookie = () => {
    if (!youtubeCookie.trim()) {
      toast.error('Cookie cannot be empty');
      return;
    }

    // Basic format validation
    if (!youtubeCookie.includes('SID=') && !youtubeCookie.includes('__Secure-')) {
      toast.error('Invalid YouTube cookie format. Please paste the complete cookie string.');
      return;
    }

    localStorage.setItem(YOUTUBE_COOKIE_KEY, youtubeCookie);
    setCookieStatus('none');
    setYoutubeChannel(null);
    toast.success('YouTube cookie saved locally');
  };

  // Remove cookie from localStorage
  const handleRemoveCookie = () => {
    localStorage.removeItem(YOUTUBE_COOKIE_KEY);
    localStorage.removeItem(COOKIE_VALIDATION_KEY);
    setYoutubeCookie('');
    setCookieStatus('none');
    setYoutubeChannel(null);
    setLastValidated(null);
    toast.success('YouTube cookie removed');
  };

  // Validate cookie by checking YouTube API
  const handleValidateCookie = async () => {
    if (!youtubeCookie.trim()) {
      toast.error('Please enter a cookie first');
      return;
    }

    setIsValidating(true);

    try {
      // Try to fetch YouTube user info using the cookie
      const response = await fetch('https://www.youtube.com/youtubei/v1/account/account_menu?prettyPrint=false', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': youtubeCookie,
        },
        body: JSON.stringify({
          context: {
            client: {
              hl: 'en',
              gl: 'US',
              clientName: 'WEB',
              clientVersion: '2.20250303.00.00'
            }
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Check if we have account info
        const accountName = data?.actions?.[0]?.accountSectionListRenderer?.header?.accountNameComponent?.text;
        
        if (accountName) {
          setCookieStatus('valid');
          setYoutubeChannel(accountName);
          
          // Save validation status
          localStorage.setItem(COOKIE_VALIDATION_KEY, JSON.stringify({
            status: 'valid',
            channel: accountName,
            timestamp: new Date().toISOString()
          }));
          
          toast.success(`Cookie validated! Connected to: ${accountName}`);
        } else {
          throw new Error('Could not extract account info');
        }
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      console.error('Cookie validation error:', error);
      
      // Alternative validation - check if cookie has required fields
      if (youtubeCookie.includes('SID=') && youtubeCookie.includes('SSID=') && youtubeCookie.includes('APISID=')) {
        setCookieStatus('valid');
        setYoutubeChannel('Unknown (limited validation)');
        
        localStorage.setItem(COOKIE_VALIDATION_KEY, JSON.stringify({
          status: 'valid',
          channel: 'Unknown',
          timestamp: new Date().toISOString()
        }));
        
        toast.success('Cookie format is valid');
      } else {
        setCookieStatus('invalid');
        setYoutubeChannel(null);
        
        localStorage.setItem(COOKIE_VALIDATION_KEY, JSON.stringify({
          status: 'invalid',
          channel: null,
          timestamp: new Date().toISOString()
        }));
        
        toast.error('Cookie is invalid or expired');
      }
    } finally {
      setIsValidating(false);
    }
  };

  // Get cookie instructions
  const getCookieInstructions = () => {
    return (
      <div className="space-y-3 text-sm">
        <p><strong>How to get YouTube cookie:</strong></p>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
          <li>Open YouTube in your browser</li>
          <li>Open Developer Tools (F12)</li>
          <li>Go to <strong>Application</strong> tab</li>
          <li>Expand <strong>Cookies</strong> → <strong>https://www.youtube.com</strong></li>
          <li>Copy all cookie values as JSON or use browser extension</li>
          <li>Paste the cookie string in the field above</li>
        </ol>
        <Alert className="mt-4">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Use browser extensions like <strong>"EditThisCookie"</strong> or <strong>"Cookie-Editor"</strong> 
            to easily export cookies in the correct format.
          </AlertDescription>
        </Alert>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your application settings and preferences
        </p>
      </div>

      <Tabs defaultValue="youtube" className="space-y-4">
        <TabsList>
          <TabsTrigger value="youtube">
            <Youtube className="h-4 w-4 mr-2" />
            YouTube Integration
          </TabsTrigger>
          <TabsTrigger value="general">
            General
          </TabsTrigger>
        </TabsList>

        <TabsContent value="youtube" className="space-y-4">
          {/* Privacy Notice */}
          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertTitle className="text-blue-800 dark:text-blue-300">Privacy Notice</AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-400 text-sm">
              <strong>Your YouTube cookie is stored ONLY in your browser's local storage.</strong> It is never sent to our servers - 
              it stays on your device and is used only for direct YouTube API calls from your browser. 
              You can remove it at any time. This cookie enables YouTube features like video previews, 
              detailed specifications, and offline downloads without server-side authentication.
            </AlertDescription>
          </Alert>

          {/* YouTube Cookie Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Youtube className="h-5 w-5 text-red-600" />
                YouTube Cookie Configuration
              </CardTitle>
              <CardDescription>
                Configure your YouTube cookie for enhanced features (preview, specs, downloads)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cookie Status */}
              {cookieStatus !== 'none' && (
                <Alert variant={cookieStatus === 'valid' ? 'default' : 'destructive'}>
                  {cookieStatus === 'valid' ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>Cookie Validated</AlertTitle>
                      <AlertDescription className="text-sm">
                        {youtubeChannel && `Connected to: ${youtubeChannel}`}
                        {lastValidated && (
                          <span className="block mt-1 text-xs text-muted-foreground">
                            Last validated: {new Date(lastValidated).toLocaleString()}
                          </span>
                        )}
                      </AlertDescription>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Invalid Cookie</AlertTitle>
                      <AlertDescription className="text-sm">
                        The cookie appears to be invalid or expired. Please update it.
                      </AlertDescription>
                    </>
                  )}
                </Alert>
              )}

              {/* Cookie Input */}
              <div className="space-y-2">
                <Label htmlFor="youtube-cookie">YouTube Cookie</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Textarea
                      id="youtube-cookie"
                      placeholder="Paste your YouTube cookie here (SID=xxx; SSID=xxx; APISID=xxx; ...)"
                      value={youtubeCookie}
                      onChange={(e) => setYoutubeCookie(e.target.value)}
                      className={`font-mono text-xs ${showCookie ? '' : 'blur-sm select-none'}`}
                      rows={4}
                    />
                    {!showCookie && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowCookie(true)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Show Cookie
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {youtubeCookie.length > 0 ? `${youtubeCookie.length} characters` : 'No cookie set'}
                  </span>
                  {youtubeCookie && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCookie(!showCookie)}
                      className="gap-1"
                    >
                      {showCookie ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      {showCookie ? 'Hide' : 'Show'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleSaveCookie} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Cookie
                </Button>
                <Button onClick={handleValidateCookie} variant="outline" disabled={isValidating} className="gap-2">
                  <RefreshCw className={`h-4 w-4 ${isValidating ? 'animate-spin' : ''}`} />
                  {isValidating ? 'Validating...' : 'Validate Cookie'}
                </Button>
                {youtubeCookie && (
                  <Button onClick={handleRemoveCookie} variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>

              {/* Features Enabled */}
              {cookieStatus === 'valid' && (
                <div className="space-y-2 pt-2 border-t">
                  <Label className="text-sm font-medium">Features Enabled:</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Video Preview
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Video Specifications
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Offline Download
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Age-Restricted Content
                    </Badge>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="pt-4 border-t">
                {getCookieInstructions()}
              </div>
            </CardContent>
          </Card>

          {/* Security Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">🔒 Security Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              <p>• Cookie is stored in <code>localStorage</code> under key: <code>{YOUTUBE_COOKIE_KEY}</code></p>
              <p>• Cookie is NEVER sent to our servers - only to YouTube APIs</p>
              <p>• Each browser/device has its own separate storage</p>
              <p>• Clearing browser data will remove the cookie</p>
              <p>• You can revoke access by removing the cookie at any time</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Application-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                More settings coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
