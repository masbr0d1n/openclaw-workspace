'use client';

export function FeedsContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Feeds (Dynamic Content)</h2>
          <p className="text-muted-foreground">
            Configure dynamic content feeds from external sources
          </p>
        </div>
      </div>

      <div className="border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">Feeds feature coming soon</p>
        <p className="text-sm text-muted-foreground mt-2">
          Connect RSS feeds, APIs, and other dynamic content sources
        </p>
      </div>
    </div>
  );
}
