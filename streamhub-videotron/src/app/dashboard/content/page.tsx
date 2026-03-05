'use client';

import { useState } from 'react';
import ContentTabs from '@/components/content/content-tabs';
import { MediaLibraryContent } from './components/media-library-content';
import PlaylistsContent from './components/playlists-content';
import { LayoutsContent } from './components/layouts-content';
import { TemplatesContent } from './components/templates-content';
import { FeedsContent } from './components/feeds-content';
import { CampaignsContent } from './components/campaigns-content';
import { ApprovalWorkflowContent } from './components/approval-workflow-content';
import { ArchiveContent } from './components/archive-content';

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState('media-library');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Content</h1>
        <p className="text-muted-foreground mt-2">
          Manage your media library, playlists, layouts, and more
        </p>
      </div>

      {/* Tabs Navigation */}
      <ContentTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Tab Content */}
      {activeTab === 'media-library' && <MediaLibraryContent />}
      {activeTab === 'playlists' && <PlaylistsContent />}
      {activeTab === 'layouts' && <LayoutsContent />}
      {activeTab === 'templates' && <TemplatesContent />}
      {activeTab === 'feeds' && <FeedsContent />}
      {activeTab === 'campaigns' && <CampaignsContent />}
      {activeTab === 'approval-workflow' && <ApprovalWorkflowContent />}
      {activeTab === 'archive' && <ArchiveContent />}
    </div>
  );
}
