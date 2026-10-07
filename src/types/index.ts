export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  albumId: string;
  duration: number;
  cover: string;
  audioUrl: string;
  liked: boolean;
  playCount: number;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  cover: string;
  year: number;
  tracks: string[];
  type: 'album' | 'single' | 'ep';
}

export interface Artist {
  id: string;
  name: string;
  image: string;
  genre: string;
  monthlyListeners: number;
  verified: boolean;
  albums: string[];
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  cover: string;
  owner: string;
  tracks: string[];
  duration: number;
  isPublic: boolean;
  createdAt: string;
}

export interface Genre {
  id: string;
  name: string;
  color: string;
  image: string;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  showQueue: boolean;
  showLyrics: boolean;
  shuffleHistory: string[];
}
