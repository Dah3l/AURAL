import { JamendoTrack, JamendoArtist, JamendoAlbum, JamendoResponse } from '../types/jamendo';

const CLIENT_ID = import.meta.env.VITE_JAMENDO_CLIENT_ID as string;
const BASE_URL = 'https://api.jamendo.com/v3.0';

// Lista de proxies CORS para fallback
const CORS_PROXIES = [
  'https://corsproxy.io/?url=',
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/',
];

let currentProxyIndex = 0;
let apiAvailable = true;

function buildDirectUrl(endpoint: string, params: Record<string, string> = {}): string {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('client_id', CLIENT_ID);
  url.searchParams.set('format', 'json');
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  return url.toString();
}

function buildProxyUrl(directUrl: string): string {
  const proxy = CORS_PROXIES[currentProxyIndex];
  return `${proxy}${encodeURIComponent(directUrl)}`;
}

async function fetchWithFallback<T>(url: string): Promise<T> {
  // Intentar directo primero
  try {
    const response = await fetch(url, { 
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (response.ok) {
      return await response.json();
    }
    
    // Si es error de auth, no reintentar
    if (response.status === 401 || response.status === 403) {
      throw new Error(`Auth error: ${response.status}`);
    }
  } catch (error) {
    console.warn('Direct fetch failed, trying proxy...');
  }

  // Intentar con proxies
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    currentProxyIndex = i;
    const proxyUrl = buildProxyUrl(url);
    
    try {
      const response = await fetch(proxyUrl);
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.warn(`Proxy ${i + 1} failed, trying next...`);
      continue;
    }
  }

  throw new Error('All fetch attempts failed');
}

async function fetchJamendo<T>(endpoint: string, params: Record<string, string> = {}): Promise<T[]> {
  if (!apiAvailable) {
    return [];
  }

  try {
    const url = buildDirectUrl(endpoint, params);
    const data = await fetchWithFallback<JamendoResponse<T>>(url);
    
    if (data.headers?.status === 'error') {
      throw new Error(data.headers.error_message);
    }
    
    return data.results || [];
  } catch (error) {
    console.error('Jamendo API error:', error);
    
    // Marcar como no disponible solo si es error de auth
    if (error instanceof Error && (error.message.includes('401') || error.message.includes('403'))) {
      apiAvailable = false;
      console.warn('Jamendo API no disponible. Usando datos de demostración.');
    }
    
    throw error;
  }
}

export function isJamendoApiAvailable(): boolean {
  return apiAvailable;
}

export function resetApiAvailability(): void {
  apiAvailable = true;
  currentProxyIndex = 0;
}

export async function getPopularTracks(limit = 20): Promise<JamendoTrack[]> {
  return fetchJamendo<JamendoTrack>('/tracks/', {
    limit: limit.toString(),
    order: 'popularity_total',
    include: 'musicinfo',
    audioformat: 'mp32',
    imagesize: '300'
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
