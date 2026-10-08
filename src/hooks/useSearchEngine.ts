import { useState, useEffect, useRef, useCallback } from 'react';
import { searchAllUnified } from '../lib/jamendo';
import { jamendoTracksToTracks } from '../lib/adapters';
import { Track, Artist, Album } from '../types';
import { useDebounce } from './useDebounce';

// ─── Tipos ───────────────────────────────────────────────
export type SearchFilter = 'all' | 'tracks' | 'artists' | 'albums';

export interface SearchResult {
  tracks: Track[];
  artists: Artist[];
  albums: Album[];
}

export interface SearchHistoryEntry {
  query: string;
  timestamp: number;
}

interface SearchEngineState {
  query: string;
  filter: SearchFilter;
  results: SearchResult;
  loading: boolean;
  error: boolean;
  hasSearched: boolean;
  history: SearchHistoryEntry[];
  selectedIndex: number;
  focused: boolean;
}

interface SearchEngineActions {
  setQuery: (q: string) => void;
  setFilter: (f: SearchFilter) => void;
  setFocused: (f: boolean) => void;
  retry: () => void;
  clearHistory: () => void;
  removeFromHistory: (query: string) => void;
  selectNext: () => void;
  selectPrev: () => void;
  clearSelection: () => void;
  getFlatResults: () => Array<{ type: 'track' | 'artist' | 'album'; data: Track | Artist | Album }>;
}

// ─── Constantes ──────────────────────────────────────────
const HISTORY_KEY = 'aural_search_history';
const MAX_HISTORY = 10;
const MAX_CACHE = 20;
const DEBOUNCE_MS = 300;

// ─── Normalización ───────────────────────────────────────
function normalizeQuery(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // sin tildes
    .replace(/\s+/g, ' ')            // sin espacios extra
    .trim();
}

// ─── Caché en memoria ────────────────────────────────────
const searchCache = new Map<string, SearchResult>();

function getCached(query: string): SearchResult | null {
  return searchCache.get(query) || null;
}

function setCache(query: string, result: SearchResult): void {
  if (searchCache.size >= MAX_CACHE) {
    const firstKey = searchCache.keys().next().value;
    if (firstKey !== undefined) {
      searchCache.delete(firstKey);
    }
  }
  searchCache.set(query, result);
}

// ─── Historial localStorage ──────────────────────────────
function loadHistory(): SearchHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SearchHistoryEntry[];
  } catch {
    return [];
  }
}

function saveHistory(history: SearchHistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // localStorage no disponible
  }
}

function addToHistory(query: string): SearchHistoryEntry[] {
  const history = loadHistory().filter(h => h.query !== query);
  history.unshift({ query, timestamp: Date.now() });
  const trimmed = history.slice(0, MAX_HISTORY);
  saveHistory(trimmed);
  return trimmed;
}

// ─── Extracción de artistas y álbumes únicos ─────────────
function extractUniqueArtists(tracks: Track[]): Artist[] {
  const seen = new Map<string, Artist>();
  for (const track of tracks) {
    const key = track.artistId;
    if (!seen.has(key)) {
      seen.set(key, {
        id: track.artistId,
        name: track.artist,
        image: track.cover,
        genre: 'Various',
        monthlyListeners: 0,
        verified: false,
        albums: [],
      });
    }
  }
  return Array.from(seen.values());
}

function extractUniqueAlbums(tracks: Track[]): Album[] {
  const seen = new Map<string, Album>();
  for (const track of tracks) {
    const key = track.albumId;
    if (!seen.has(key)) {
      seen.set(key, {
        id: track.albumId,
        title: track.album,
        artist: track.artist,
        artistId: track.artistId,
        cover: track.cover,
        year: new Date().getFullYear(),
        tracks: [],
        type: 'album',
      });
    }
  }
  return Array.from(seen.values());
}

// ─── Filtrado por categoría ──────────────────────────────
function filterResults(rawTracks: Track[], normalizedQuery: string): SearchResult {
  const nq = normalizedQuery;

  const filteredTracks = rawTracks.filter(t =>
    t.title.toLowerCase().includes(nq)
  );

  const allArtists = extractUniqueArtists(rawTracks);
  const filteredArtists = allArtists.filter(a =>
    a.name.toLowerCase().includes(nq)
  );

  const allAlbums = extractUniqueAlbums(rawTracks);
  const filteredAlbums = allAlbums.filter(al =>
    al.title.toLowerCase().includes(nq)
  );

  return {
    tracks: filteredTracks,
    artists: filteredArtists,
    albums: filteredAlbums,
  };
}

