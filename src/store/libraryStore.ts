import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';
import type { Playlist, UserLike, ListeningHistory } from '../types/database';

interface LibraryState {
  // State
  playlists: Playlist[];
  likedTracks: string[];
  recentlyPlayed: string[];
  loading: boolean;
  
  // Playlist actions
  fetchPlaylists: () => Promise<void>;
  createPlaylist: (title: string, description?: string, isPublic?: boolean) => Promise<{ error: string | null; playlistId?: string }>;
  updatePlaylist: (id: string, updates: Partial<Pick<Playlist, 'title' | 'description' | 'cover_url' | 'is_public'>>) => Promise<{ error: string | null }>;
  deletePlaylist: (id: string) => Promise<{ error: string | null }>;
  addTrackToPlaylist: (playlistId: string, trackId: string) => Promise<{ error: string | null }>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<{ error: string | null }>;
  getPlaylistTracks: (playlistId: string) => Promise<string[]>;
  
  // Likes actions
  fetchLikes: () => Promise<void>;
  toggleLike: (trackId: string) => Promise<void>;
  isLiked: (trackId: string) => boolean;
  
  // History actions
  fetchHistory: () => Promise<void>;
  addToHistory: (trackId: string) => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  playlists: [],
  likedTracks: [],
  recentlyPlayed: [],
  loading: false,

  // ===== PLAYLISTS =====
  
  fetchPlaylists: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        set({ playlists: data });
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      set({ loading: false });
    }
  },

  createPlaylist: async (title, description = '', isPublic = false) => {
    const user = useAuthStore.getState().user;
    if (!user) return { error: 'No hay sesión activa' };

    try {
      const { data, error } = await supabase
        .from('playlists')
        .insert({
          user_id: user.id,
          title,
          description,
          is_public: isPublic,
        })
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      if (data) {
        set({ playlists: [data, ...get().playlists] });
        return { error: null, playlistId: data.id };
      }

      return { error: 'Error al crear playlist' };
    } catch (error: any) {
      return { error: error.message || 'Error al crear playlist' };
    }
  },

  updatePlaylist: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('playlists')
        .update(updates)
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      set({
        playlists: get().playlists.map(p =>
          p.id === id ? { ...p, ...updates } : p
        ),
      });

      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Error al actualizar playlist' };
    }
  },

  deletePlaylist: async (id) => {
    try {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      set({ playlists: get().playlists.filter(p => p.id !== id) });
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Error al eliminar playlist' };
    }
  },

  addTrackToPlaylist: async (playlistId, trackId) => {
    try {
      // Obtener la posición actual más alta
      const { data: tracks } = await supabase
        .from('playlist_tracks')
        .select('position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: false })
        .limit(1);

      const position = tracks && tracks.length > 0 ? tracks[0].position + 1 : 0;

      const { error } = await supabase
        .from('playlist_tracks')
        .insert({
          playlist_id: playlistId,
          track_id: trackId,
          position,
        });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Error al añadir canción' };
    }
  },

  removeTrackFromPlaylist: async (playlistId, trackId) => {
    try {
      const { error } = await supabase
        .from('playlist_tracks')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('track_id', trackId);

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Error al eliminar canción' };
    }
  },

  getPlaylistTracks: async (playlistId) => {
    try {
      const { data, error } = await supabase
        .from('playlist_tracks')
        .select('track_id')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: true });

      if (error || !data) {
        return [];
      }

      return data.map(t => t.track_id);
    } catch (error) {
      console.error('Error getting playlist tracks:', error);
      return [];
    }
  },

  // ===== LIKES =====
  
  fetchLikes: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_likes')
        .select('track_id')
        .eq('user_id', user.id);

      if (!error && data) {
        set({ likedTracks: data.map(l => l.track_id) });
      }
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  },

  toggleLike: async (trackId) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const { likedTracks } = get();
    const isCurrentlyLiked = likedTracks.includes(trackId);

    // Optimistic update
    set({
      likedTracks: isCurrentlyLiked
        ? likedTracks.filter(id => id !== trackId)
        : [...likedTracks, trackId],
    });

    try {
      if (isCurrentlyLiked) {
        await supabase
          .from('user_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('track_id', trackId);
      } else {
        await supabase
          .from('user_likes')
          .insert({
            user_id: user.id,
            track_id: trackId,
          });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on error
      set({
        likedTracks: isCurrentlyLiked
          ? [...likedTracks, trackId]
          : likedTracks.filter(id => id !== trackId),
      });
    }
  },

  isLiked: (trackId) => {
    return get().likedTracks.includes(trackId);
  },

  // ===== HISTORY =====
  
  fetchHistory: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('listening_history')
        .select('track_id')
        .eq('user_id', user.id)
        .order('played_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        set({ recentlyPlayed: data.map(h => h.track_id) });
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  },

  addToHistory: async (trackId) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      await supabase
        .from('listening_history')
        .insert({
          user_id: user.id,
          track_id: trackId,
        });

      // Update local state
      set({
        recentlyPlayed: [trackId, ...get().recentlyPlayed.filter(id => id !== trackId)].slice(0, 50),
      });
    } catch (error) {
      console.error('Error adding to history:', error);
    }
  },
}));
