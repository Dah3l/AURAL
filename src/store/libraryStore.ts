import { create } from 'zustand';
import { Playlist } from '../types';
import { playlists as initialPlaylists } from '../lib/mockData';

interface LibraryStore {
  likedTracks: string[];
  playlists: Playlist[];
  recentlyPlayed: string[];
  toggleLike: (trackId: string) => void;
  isLiked: (trackId: string) => boolean;
  createPlaylist: (title: string, description: string) => void;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  addToRecentlyPlayed: (trackId: string) => void;
}

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  likedTracks: ['t1', 't3', 't5', 't7', 't9', 't11', 't13', 't15', 't17', 't19'],
  playlists: initialPlaylists,
  recentlyPlayed: ['t1', 't3', 't5', 't11', 't15'],

  toggleLike: (trackId) => set(state => {
    const isLiked = state.likedTracks.includes(trackId);
    return {
      likedTracks: isLiked
        ? state.likedTracks.filter(id => id !== trackId)
        : [...state.likedTracks, trackId],
    };
  }),

  isLiked: (trackId) => get().likedTracks.includes(trackId),

  createPlaylist: (title, description) => set(state => ({
    playlists: [...state.playlists, {
      id: `p${Date.now()}`,
      title,
      description,
      cover: '',
      owner: 'You',
      tracks: [],
      duration: 0,
      isPublic: true,
      createdAt: new Date().toISOString().split('T')[0],
    }],
  })),

  deletePlaylist: (id) => set(state => ({
    playlists: state.playlists.filter(p => p.id !== id),
  })),

  addTrackToPlaylist: (playlistId, trackId) => set(state => ({
    playlists: state.playlists.map(p =>
      p.id === playlistId && !p.tracks.includes(trackId)
        ? { ...p, tracks: [...p.tracks, trackId] }
        : p
    ),
  })),

  removeTrackFromPlaylist: (playlistId, trackId) => set(state => ({
    playlists: state.playlists.map(p =>
      p.id === playlistId
        ? { ...p, tracks: p.tracks.filter(t => t !== trackId) }
        : p
    ),
  })),

  addToRecentlyPlayed: (trackId) => set(state => ({
    recentlyPlayed: [trackId, ...state.recentlyPlayed.filter(id => id !== trackId)].slice(0, 20),
  })),
}));
