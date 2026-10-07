import { JamendoTrack, JamendoArtist, JamendoAlbum, JamendoResponse } from '../types/jamendo';

const CLIENT_ID = import.meta.env.VITE_JAMENDO_CLIENT_ID as string;
const USE_PROXY = import.meta.env.VITE_USE_PROXY === 'true';
const BASE_URL = 'https://api.jamendo.com/v3.0';
const PROXY_URL = 'https://corsproxy.io/?url=';

// Flag para rastrear si la API está disponible
let apiAvailable = true;

function buildUrl(endpoint: string, params: Record<string, string> = {}): string {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('client_id', CLIENT_ID);
  url.searchParams.set('format', 'json');
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  const finalUrl = url.toString();
  return USE_PROXY ? `${PROXY_URL}${encodeURIComponent(finalUrl)}` : finalUrl;
}

async function fetchJamendo<T>(endpoint: string, params: Record<string, string> = {}): Promise<T[]> {
  // Si la API ya falló antes, retornar array vacío inmediatamente
  if (!apiAvailable) {
    return [];
  }

  try {
    const url = buildUrl(endpoint, params);
    const response = await fetch(url);
    
    if (!response.ok) {
      // Si es 401, marcar API como no disponible
      if (response.status === 401 || response.status === 403) {
        apiAvailable = false;
        console.warn('Jamendo API no disponible (auth error). Usando datos de demostración.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: JamendoResponse<T> = await response.json();
    
    if (data.headers.status === 'error') {
      throw new Error(data.headers.error_message);
    }
    
    return data.results;
  } catch (error) {
    console.error('Jamendo API error:', error);
    // Marcar como no disponible si hay errores repetidos
    if (error instanceof Error && error.message.includes('401')) {
      apiAvailable = false;
    }
    throw error;
  }
}

// Función para verificar si la API está disponible
export function isJamendoApiAvailable(): boolean {
  return apiAvailable;
}

export async function getPopularTracks(limit = 20): Promise<JamendoTrack[]> {
  return fetchJamendo<JamendoTrack>('/tracks/', {
    limit: limit.toString(),
    order: 'popularity_total',
    include: 'musicinfo',
    audioformat: 'mp32'
  });
}

export async function searchTracks(query: string, limit = 20): Promise<JamendoTrack[]> {
  if (!query.trim()) return [];
  
  return fetchJamendo<JamendoTrack>('/tracks/', {
    limit: limit.toString(),
    search: query,
    include: 'musicinfo',
    audioformat: 'mp32'
  });
}

export async function getTracksByTag(tag: string, limit = 20): Promise<JamendoTrack[]> {
  return fetchJamendo<JamendoTrack>('/tracks/', {
    limit: limit.toString(),
    tags: tag,
    include: 'musicinfo',
    audioformat: 'mp32'
  });
}

export async function getPopularArtists(limit = 20): Promise<JamendoArtist[]> {
  return fetchJamendo<JamendoArtist>('/artists/', {
    limit: limit.toString(),
    order: 'popularity_total'
  });
}

export async function getPopularAlbums(limit = 20): Promise<JamendoAlbum[]> {
  return fetchJamendo<JamendoAlbum>('/albums/', {
    limit: limit.toString(),
    order: 'popularity_total'
  });
}

export async function getTracksByArtist(artistId: string, limit = 20): Promise<JamendoTrack[]> {
  return fetchJamendo<JamendoTrack>('/tracks/', {
    limit: limit.toString(),
    artist_id: artistId,
    include: 'musicinfo',
    audioformat: 'mp32'
  });
}

export async function getAlbumTracks(albumId: string): Promise<JamendoTrack[]> {
  return fetchJamendo<JamendoTrack>('/tracks/', {
    album_id: albumId,
    include: 'musicinfo',
    audioformat: 'mp32'
  });
}
