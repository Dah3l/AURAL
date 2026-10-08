import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';
import type { Playlist, UserLike, ListeningHistory, FollowedArtist, SavedAlbum } from '../types/database';

interface LibraryState {
  // State
  playlists: Playlist[];
  likedTracks: string[];
  recentlyPlayed: string[];
  followedArtists: FollowedArtist[];
  savedAlbums: SavedAlbum[];
  loading: boolean;
  pendingTrackToAdd: string | null; // Track ID waiting to be added to a newly created playlist
  
  // Playlist actions
  fetchPlaylists: () => Promise<void>;
  createPlaylist: (title: string, description?: string, isPublic?: boolean) => Promise<{ error: string | null; playlistId?: string }>;
  updatePlaylist: (id: string, updates: Partial<Pick<Playlist, 'title' | 'description' | 'cover_url' | 'is_public'>>) => Promise<{ error: string | null }>;
  deletePlaylist: (id: string) => Promise<{ error: string | null }>;
  addTrackToPlaylist: (playlistId: string, trackId: string) => Promise<{ error: string | null }>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<{ error: string | null }>;
  getPlaylistTracks: (playlistId: string) => Promise<string[]>;
  setPendingTrackToAdd: (trackId: string | null) => void;
  
  // Likes actions
  fetchLikes: () => Promise<void>;
  toggleLike: (trackId: string) => Promise<void>;
  isLiked: (trackId: string) => boolean;
  
  // History actions
  fetchHistory: () => Promise<void>;
  addToHistory: (trackId: string) => Promise<void>;
  
  // Followed artists actions
  fetchFollowedArtists: () => void;
  toggleFollowArtist: (artistId: string, artistName: string, artistImage: string) => void;
  isFollowed: (artistId: string) => boolean;
  
  // Saved albums actions
  fetchSavedAlbums: () => Promise<void>;
  toggleSaveAlbum: (albumId: string, albumTitle: string, albumCover: string | null, artistName: string) => Promise<void>;
  isAlbumSaved: (albumId: string) => boolean;
}

// Helper para localStorage de artistas seguidos
const FOLLOWED_ARTISTS_KEY = 'aural_followed_artists';

