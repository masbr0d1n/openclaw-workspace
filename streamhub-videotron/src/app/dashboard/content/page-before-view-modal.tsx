'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Upload, Loader2, Eye, Edit2, Trash2 } from 'lucide-react';
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
  DialogTrigger,
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

export default function ContentPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('entertainment');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadDuration, setUploadDuration] = useState('');
  const [uploadExpiryDate, setUploadExpiryDate] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  
  // Edit state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editVideo, setEditVideo] = useState<any>(null);
  
  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteVideo, setDeleteVideo] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    youtube_id: '',
    category: '',
    description: '',
  });

  // Fetch videos on mount
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

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          channel_id: 2,
        }),
      });

      if (!response.ok) throw new Error('Failed to add content');

      setAddDialogOpen(false);
      setFormData({ title: '', youtube_id: '', category: '', description: '' });
      fetchVideos();
    } catch (error) {
      console.error('Error adding content:', error);
      alert('Failed to add content');
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
      
      video.onerror = () => {
        console.error('Error loading video metadata');
        setUploadDuration('');
      };
      
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
      
      if (uploadExpiryDate) {
        formData_upload.append('expiry_date', uploadExpiryDate);
      }
      if (tagsArray.length > 0) {
        formData_upload.append('tags', JSON.stringify(tagsArray));
      }

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
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
        setUploadError('Network error during upload');
        setUploadProgress(0);
      });

      xhr.open('POST', '/api/videos/upload');
      xhr.send(formData_upload);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(`Failed to upload: ${error.message}`);
      setUploadProgress(0);
    }
  };

  // View video handler
  const handleViewVideo = (video: any) => {
    if (video.video_url) {
      window.open(`${BACKEND_URL}${video.video_url}`, '_blank');
    } else {
      alert('No video URL available');
    }
  };

  // Edit handlers
  const handleEditClick = (video: any) => {
    setEditVideo(video);
    setFormData({
      title: video.title,
      youtube_id: video.youtube_id || '',
      category: video.category || '',
      description: video.description || '',
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/videos/${editVideo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update content');

      setEditDialogOpen(false);
      setEditVideo(null);
      fetchVideos();
    } catch (error) {
      console.error('Error updating content:', error);
      alert('Failed to update content');
    }
  };

  // Delete handlers
  const handleDeleteClick = (video: any) => {
    setDeleteVideo(video);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/videos/${deleteVideo.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete content');

      setDeleteDialogOpen(false);
      setDeleteVideo(null);
      fetchVideos();
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Failed to delete content');
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

  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.youtube_id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  function formatDuration(seconds: number) {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Content Library</h1>
          <p className="text-muted-foreground">Manage your content</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Content
          </Button>

          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Content
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Content</DialogTitle>
                <DialogDescription>Add YouTube video content to your library</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddContent} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Video title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube_id">YouTube ID</Label>
                  <Input
                    id="youtube_id"
                    value={formData.youtube_id}
                    onChange={(e) => setFormData({ ...formData, youtube_id: e.target.value })}
                    placeholder="YouTube video ID"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger id="category">
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Video description"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Content</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
              <TableHead>Added</TableHead>
              <TableHead>Expiry</TableHead>
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
                        onClick={() => handleViewVideo(video)}
                      />
                    ) : video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-16 h-9 object-cover rounded cursor-pointer hover:opacity-80"
                        onClick={() => handleViewVideo(video)}
                      />
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
                    <span className={`px-2 py-1 rounded text-xs ${
                      video.video_url 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                        : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    }`}>
                      {video.content_type || (video.video_url ? 'Video' : 'Image')}
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewVideo(video)}
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(video)}
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(video)}
                        title="Delete"
                      >
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

      {/* Upload Content Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <Card className="border-0 shadow-none">
            <CardHeader className="space-y-1 px-0 pt-0">
              <DialogHeader className="space-y-1 px-0 pt-0">
                <VisuallyHidden>
                  <DialogTitle>Upload Content</DialogTitle>
                </VisuallyHidden>
              </DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">Upload Content</CardTitle>
                  <CardDescription>
                    Upload videos or images (MP4, JPG, JPEG, PNG, BMP, GIF)
                  </CardDescription>
                </div>
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
                      if (file) {
                        handleFileSelect(file);
                      }
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
                  <p className="text-xs text-muted-foreground">
                    Separate multiple tags with commas
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upload-category">Category</Label>
                  <Select
                    value={uploadCategory}
                    onValueChange={setUploadCategory}
                  >
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
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetUploadForm();
                      setUploadDialogOpen(false);
                    }}
                    disabled={uploadProgress > 0}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!uploadFile || uploadProgress > 0}
                    className="flex-1"
                  >
                    {uploadProgress > 0 ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Upload'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
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
                placeholder="Content title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Content description"
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
              Are you sure you want to delete "{deleteVideo?.title}"? This action cannot be undone.
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
