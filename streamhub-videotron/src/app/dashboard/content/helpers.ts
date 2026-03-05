// Helper function for formatDuration
function formatDuration(seconds: number): string {
  if (!seconds) return '-';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Helper function for file size
function formatFileSize(bytes: number): string {
  if (!bytes) return '-';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}

// Helper function for bitrate
function formatBitrate(bps: number): string {
  if (!bps) return '-';
  const mbps = bps / (1000 * 1000);
  return `${mbps.toFixed(2)} Mbps`;
}
