# Upload Video Form Design - Like TV Hub Login Form

## Current Upload Form (Content Page)
```tsx
<DialogContent>
  <DialogHeader>
    <DialogTitle>Upload Video</DialogTitle>
    <DialogDescription>Upload a video file from your device</DialogDescription>
  </DialogHeader>

  <form onSubmit={handleUploadVideo} className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="file">Video File</Label>
      <Input
        id="file"
        type="file"
        accept="video/*"
        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
        required
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

    <div className="flex justify-end gap-2">
      <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)}>
        Cancel
      </Button>
      <Button type="submit" disabled={!uploadFile || uploadProgress > 0}>
        {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Upload'}
      </Button>
    </div>
  </form>
</DialogContent>
```

## TV Hub Login Form (Reference)
```tsx
<Card className="w-full max-w-md">
  <CardHeader className="space-y-1">
    <CardTitle className="text-2xl font-bold">Login</CardTitle>
    <CardDescription>
      Enter your credentials to access StreamHub Dashboard
    </CardDescription>
  </CardHeader>
  <CardContent>
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={(value: LoginCategory) => setCategory(value)}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tv_hub">TV Hub</SelectItem>
            <SelectItem value="videotron">Videotron</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>
    </form>
  </CardContent>
</Card>
```

## Key Design Elements to Apply

1. **Card Layout** (instead of Dialog)
   - Card with max-w-md
   - CardHeader with space-y-1
   - CardTitle (text-2xl font-bold)
   - CardDescription

2. **Form Spacing**
   - space-y-4 for form
   - space-y-2 for each field group

3. **Input Style**
   - Label htmlFor (consistent)
   - Input with id and placeholder
   - Full width inputs

4. **Button**
   - Full width (w-full)
   - Loading state with Loader2 icon
   - Disabled during operation

## Upload Form Should Have

Using Card layout instead of Dialog:
- CardTitle: "Upload Video"
- CardDescription: "Upload a video file from your device"
- Fields:
  - File input (video/*)
  - Category dropdown (optional)
  - Title input (auto-filled or manual)
- Progress bar (if uploading)
- Action buttons:
  - Cancel (variant="outline")
  - Upload (disabled if no file or uploading)
