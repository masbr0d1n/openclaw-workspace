/**
 * Media Library Component
 * Original content page functionality
 * Moved here to support tabbed interface
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Filter, Upload, Eye, Edit2, Trash2, Play, Pause, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://192.168.8.117:8001';

export function MediaLibraryFull() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Filter & Sort State
  const [filterType, setFilterType] = useState('all'); // all, video, image
  const [sortBy, setSortBy] = useState('created_at'); // created_at, expiry_date
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('entertainment');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadDuration, setUploadDuration] = useState('');
  const [uploadExpiryDate, setUploadExpiryDate] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    youtube_id: '',
    category: '',
    description: '',
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/videos');
      if (!response.ok) throw new Error('Failed to fetch videos');
      const data = await response.json();
      setVideos(data.data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewClick = (video: any) => {
    setSelectedVideo(video);
    setIsPlaying(false); // Reset play state when opening modal
    setViewDialogOpen(true);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleEditClick = (video: any) => {
    setSelectedVideo(video);
    setFormData({
      title: video.title,
      youtube_id: video.youtube_id || '',
      category: video.category || '',
      description: video.description || '',
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (video: any) => {
    setSelectedVideo(video);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/videos/${selectedVideo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to update');
      setEditDialogOpen(false);
      fetchVideos();
    } catch (error) {
      console.error('Error updating:', error);
      alert('Failed to update content');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/videos/${selectedVideo.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
      setDeleteDialogOpen(false);
      fetchVideos();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete content');
    }
  };

  const handleFileSelect = async (file: File) => {
    setUploadFile(file);
    if (!uploadTitle) {
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
    if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const duration = video.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        setUploadDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        URL.revokeObjectURL(video.src);
      };
      video.onerror = () => setUploadDuration('');
      video.src = URL.createObjectURL(file);
    } else {
      setUploadDuration('N/A');
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadTitle('');
    setUploadDescription('');
    setUploadCategory('entertainment');
    setUploadDuration('');
    setUploadExpiryDate('');
    setUploadTags('');
    setUploadError('');
    setUploadProgress(0);
  };

  const handleUploadContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a file');
      return;
    }
    setUploadProgress(0);
    setUploadError('');
    try {
      const finalTitle = uploadTitle.trim() || uploadFile.name.replace(/\.[^/.]+$/, '');
      const tagsArray = uploadTags.split(',').map(t => t.trim()).filter(t => t);
      const formData_upload = new FormData();
      formData_upload.append('file', uploadFile);
      formData_upload.append('title', finalTitle);
      formData_upload.append('category', uploadCategory);
      formData_upload.append('description', uploadDescription);
      formData_upload.append('channel_id', '2');
      if (uploadExpiryDate) formData_upload.append('expiry_date', uploadExpiryDate);
      if (tagsArray.length > 0) formData_upload.append('tags', JSON.stringify(tagsArray));

      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
      });
      xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 201) {
          setUploadDialogOpen(false);
          resetUploadForm();
          fetchVideos();
        } else {
          const error = JSON.parse(xhr.responseText);
          setUploadError(error.message || 'Upload failed');
          setUploadProgress(0);
        }
      });
      xhr.addEventListener('error', () => {
        setUploadError('Network error');
        setUploadProgress(0);
      });
      xhr.open('POST', '/api/videos/upload');
      xhr.send(formData_upload);
    } catch (error: any) {
      setUploadError(`Failed: ${error.message}`);
      setUploadProgress(0);
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'sport', label: 'Sport' },
    { value: 'kids', label: 'Kids' },
    { value: 'knowledge', label: 'Knowledge' },
    { value: 'gaming', label: 'Gaming' },
  ];

  const categoryOptions = categories.filter(c => c.value !== 'all');
  
  // Filter and Sort Videos
  const filteredVideos = videos
    .filter((video) => {
      // Search filter
      const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           video.youtube_id?.toLowerCase().includes(searchQuery.toLowerCase());
      // Category filter
      const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
      // Type filter (video/image)
      const matchesType = filterType === 'all' || 
        (filterType === 'video' && (video.content_type === 'video' || video.video_url)) ||
        (filterType === 'image' && video.content_type === 'image');
      return matchesSearch && matchesCategory && matchesType;
    })
    .sort((a, b) => {
      // Sorting
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      // Handle null/undefined values
      if (!aVal) aVal = '';
      if (!bVal) bVal = '';
      
      // Compare
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  function formatDuration(seconds: number) {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function getFileExtension(filename: string): string {
    if (!filename) return 'Unknown';
    const ext = filename.split('.').pop()?.toUpperCase();
    return ext || 'Unknown';
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">Manage your content</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Content
          </Button>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Type Filter */}
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="image">Image</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Sort By */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Added Date</SelectItem>
            <SelectItem value="expiry_date">Expiry Date</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Sort Order */}
        <Button
          variant="outline"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="w-[100px]"
          title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        >
          {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
          {sortOrder === 'asc' ? 'Asc' : 'Desc'}
        </Button>
      </div>

      {/* Content Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Thumbnail</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead 
                className="cursor-pointer hover:text-foreground"
                onClick={() => {
                  setSortBy('created_at');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}
              >
                <div className="flex items-center gap-1">
                  Added
                  {sortBy === 'created_at' && (
                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:text-foreground"
                onClick={() => {
                  setSortBy('expiry_date');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}
              >
                <div className="flex items-center gap-1">
                  Expiry
                  {sortBy === 'expiry_date' && (
                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Loading content...
                </TableCell>
              </TableRow>
            ) : filteredVideos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  No content found
                </TableCell>
              </TableRow>
            ) : (
              filteredVideos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell>
                    {video.thumbnail_data ? (
                      <img
                        src={`data:image/jpeg;base64,${video.thumbnail_data}`}
                        alt={video.title}
                        className="w-16 h-9 object-cover rounded cursor-pointer hover:opacity-80"
                        onClick={() => handleViewClick(video)}
                      />
                    ) : video.video_url ? (
                      <div 
                        className="w-16 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:opacity-80"
                        onClick={() => handleViewClick(video)}
                      >
                        {video.content_type === 'image' ? 'IMG' : 'VID'}
                      </div>
                    ) : (
                      <div className="w-16 h-9 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                        No img
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{video.title}</div>
                    {video.description && (
                      <div className="text-sm text-muted-foreground truncate max-w-md">
                        {video.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{video.category || '-'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      video.content_type === 'video' || video.video_url
                        ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' 
                        : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    }`}>
                      {video.content_type?.toUpperCase() || (video.video_url ? 'VIDEO' : 'IMAGE')}
                    </span>
                  </TableCell>
                  <TableCell>
                    {video.duration 
                      ? formatDuration(video.duration)
                      : (video.video_url ? '-' : 'N/A')
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {video.tags && Array.isArray(video.tags) && video.tags.length > 0 ? (
                        video.tags.map((tag: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                            {tag}
                          </span>
                        ))
                      ) : '-'}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(video.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {video.expiry_date 
                      ? new Date(video.expiry_date).toLocaleDateString()
                      : 'None'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleViewClick(video)} title="View Details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(video)} title="Edit">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(video)} title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Upload Dialog - same as before */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <Card className="border-0 shadow-none">
            <CardHeader className="space-y-1 px-0 pt-0">
              <VisuallyHidden>
                <DialogTitle>Upload Content</DialogTitle>
              </VisuallyHidden>
              <div>
                <CardTitle className="text-2xl font-bold">Upload Content</CardTitle>
                <CardDescription>
                  Upload videos or images (MP4, JPG, JPEG, PNG, BMP, GIF)
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <form onSubmit={handleUploadContent} className="space-y-4">
                {uploadError && (
                  <div className="bg-destructive/15 text-destructive px-3 py-2 rounded-md text-sm">
                    {uploadError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="upload-file">Content File</Label>
                  <Input
                    id="upload-file"
                    type="file"
                    accept="video/*,image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file) handleFileSelect(file);
                    }}
                    required
                    disabled={uploadProgress > 0}
                  />
                  {uploadFile && (
                    <p className="text-xs text-muted-foreground">
                      Selected: {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upload-title">Title</Label>
                  <Input
                    id="upload-title"
                    type="text"
                    placeholder="Content title (optional)"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upload-duration">Duration</Label>
                  <Input
                    id="upload-duration"
                    type="text"
                    placeholder="Auto-detected for videos"
                    value={uploadDuration}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upload-expiry">Expiry Date</Label>
                  <Input
                    id="upload-expiry"
                    type="date"
                    value={uploadExpiryDate}
                    onChange={(e) => setUploadExpiryDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upload-tags">Tags</Label>
                  <Input
                    id="upload-tags"
                    type="text"
                    placeholder="Tags (comma-separated)"
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Separate multiple tags with commas</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upload-category">Category</Label>
                  <Select value={uploadCategory} onValueChange={setUploadCategory}>
                    <SelectTrigger id="upload-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upload-description">Description</Label>
                  <Textarea
                    id="upload-description"
                    placeholder="Content description (optional)"
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    rows={2}
                  />
                </div>
                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { resetUploadForm(); setUploadDialogOpen(false); }}
                    disabled={uploadProgress > 0}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!uploadFile || uploadProgress > 0} className="flex-1">
                    {uploadProgress > 0 ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog - WITH VIDEO PLAYBACK */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Content Details</DialogTitle>
            <DialogDescription>View detailed information about this content</DialogDescription>
          </DialogHeader>

          {selectedVideo && (
            <div className="space-y-6">
              {/* Thumbnail/Video Preview with Playback Controls */}
              <div className="flex flex-col items-center space-y-4">
                {selectedVideo.content_type === 'video' ? (
                  <>
                    {/* Video Player with Controls */}
                    <div className="relative w-full">
                      <video
                        ref={videoRef}
                        src={selectedVideo.video_url ? `${BACKEND_URL}${selectedVideo.video_url}` : undefined}
                        className="w-full rounded-lg shadow-lg"
                        controls
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    {/* Playback Status */}
                    <div className="text-sm text-muted-foreground text-center">
                      {isPlaying ? (
                        <span className="flex items-center justify-center gap-2">
                          <Pause className="w-4 h-4" />
                          Playing...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Play className="w-4 h-4" />
                          Paused or Stopped
                        </span>
                      )}
                    </div>
                  </>
                ) : selectedVideo.content_type === 'image' ? (
                  <>
                    {/* Static Image Display */}
                    {selectedVideo.thumbnail_data ? (
                      <img
                        src={`data:image/jpeg;base64,${selectedVideo.thumbnail_data}`}
                        alt={selectedVideo.title}
                        className="max-w-md rounded-lg shadow-lg"
                      />
                    ) : (
                      <div className="w-64 h-48 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-white text-lg font-bold">
                        IMAGE
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Fallback for unknown type */}
                    {selectedVideo.thumbnail_data ? (
                      <img
                        src={`data:image/jpeg;base64,${selectedVideo.thumbnail_data}`}
                        alt={selectedVideo.title}
                        className="max-w-md rounded-lg shadow-lg"
                      />
                    ) : (
                      <div className="w-64 h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg font-bold">
                        CONTENT
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Title</Label>
                  <p className="font-medium">{selectedVideo.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Extension</Label>
                  <p className="font-medium uppercase">{selectedVideo.content_type || (selectedVideo.video_url ? 'Video' : 'Image')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Category</Label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 uppercase">
                    {selectedVideo.category || '-'}
                  </span>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Upload Date</Label>
                  <p className="text-sm font-medium">{new Date(selectedVideo.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Description */}
              {selectedVideo.description && (
                <div>
                  <Label className="text-muted-foreground text-xs">Description</Label>
                  <p className="text-sm mt-1">{selectedVideo.description}</p>
                </div>
              )}

              {/* Video-specific metadata */}
              {selectedVideo.content_type === 'video' && (
                <div className="border rounded-lg p-4 space-y-3 bg-[\#f8fafc]">
                  <h3 className="font-semibold text-sm">Video Metadata</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground text-xs">Resolution</Label>
                      <p>{selectedVideo.width && selectedVideo.height 
                        ? `${selectedVideo.width}x${selectedVideo.height}` 
                        : '-'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Duration</Label>
                      <p>{selectedVideo.duration ? formatDuration(selectedVideo.duration) : '-'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Frame Rate</Label>
                      <p>{selectedVideo.fps ? `${selectedVideo.fps} fps` : '-'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Video Codec</Label>
                      <p>{selectedVideo.video_codec || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Audio Codec</Label>
                      <p>{selectedVideo.audio_codec || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Image-specific metadata */}
              {selectedVideo.content_type === 'image' && selectedVideo.width && selectedVideo.height && (
                <div className="border rounded-lg p-4 space-y-3 bg-[\#f8fafc]">
                  <h3 className="font-semibold text-sm">Image Metadata</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground text-xs">Dimensions</Label>
                      <p>{selectedVideo.width}x{selectedVideo.height} pixels</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Extension</Label>
                      <p>{selectedVideo.video_url ? getFileExtension(selectedVideo.video_url) : 'Unknown'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tags and Expiry */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedVideo.tags && Array.isArray(selectedVideo.tags) && selectedVideo.tags.length > 0 ? (
                      selectedVideo.tags.map((tag: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                          {tag}
                        </span>
                      ))
                    ) : '-'}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Expiry Date</Label>
                  <p className="text-sm font-medium text-red-500">{selectedVideo.expiry_date 
                    ? new Date(selectedVideo.expiry_date).toLocaleDateString()
                    : 'Never'}</p>
                </div>
              </div>

              {/* Close button */}
              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription>Update content information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedVideo?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
