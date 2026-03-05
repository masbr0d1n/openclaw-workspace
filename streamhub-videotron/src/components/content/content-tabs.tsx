'use client';

import { TabsProps } from './types';

export default function ContentTabs({ activeTab, onTabChange, children }: TabsProps) {
  const tabs = [
    { id: 'media-library', label: 'Media Library' },
    { id: 'playlists', label: 'Playlists' },
    { id: 'layouts', label: 'Layouts' },
    { id: 'templates', label: 'Templates' },
    { id: 'feeds', label: 'Feeds (Dynamic Content)' },
    { id: 'campaigns', label: 'Campaigns' },
    { id: 'approval-workflow', label: 'Approval Workflow' },
    { id: 'archive', label: 'Archive' },
  ];

  return (
    <div>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-1 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {children && (
        <div className="mt-6">
          {children}
        </div>
      )}
    </div>
  );
}
