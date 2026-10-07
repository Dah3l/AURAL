import { JamendoTrack, JamendoArtist, JamendoAlbum } from '../types/jamendo';
import { Track, Artist, Album } from '../types';

export function jamendoTrackToTrack(jTrack: JamendoTrack): Track {
  return {
    id: `jamendo-${jTrack.id}`,
    title: jTrack.name,
    artist: jTrack.artist_name,
    artistId: `jamendo-artist-${jTrack.artist_id}`,
    album: jTrack.album_name,
    albumId: `jamendo-album-${jTrack.album_id}`,
    duration: jTrack.duration,
    cover: jTrack.image || jTrack.album_image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    audioUrl: jTrack.audio,
    liked: false,
    playCount: 0,
  };
}

export function jamendoArtistToArtist(jArtist: JamendoArtist): Artist {
  return {
    id: `jamendo-artist-${jArtist.id}`,
    name: jArtist.name,
    image: jArtist.image || 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400&h=400&fit=crop',
    genre: 'Various',
    monthlyListeners: 0,
    verified: false,
    albums: [],
  };
}

export function jamendoAlbumToAlbum(jAlbum: JamendoAlbum): Album {
  const year = jAlbum.releasedate ? new Date(jAlbum.releasedate).getFullYear() : 2024;
  return {
    id: `jamendo-album-${jAlbum.id}`,
    title: jAlbum.name,
    artist: jAlbum.artist_name,
    artistId: `jamendo-artist-${jAlbum.artist_id}`,
    cover: jAlbum.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    year,
    tracks: [],
    type: 'album',
  };
}

export function jamendoTracksToTracks(jTracks: JamendoTrack[]): Track[] {
  return jTracks.map(jamendoTrackToTrack);
}

export function jamendoArtistsToArtists(jArtists: JamendoArtist[]): Artist[] {
  return jArtists.map(jamendoArtistToArtist);
}

export function jamendoAlbumsToAlbums(jAlbums: JamendoAlbum[]): Album[] {
  return jAlbums.map(jamendoAlbumToAlbum);
}
