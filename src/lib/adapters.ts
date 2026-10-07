import { JamendoTrack, JamendoArtist, JamendoAlbum } from '../types/jamendo';
import { Track, Artist, Album } from '../types';

// Función para decodificar entidades HTML
function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

// Función para limpiar y formatear títulos
function cleanTitle(title: string): string {
  // Decodificar entidades HTML
  let cleaned = decodeHtmlEntities(title);
  
  // Remover prefijos numéricos como "12_", "00000006", etc.
  cleaned = cleaned.replace(/^\d+_/, '');
  cleaned = cleaned.replace(/^0+/, '');
  
  // Remover nombres de artistas del título (patrón: "Artista - Título")
  const dashMatch = cleaned.match(/^(.+?)\s*-\s*(.+)$/);
  if (dashMatch) {
    // Si hay un guión, asumir que la segunda parte es el título real
    cleaned = dashMatch[2].trim();
  }
  
  // Capitalización Title Case
  cleaned = cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
  
  // Corregir typos comunes
  cleaned = cleaned.replace(/\bLets\b/g, "Let's");
  
  return cleaned.trim();
}

// Función para limpiar y formatear nombres de artistas
function cleanArtistName(name: string): string {
  let cleaned = decodeHtmlEntities(name);
  // Capitalización Title Case
  cleaned = cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
  return cleaned.trim();
}

export function jamendoTrackToTrack(jTrack: JamendoTrack): Track {
  return {
    id: `jamendo-${jTrack.id}`,
    title: cleanTitle(jTrack.name),
    artist: cleanArtistName(jTrack.artist_name),
    artistId: `jamendo-artist-${jTrack.artist_id}`,
    album: cleanTitle(jTrack.album_name || 'Single'),
    albumId: `jamendo-album-${jTrack.album_id || 'single'}`,
    duration: jTrack.duration || 0,
    cover: jTrack.image || jTrack.album_image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    audioUrl: jTrack.audio,
    liked: false,
    playCount: 0,
  };
}

export function jamendoArtistToArtist(jArtist: JamendoArtist): Artist {
  // Usar un placeholder musical genérico en lugar de una foto aleatoria
  const defaultArtistImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI3BhaW50MCkiLz4KPGNpcmNsZSBjeD0iMjAwIiBjeT0iMjAwIiByPSI4MCIgZmlsbD0iIzFDNUMzNSIgc3Ryb2tlPSIjN0MzQUVEIiBzdHJva2Utd2lkdGg9IjQiLz4KPGNpcmNsZSBjeD0iMjAwIiBjeT0iMjAwIiByPSIzMCIgZmlsbD0iIzdDM0FFRCIvPgo8cGF0aCBkPSJNMjAwIDEyMCBMMjAwIDIwMCIgc3Ryb2tlPSIjN0MzQUVEIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDAiIHgxPSIwIiB5MT0iMCIgeDI9IjQwMCIgeTI9IjQwMCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjMUMxQzI1Ii8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzBBMEExMiIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPgo=';
  
  return {
    id: `jamendo-artist-${jArtist.id}`,
    name: cleanArtistName(jArtist.name),
    image: jArtist.image || defaultArtistImage,
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
    title: cleanTitle(jAlbum.name),
    artist: cleanArtistName(jAlbum.artist_name),
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
