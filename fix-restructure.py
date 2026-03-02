#!/usr/bin/env python3
"""
Properly restructure modal - single column layout
"""

file_path = "/home/sysop/.openclaw/workspace/streamhub-nextjs/src/app/dashboard/content/page.tsx"

with open(file_path, 'r') as f:
    content = f.read()

# Find the modal content area and restructure it properly
# We need to replace from the start of the content area to the end of the cards

# Find the pattern: from flex-1 overflow-y-auto to before the footer
import re

# Pattern to match the entire content area that needs restructuring
pattern = r'(<div className="flex-1 overflow-y-auto p-8 custom-scrollbar">)(.*?)(<div className="px-8 py-4 border-t border-slate-100")'

# New single-column layout
new_layout = r'''\1
                <div className="space-y-6">
                  {/* Video/Image Player */}
                  <div className="relative group rounded-xl overflow-hidden aspect-video bg-black shadow-lg">
                    {selectedVideo.content_type === 'video' ? (
                      <video
                        ref={videoRef}
                        src={selectedVideo.video_url ? `${BACKEND_URL}${selectedVideo.video_url}` : undefined}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        controls
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                      />
                    ) : selectedVideo.content_type === 'image' ? (
                      <>
                        {selectedVideo.thumbnail_data ? (
                          <img
                            src={`data:image/jpeg;base64,${selectedVideo.thumbnail_data}`}
                            alt={selectedVideo.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                            <span className="text-white text-4xl font-bold">IMAGE</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-4xl font-bold">CONTENT</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {selectedVideo.description && (
                    <div className="space-y-3">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                        Description
                      </label>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {selectedVideo.description}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedVideo.tags && Array.isArray(selectedVideo.tags) && selectedVideo.tags.length > 0 ? (
                        selectedVideo.tags.map((tag: string, i: number) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm rounded-full border border-slate-200 dark:border-slate-700"
                          >
                            #{tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-400">No tags</span>
                      )}
                    </div>
                  </div>

                  {/* General Information Card */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                      <Info className="w-5 h-5 mr-2 text-blue-500" />
                      General Information
                    </h3>
                    <div className="grid grid-cols-2 gap-y-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 mb-1">
                          Title
                        </p>
                        <p className="text-slate-900 dark:text-white font-medium truncate" title={selectedVideo.title}>
                          {selectedVideo.title}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 mb-1">
                          File Type
                        </p>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getFileBadgeColor(selectedVideo.content_type, selectedVideo.video_url)}`}>
                            {selectedVideo.video_url ? getFileExtension(selectedVideo.video_url).toUpperCase() : 'UNKNOWN'}
                          </span>
                          <span className="ml-2 text-xs text-slate-500">
                            {selectedVideo.content_type === 'video' ? 'Video' : selectedVideo.content_type === 'image' ? 'Image' : 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 mb-1">
                          Category
                        </p>
                        <p className="text-slate-900 dark:text-white font-medium capitalize">
                          {selectedVideo.category || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 mb-1">
                          Upload Date
                        </p>
                        <p className="text-slate-900 dark:text-white font-medium">
                          {new Date(selectedVideo.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: '2-digit',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 mb-1">
                          Expiry Date
                        </p>
                        <p className={`font-medium ${selectedVideo.expiry_date ? 'text-red-500 dark:text-red-400' : ''}`}>
                          {selectedVideo.expiry_date
                            ? new Date(selectedVideo.expiry_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: '2-digit',
                                year: 'numeric'
                              })
                            : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Video Metadata Card */}
                  {selectedVideo.content_type === 'video' && (
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-blue-500" />
                        Video Metadata
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                              <span className="text-xs text-slate-500">16:9</span>
                            </div>
                            <span className="text-sm text-slate-500 dark:text-slate-400">Resolution</span>
                          </div>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {selectedVideo.width && selectedVideo.height
                              ? `${selectedVideo.width} × ${selectedVideo.height} (HD)`
                              : '-'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                              <span className="text-xs text-slate-500">⏱</span>
                            </div>
                            <span className="text-sm text-slate-500 dark:text-slate-400">Duration</span>
                          </div>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {selectedVideo.duration ? formatDuration(selectedVideo.duration) : '-'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                              <span className="text-xs text-slate-500">fps</span>
                            </div>
                            <span className="text-sm text-slate-500 dark:text-slate-400">Frame Rate</span>
                          </div>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {selectedVideo.fps ? `${selectedVideo.fps} fps` : '-'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                              <span className="text-xs text-slate-500">🎬</span>
                            </div>
                            <span className="text-sm text-slate-500 dark:text-slate-400">Video Codec</span>
                          </div>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white truncate" title={selectedVideo.video_codec}>
                            {selectedVideo.video_codec || '-'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                              <span className="text-xs text-slate-500">🔊</span>
                            </div>
                            <span className="text-sm text-slate-500 dark:text-slate-400">Audio Codec</span>
                          </div>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white truncate" title={selectedVideo.audio_codec}>
                            {selectedVideo.audio_codec || '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
\3'''

content = re.sub(pattern, new_layout, content, flags=re.DOTALL)

with open(file_path, 'w') as f:
    f.write(content)

print("✓ Restructured to single column layout")
print("  - Cards moved below Description")
print("  - Action buttons removed")
