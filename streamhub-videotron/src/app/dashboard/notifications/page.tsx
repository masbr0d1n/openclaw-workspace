'use client';

import { useState } from 'react';
import { Bell, Mail, MessageSquare, Slack, HardDrive, Wifi, AlertCircle, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  icon: any;
  enabled: boolean;
  channels: {
    email: boolean;
    telegram: boolean;
    slack: boolean;
  };
}

export default function NotificationsPage() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'device-offline',
      title: 'Device Offline Alert',
      description: 'Get notified when a device goes offline or loses connection',
      icon: Wifi,
      enabled: true,
      channels: {
        email: true,
        telegram: true,
        slack: false,
      },
    },
    {
      id: 'storage-full',
      title: 'Storage Full Warning',
      description: 'Alert when storage capacity reaches critical levels',
      icon: HardDrive,
      enabled: true,
      channels: {
        email: true,
        telegram: true,
        slack: false,
      },
    },
    {
      id: 'failed-playback',
      title: 'Failed Content Playback',
      description: 'Notification when content fails to play on any device',
      icon: AlertCircle,
      enabled: false,
      channels: {
        email: false,
        telegram: false,
        slack: false,
      },
    },
  ]);

  const toggleSetting = (id: string) => {
    setSettings(settings.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const toggleChannel = (settingId: string, channel: 'email' | 'telegram' | 'slack') => {
    setSettings(settings.map(s =>
      s.id === settingId
        ? { ...s, channels: { ...s.channels, [channel]: !s.channels[channel] } }
        : s
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Notifications & Alerts</h1>
        <p className="text-muted-foreground mt-2">
          Configure how and when you want to be notified about important events
        </p>
      </div>

      {/* Integration Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Configure your integration settings for Email, Telegram, and Slack
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email Integration */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">Email Integration</h3>
                <p className="text-sm text-muted-foreground">Send notifications via email</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium">
              Configure
            </button>
          </div>

          {/* Telegram Integration */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-100 dark:bg-sky-900 rounded-lg">
                <MessageSquare className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <h3 className="font-semibold">Telegram Integration</h3>
                <p className="text-sm text-muted-foreground">Send notifications to Telegram</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium">
              Configure
            </button>
          </div>

          {/* Slack Integration */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Slack className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold">Slack Integration</h3>
                <p className="text-sm text-muted-foreground">Send notifications to Slack channels</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium">
              Configure
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Alert Settings */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Alert Rules</h2>

        {settings.map((setting) => {
          const Icon = setting.icon;
          return (
            <Card key={setting.id} className={!setting.enabled ? 'opacity-60' : ''}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header: Title, Description, Enable Toggle */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${setting.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                        <Icon className={`h-5 w-5 ${setting.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{setting.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{setting.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSetting(setting.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        setting.enabled ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          setting.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Channel Toggles */}
                  {setting.enabled && (
                    <div className="pl-14 space-y-3">
                      <p className="text-sm font-medium text-muted-foreground">Send via:</p>
                      <div className="flex flex-wrap gap-4">
                        {/* Email Toggle */}
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={setting.channels.email}
                            onChange={() => toggleChannel(setting.id, 'email')}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />
                            Email
                          </span>
                        </label>

                        {/* Telegram Toggle */}
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={setting.channels.telegram}
                            onChange={() => toggleChannel(setting.id, 'telegram')}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm flex items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5" />
                            Telegram
                          </span>
                        </label>

                        {/* Slack Toggle */}
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={setting.channels.slack}
                            onChange={() => toggleChannel(setting.id, 'slack')}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm flex items-center gap-1">
                            <Slack className="h-3.5 w-3.5" />
                            Slack
                          </span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button className="px-4 py-2 border rounded-lg hover:bg-muted">
          Cancel
        </button>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
          Save Changes
        </button>
      </div>
    </div>
  );
}