function getStoredFollowedArtists(): FollowedArtist[] {
  try {
    const stored = localStorage.getItem(FOLLOWED_ARTISTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveFollowedArtists(artists: FollowedArtist[]) {
  localStorage.setItem(FOLLOWED_ARTISTS_KEY, JSON.stringify(artists));
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  playlists: [],
  likedTracks: [],
  recentlyPlayed: [],
  followedArtists: [],
  savedAlbums: [],
  loading: false,
  pendingTrackToAdd: null,

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
      console.log('[addTrackToPlaylist] Iniciando...', { playlistId, trackId });
      
      // Verificar si la canción ya existe en la playlist
      const { data: existingTrack, error: checkError } = await supabase
        .from('playlist_tracks')
        .select('track_id')
        .eq('playlist_id', playlistId)
        .eq('track_id', trackId)
        .maybeSingle();

      if (checkError) {
        console.error('[addTrackToPlaylist] Error verificando existencia:', checkError);
      }

      if (existingTrack) {
        console.log('[addTrackToPlaylist] La canción ya existe en la playlist');
        return { error: 'Esta canción ya está en la playlist' };
      }

      // Obtener la posición actual más alta
      const { data: tracks, error: tracksError } = await supabase
        .from('playlist_tracks')
        .select('position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: false })
        .limit(1);

      if (tracksError) {
        console.error('[addTrackToPlaylist] Error obteniendo posiciones:', tracksError);
      }

      const position = tracks && tracks.length > 0 ? tracks[0].position + 1 : 0;
      console.log('[addTrackToPlaylist] Nueva posición:', position);

      const { data: insertData, error: insertError } = await supabase
        .from('playlist_tracks')
        .insert({
          playlist_id: playlistId,
          track_id: trackId,
          position,
        })
        .select();

      if (insertError) {
        console.error('[addTrackToPlaylist] Error insertando:', insertError);
        return { error: insertError.message };
      }

      console.log('[addTrackToPlaylist] Canción añadida exitosamente:', insertData);
      return { error: null };
    } catch (error: any) {
      console.error('[addTrackToPlaylist] Error inesperado:', error);
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
      console.log('[getPlaylistTracks] Obteniendo tracks para playlist:', playlistId);
      
      const { data, error } = await supabase
        .from('playlist_tracks')
        .select('track_id, position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: true });

      if (error) {
        console.error('[getPlaylistTracks] Error:', error);
        return [];
      }

      if (!data) {
        console.log('[getPlaylistTracks] No hay datos');
        return [];
      }

      console.log('[getPlaylistTracks] Tracks encontrados:', data.length, data);
      return data.map(t => t.track_id);
    } catch (error) {
      console.error('[getPlaylistTracks] Error inesperado:', error);
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

  setPendingTrackToAdd: (trackId) => {
    set({ pendingTrackToAdd: trackId });
  },

  // ===== FOLLOWED ARTISTS =====
  
  fetchFollowedArtists: () => {
    const artists = getStoredFollowedArtists();
    set({ followedArtists: artists });
  },

  toggleFollowArtist: (artistId, artistName, artistImage) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const { followedArtists } = get();
    const isCurrentlyFollowed = followedArtists.some(a => a.artist_id === artistId);

    let newFollowedArtists: FollowedArtist[];

    if (isCurrentlyFollowed) {
      // Dejar de seguir
      newFollowedArtists = followedArtists.filter(a => a.artist_id !== artistId);
    } else {
      // Seguir
      const newFollow: FollowedArtist = {
        id: `follow-${Date.now()}`,
        user_id: user.id,
        artist_id: artistId,
        artist_name: artistName,
        artist_image: artistImage,
        followed_at: new Date().toISOString(),
      };
      newFollowedArtists = [newFollow, ...followedArtists];
    }

    // Actualizar estado y persistir
    set({ followedArtists: newFollowedArtists });
    saveFollowedArtists(newFollowedArtists);
  },

  isFollowed: (artistId) => {
    return get().followedArtists.some(a => a.artist_id === artistId);
  },

  // ===== SAVED ALBUMS =====
  
  fetchSavedAlbums: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_albums')
        .select('*')
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });

      if (!error && data) {
        set({ savedAlbums: data });
      }
    } catch (error) {
      console.error('Error fetching saved albums:', error);
    }
  },

  toggleSaveAlbum: async (albumId, albumTitle, albumCover, artistName) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const { savedAlbums } = get();
    const isCurrentlySaved = savedAlbums.some(a => a.album_id === albumId);

    // Optimistic update
    if (isCurrentlySaved) {
      set({ savedAlbums: savedAlbums.filter(a => a.album_id !== albumId) });
    } else {
      const newAlbum: SavedAlbum = {
        id: `saved-${Date.now()}`,
        user_id: user.id,
        album_id: albumId,
        album_title: albumTitle,
        album_cover: albumCover,
        artist_name: artistName,
        saved_at: new Date().toISOString(),
      };
      set({ savedAlbums: [newAlbum, ...savedAlbums] });
    }

    try {
      if (isCurrentlySaved) {
        await supabase
          .from('saved_albums')
          .delete()
          .eq('user_id', user.id)
          .eq('album_id', albumId);
      } else {
        await supabase
          .from('saved_albums')
          .insert({
            user_id: user.id,
            album_id: albumId,
            album_title: albumTitle,
            album_cover: albumCover,
            artist_name: artistName,
          });
      }
    } catch (error) {
      console.error('Error toggling saved album:', error);
      // Revert on error
      if (isCurrentlySaved) {
        const revertedAlbum: SavedAlbum = {
          id: `saved-${Date.now()}`,
          user_id: user.id,
          album_id: albumId,
          album_title: albumTitle,
          album_cover: albumCover,
          artist_name: artistName,
          saved_at: new Date().toISOString(),
        };
        set({ savedAlbums: [revertedAlbum, ...get().savedAlbums] });
      } else {
        set({ savedAlbums: get().savedAlbums.filter(a => a.album_id !== albumId) });
      }
    }
  },

  isAlbumSaved: (albumId) => {
    return get().savedAlbums.some(a => a.album_id === albumId);
  },
}));