// ─── Hook principal ──────────────────────────────────────
export function useSearchEngine(): SearchEngineState & SearchEngineActions {
  const [query, setQueryRaw] = useState('');
  const [filter, setFilter] = useState<SearchFilter>('all');
  const [results, setResults] = useState<SearchResult>({ tracks: [], artists: [], albums: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [history, setHistory] = useState<SearchHistoryEntry[]>(loadHistory);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [focused, setFocused] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastQueryRef = useRef<string>('');
  const debouncedQuery = useDebounce(query, DEBOUNCE_MS);

  // Ejecutar búsqueda
  const executeSearch = useCallback(async (searchQuery: string) => {
    const normalized = normalizeQuery(searchQuery);

    if (!normalized) {
      setResults({ tracks: [], artists: [], albums: [] });
      setHasSearched(false);
      setError(false);
      return;
    }

    // Cancelar petición anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Revisar caché
    const cached = getCached(normalized);
    if (cached) {
      setResults(cached);
      setHasSearched(true);
      setError(false);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    lastQueryRef.current = normalized;

    try {
      setLoading(true);
      setError(false);
      setHasSearched(true);

      const rawJamendoTracks = await searchAllUnified(searchQuery, 200, controller.signal);
      const rawTracks = jamendoTracksToTracks(rawJamendoTracks);
      const filtered = filterResults(rawTracks, normalized);

      // Solo actualizar si no fue cancelada
      if (lastQueryRef.current === normalized) {
        setCache(normalized, filtered);
        setResults(filtered);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return; // Petición cancelada, ignorar
      }
      console.error('Search error:', err);
      if (lastQueryRef.current === normalized) {
        setError(true);
      }
    } finally {
      if (lastQueryRef.current === normalized) {
        setLoading(false);
      }
    }
  }, []);

  // Ejecutar cuando cambia el query debounced
  useEffect(() => {
    executeSearch(debouncedQuery);
  }, [debouncedQuery, executeSearch]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Guardar en historial cuando hay resultados
  useEffect(() => {
    const normalized = normalizeQuery(debouncedQuery);
    if (normalized && hasSearched && !loading && !error) {
      const hasAnyResult = results.tracks.length > 0 || results.artists.length > 0 || results.albums.length > 0;
      if (hasAnyResult) {
        const updated = addToHistory(normalized);
        setHistory(updated);
      }
    }
  }, [hasSearched, loading, error, debouncedQuery, results]);

  // Acciones
  const setQuery = useCallback((q: string) => {
    setQueryRaw(q);
    setSelectedIndex(-1);
  }, []);

  const retry = useCallback(() => {
    setError(false);
    executeSearch(debouncedQuery);
  }, [debouncedQuery, executeSearch]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  const removeFromHistory = useCallback((q: string) => {
    const updated = history.filter(h => h.query !== q);
    setHistory(updated);
    saveHistory(updated);
  }, [history]);

  const getFlatResults = useCallback((): Array<{ type: 'track' | 'artist' | 'album'; data: Track | Artist | Album }> => {
    const flat: Array<{ type: 'track' | 'artist' | 'album'; data: Track | Artist | Album }> = [];
    if (filter === 'all' || filter === 'tracks') {
      results.tracks.forEach(t => flat.push({ type: 'track', data: t }));
    }
    if (filter === 'all' || filter === 'artists') {
      results.artists.forEach(a => flat.push({ type: 'artist', data: a }));
    }
    if (filter === 'all' || filter === 'albums') {
      results.albums.forEach(al => flat.push({ type: 'album', data: al }));
    }
    return flat;
  }, [results, filter]);

  const selectNext = useCallback(() => {
    const flat = getFlatResults();
    if (flat.length === 0) return;
    setSelectedIndex(prev => (prev + 1) % flat.length);
  }, [getFlatResults]);

  const selectPrev = useCallback(() => {
    const flat = getFlatResults();
    if (flat.length === 0) return;
    setSelectedIndex(prev => (prev - 1 + flat.length) % flat.length);
  }, [getFlatResults]);

  const clearSelection = useCallback(() => {
    setSelectedIndex(-1);
  }, []);

  return {
    query,
    filter,
    results,
    loading,
    error,
    hasSearched,
    history,
    selectedIndex,
    focused,
    setQuery,
    setFilter,
    setFocused,
    retry,
    clearHistory,
    removeFromHistory,
    selectNext,
    selectPrev,
    clearSelection,
    getFlatResults,
  };
}
