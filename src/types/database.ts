export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Playlist {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  is_public: boolean;
  created_at: string;
}

export interface PlaylistTrack {
  playlist_id: string;
  track_id: string;
  position: number;
  added_at: string;
}

export interface UserLike {
  user_id: string;
  track_id: string;
  liked_at: string;
}

export interface ListeningHistory {
  id: string;
  user_id: string;
  track_id: string;
  played_at: string;
}

export interface FollowedArtist {
  id: string;
  user_id: string;
  artist_id: string;
  artist_name: string;
  artist_image: string;
  followed_at: string;
}

export interface PlayerState {
  user_id: string;
  current_track_id: string | null;
  queue: string[];
  queue_index: number;
  volume: number;
  is_muted: boolean;
  shuffle: boolean;
  repeat_mode: 'off' | 'all' | 'one';
  updated_at: string;
}
