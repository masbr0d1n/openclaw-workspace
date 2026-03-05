/**
 * Playlists Hook
 * React hooks for playlist operations
 */

'use client';

import { useState, useEffect } from 'react';
import { playlistsApi, Playlist, PlaylistItem, MediaItem } from '@/lib/api/playlists';

export function usePlaylists(publishedOnly = false) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlaylists();
  }, [publishedOnly]);

  const loadPlaylists = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await playlistsApi.getPlaylists(publishedOnly);
      setPlaylists(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async (data: Partial<Playlist>) => {
    try {
      const newPlaylist = await playlistsApi.createPlaylist(data);
      setPlaylists([...playlists, newPlaylist]);
      return newPlaylist;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create playlist');
      throw err;
    }
  };

  const saveDraft = async (data: Partial<Playlist>) => {
    try {
      const draft = await playlistsApi.saveDraft(data);
      setPlaylists([...playlists, draft]);
      return draft;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save draft');
      throw err;
    }
  };

  const updatePlaylist = async (id: string, data: Partial<Playlist>) => {
    try {
      const updated = await playlistsApi.updatePlaylist(id, data);
      setPlaylists(playlists.map((p) => (p.id === id ? updated : p)));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update playlist');
      throw err;
    }
  };

  const deletePlaylist = async (id: string) => {
    try {
      await playlistsApi.deletePlaylist(id);
      setPlaylists(playlists.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete playlist');
      throw err;
    }
  };

  const publishPlaylist = async (id: string) => {
    try {
      const published = await playlistsApi.publishPlaylist(id);
      setPlaylists(playlists.map((p) => (p.id === id ? published : p)));
      return published;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish playlist');
      throw err;
    }
  };

  return {
    playlists,
    loading,
    error,
    reload: loadPlaylists,
    createPlaylist,
    saveDraft,
    updatePlaylist,
    deletePlaylist,
    publishPlaylist,
  };
}

export function usePlaylist(playlistId: string) {
  const [playlist, setPlaylist] = useState<(Playlist & { items: PlaylistItem[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (playlistId) {
      loadPlaylist();
    }
  }, [playlistId]);

  const loadPlaylist = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await playlistsApi.getPlaylist(playlistId);
      setPlaylist(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };

  return { playlist, loading, error, reload: loadPlaylist };
}

export function useMediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await playlistsApi.getMediaLibrary();
      setMedia(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load media library');
    } finally {
      setLoading(false);
    }
  };

  return { media, loading, error, reload: loadMedia };
}

export function usePlaylistItems(playlistId: string) {
  const [items, setItems] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (playlistId) {
      loadItems();
    }
  }, [playlistId]);

  const loadItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await playlistsApi.getPlaylistItems(playlistId);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (mediaId: string, duration: number) => {
    try {
      const newItem = await playlistsApi.addPlaylistItem(playlistId, mediaId, duration);
      setItems([...items, newItem]);
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
      throw err;
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await playlistsApi.removePlaylistItem(playlistId, itemId);
      setItems(items.filter((i) => i.id !== itemId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item');
      throw err;
    }
  };

  const reorderItems = async (itemOrders: Record<string, number>) => {
    try {
      await playlistsApi.reorderPlaylistItems(playlistId, itemOrders);
      // Reload to get correct order
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder items');
      throw err;
    }
  };

  const clearItems = async () => {
    try {
      await playlistsApi.clearPlaylistItems(playlistId);
      setItems([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear items');
      throw err;
    }
  };

  return {
    items,
    loading,
    error,
    reload: loadItems,
    addItem,
    removeItem,
    reorderItems,
    clearItems,
  };
}
