import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Track, Artist } from '../types';
import { isJamendoApiAvailable } from './jamendo';
import { tracks, artists } from './mockData';

// Alias para claridad
const mockTracks = tracks;
const mockArtists = artists;

interface UseAuralDataOptions<T> {
  fetchFn: () => Promise<T[]>;
  fallbackData: T[];
  showErrorToast?: boolean;
}

export function useAuralData<T>({ fetchFn, fallbackData, showErrorToast = true }: UseAuralDataOptions<T>) {
  const [data, setData] = useState<T[]>(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        // Si la API ya está marcada como no disponible, usar fallback directamente
        if (!isJamendoApiAvailable()) {
          if (!cancelled) {
            setData(fallbackData);
            setUsingFallback(true);
            setLoading(false);
          }
          return;
        }

        const result = await fetchFn();
        
        if (!cancelled) {
          // Si el resultado está vacío y tenemos fallback, usar fallback
          if (result.length === 0 && fallbackData.length > 0) {
            setData(fallbackData);
            setUsingFallback(true);
          } else {
            setData(result);
            setUsingFallback(false);
          }
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching data:', err);
          setError(err as Error);
          
          // Usar fallback en caso de error
          if (fallbackData.length > 0) {
            setData(fallbackData);
            setUsingFallback(true);
          }
          
          if (showErrorToast) {
            toast.error('Algo se desafinó. Mostrando contenido de demostración.');
          }
          
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error, usingFallback };
}

// Hooks específicos para cada tipo de dato
export function usePopularTracks(limit = 20) {
  return useAuralData<Track>({
    fetchFn: async () => {
      const { getPopularTracks } = await import('./jamendo');
      const { jamendoTracksToTracks } = await import('./adapters');
      const tracks = await getPopularTracks(limit);
      return jamendoTracksToTracks(tracks);
    },
    fallbackData: mockTracks.slice(0, limit),
  });
}

export function usePopularArtists(limit = 20) {
  return useAuralData<Artist>({
    fetchFn: async () => {
      const { getPopularArtists } = await import('./jamendo');
      const { jamendoArtistsToArtists } = await import('./adapters');
      const artists = await getPopularArtists(limit);
      return jamendoArtistsToArtists(artists);
    },
    fallbackData: mockArtists.slice(0, limit),
  });
}

export function useArtistData(artistId: string) {
  return useAuralData<Track>({
    fetchFn: async () => {
      if (!artistId) return [];
      
      const { getTracksByArtist, getPopularArtists } = await import('./jamendo');
      const { jamendoTracksToTracks, jamendoArtistsToArtists } = await import('./adapters');
      
      // Extraer ID real de Jamendo
      const jamendoArtistId = artistId.replace('jamendo-artist-', '');
      
      const [tracks, allArtists] = await Promise.all([
        getTracksByArtist(jamendoArtistId, 20),
        getPopularArtists(10)
      ]);
      
      return jamendoTracksToTracks(tracks);
    },
    fallbackData: mockTracks.filter(t => t.artistId === artistId).slice(0, 10),
    showErrorToast: false,
  });
}

export function usePlaylistData(playlistId: string) {
  // Mapeo de playlists a tags
  const playlistTagMap: Record<string, string> = {
    'p1': 'chill',
    'p2': 'electronic',
    'p3': 'indie',
    'p4': 'ambient',
    'p5': 'rock',
    'p6': 'acoustic',
  };

  return useAuralData<Track>({
    fetchFn: async () => {
      if (!playlistId) return [];
      
      const { getTracksByTag, getPopularTracks } = await import('./jamendo');
      const { jamendoTracksToTracks } = await import('./adapters');
      
      const tag = playlistTagMap[playlistId];
      const tracks = tag 
        ? await getTracksByTag(tag, 20)
        : await getPopularTracks(20);
      
      return jamendoTracksToTracks(tracks);
    },
    fallbackData: mockTracks.slice(0, 15),
    showErrorToast: false,
  });
}

export function useSearchTracks(query: string, limit = 20) {
  const [data, setData] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setData([]);
      return;
    }

    let cancelled = false;
    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        
        if (!isJamendoApiAvailable()) {
          // Fallback: filtrar datos mock
          const q = query.toLowerCase();
          const filtered = mockTracks.filter(t => 
            t.title.toLowerCase().includes(q) || 
            t.artist.toLowerCase().includes(q)
          );
          if (!cancelled) {
            setData(filtered.slice(0, limit));
            setLoading(false);
          }
          return;
        }

        const { searchTracks } = await import('./jamendo');
        const { jamendoTracksToTracks } = await import('./adapters');
        const tracks = await searchTracks(query, limit);
        
        if (!cancelled) {
          if (tracks.length === 0) {
            // Fallback a datos mock filtrados
            const q = query.toLowerCase();
            const filtered = mockTracks.filter(t => 
              t.title.toLowerCase().includes(q) || 
              t.artist.toLowerCase().includes(q)
            );
            setData(filtered.slice(0, limit));
          } else {
            setData(jamendoTracksToTracks(tracks));
          }
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Search error:', err);
          // Fallback a datos mock filtrados
          const q = query.toLowerCase();
          const filtered = mockTracks.filter(t => 
            t.title.toLowerCase().includes(q) || 
            t.artist.toLowerCase().includes(q)
          );
          setData(filtered.slice(0, limit));
          setLoading(false);
        }
      }
    }, 300); // Debounce de 300ms

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [query, limit]);

  return { data, loading };
}
