'use client';

export function ArchiveContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Archive</h2>
          <p className="text-muted-foreground">
            View and restore archived content
          </p>
        </div>
      </div>

      <div className="border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">Archive feature coming soon</p>
        <p className="text-sm text-muted-foreground mt-2">
          Access and restore previously archived content
        </p>
      </div>
    </div>
  );
}
