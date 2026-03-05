/**
 * Page Access Editor Component
 * Checkbox group for managing page access permissions
 */

'use client';

import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { PageAccess } from '@/types';

interface PageAccessEditorProps {
  value: PageAccess | undefined;
  onChange: (access: PageAccess) => void;
  disabled?: boolean;
}

const pages = [
  { key: 'dashboard' as const, label: 'Dashboard', icon: '🏠' },
  { key: 'channels' as const, label: 'Channels', icon: '📺' },
  { key: 'videos' as const, label: 'Videos', icon: '🎬' },
  { key: 'composer' as const, label: 'Composer', icon: '🎵' },
  { key: 'users' as const, label: 'Users', icon: '👥' },
  { key: 'settings' as const, label: 'Settings', icon: '⚙️' },
];

export function PageAccessEditor({ value, onChange, disabled = false }: PageAccessEditorProps) {
  const handleChange = (pageKey: keyof PageAccess, checked: boolean) => {
    const newAccess = {
      ...value,
      [pageKey]: checked,
    };
    onChange(newAccess);
  };

  const isChecked = (pageKey: keyof PageAccess) => {
    // If no access object, all pages allowed (true)
    if (!value) return true;
    // If page not specified, allowed (true)
    return value[pageKey] !== false;
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">Page Access Permissions</Label>
      <p className="text-sm text-muted-foreground">
        Select which pages this user can access. Unchecked pages will be hidden.
      </p>

      <div className="grid grid-cols-2 gap-3 pt-2">
        {pages.map((page) => {
          const checked = isChecked(page.key);
          
          return (
            <div key={page.key} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors">
              <Checkbox
                id={`page-${page.key}`}
                checked={checked}
                onCheckedChange={(checked) => handleChange(page.key, checked as boolean)}
                disabled={disabled}
                className="data-[state=checked]:bg-primary"
              />
              <Label
                htmlFor={`page-${page.key}`}
                className="flex-1 cursor-pointer text-sm font-normal"
              >
                <span className="mr-2">{page.icon}</span>
                {page.label}
              </Label>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <button
          type="button"
          onClick={() => onChange({})} // Empty object = all pages allowed
          disabled={disabled}
          className="text-xs text-primary hover:underline"
        >
          Allow All Pages
        </button>
        <span className="text-xs text-muted-foreground">
          {value && Object.keys(value).length > 0 ? `${Object.keys(value).length} restrictions` : 'All pages allowed'}
        </span>
      </div>
    </div>
  );
}
