import { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Play, Disc3, X, Clock, Trash2, AlertCircle } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { useSearchEngine, SearchFilter } from '../hooks/useSearchEngine';
import { AuralLogo } from '../components/shared/AuralLogo';
import { Track, Artist, Album } from '../types';
import { Link, useNavigate } from 'react-router-dom';

export function SearchPage() {
  const {
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
  } = useSearchEngine();

  const { playTrack } = usePlayerStore();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const hasResults = results.tracks.length > 0 || results.artists.length > 0 || results.albums.length > 0;
  const showHistory = !query.trim() && !focused && history.length > 0;

  const filters: { key: SearchFilter; label: string }[] = [
    { key: 'all', label: 'Todo' },
    { key: 'tracks', label: 'Canciones' },
    { key: 'artists', label: 'Artistas' },
    { key: 'albums', label: 'Álbumes' },
  ];

  // ─── Atajos de teclado ─────────────────────────────────
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // "/" enfoca el input
    if (e.key === '/' && document.activeElement !== inputRef.current) {
      e.preventDefault();
      inputRef.current?.focus();
      return;
    }

    // Solo procesar si el input está enfocado
    if (document.activeElement !== inputRef.current) return;

    if (e.key === 'Escape') {
      if (query) {
        setQuery('');
      } else {
        inputRef.current?.blur();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectNext();
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectPrev();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const flat = getFlatResults();
      if (selectedIndex >= 0 && selectedIndex < flat.length) {
        const selected = flat[selectedIndex];
        if (selected.type === 'track') {
          playTrack(selected.data as Track, results.tracks);
        } else if (selected.type === 'artist') {
          navigate(`/artist/${(selected.data as Artist).id}`);
        } else if (selected.type === 'album') {
          navigate(`/playlist/${(selected.data as Album).id}`);
        }
      } else if (flat.length > 0) {
        // Reproducir el primer resultado
        const first = flat[0];
        if (first.type === 'track') {
          playTrack(first.data as Track, results.tracks);
        } else if (first.type === 'artist') {
          navigate(`/artist/${(first.data as Artist).id}`);
        } else if (first.type === 'album') {
          navigate(`/playlist/${(first.data as Album).id}`);
        }
      }
      return;
    }
  }, [query, selectedIndex, getFlatResults, results.tracks, playTrack, navigate, setQuery, selectNext, selectPrev]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ─── Render helpers ────────────────────────────────────
  const renderTrackItem = (track: Track, i: number, isSelected: boolean) => (
    <motion.button
      key={track.id}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.03 }}
      onClick={() => playTrack(track, results.tracks)}
      className={`w-full flex items-center gap-2.5 md:gap-3 p-2 rounded-lg transition-colors group text-left ${
        isSelected ? 'bg-[#7C3AED]/10 ring-1 ring-[#7C3AED]/30' : 'hover:bg-[#1E1E26] active:bg-[#1E1E26]'
      }`}
    >
      <div className="relative w-10 h-10 md:w-11 md:h-11 shrink-0">
        <img src={track.cover} alt={track.title} className="w-full h-full rounded object-cover" />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
          <Play className="w-4 h-4 text-white fill-white" strokeWidth={1.75} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate text-[#F5F5F7]">{track.title}</p>
        <p className="text-xs text-[#8B8B96] truncate">{track.artist} · {track.album}</p>
      </div>
      <span className="text-xs text-[#8B8B96] font-mono shrink-0">
        {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
      </span>
    </motion.button>
  );

  const renderArtistItem = (artist: Artist, isSelected: boolean) => (
    <motion.div
      key={artist.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={isSelected ? 'ring-2 ring-[#7C3AED] rounded-xl' : ''}
    >
      <Link to={`/artist/${artist.id}`} className="group cursor-pointer block">
        <img src={artist.image} alt="" className="w-full aspect-square rounded-full object-cover shadow-lg mb-1.5 md:mb-2 ring-1 ring-[#2A2A35]" />
        <p className="text-xs sm:text-sm font-medium text-center truncate text-[#F5F5F7]">{artist.name}</p>
        <p className="text-[10px] sm:text-xs text-[#8B8B96] text-center">Artista</p>
      </Link>
    </motion.div>
  );

  const renderAlbumItem = (album: Album, isSelected: boolean) => (
    <motion.div
      key={album.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group cursor-pointer ${isSelected ? 'ring-2 ring-[#7C3AED] rounded-xl' : ''}`}
    >
      <Link to={`/playlist/${album.id}`}>
        <div className="relative mb-2">
          <img src={album.cover} alt={album.title} className="w-full aspect-square rounded-xl object-cover shadow-lg ring-1 ring-[#2A2A35]" />
          <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full gradient-aura-glow flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <Disc3 className="w-5 h-5 text-white" strokeWidth={1.75} />
          </div>
        </div>
        <p className="text-sm font-medium truncate text-[#F5F5F7]">{album.title}</p>
        <p className="text-xs text-[#8B8B96] truncate">{album.artist} · {album.year}</p>
      </Link>
    </motion.div>
  );

  // Calcular índices seleccionados por sección
  const getSelectedInfo = () => {
    if (selectedIndex < 0) return { trackIdx: -1, artistIdx: -1, albumIdx: -1 };
    const flat = getFlatResults();
    const selected = flat[selectedIndex];
    if (!selected) return { trackIdx: -1, artistIdx: -1, albumIdx: -1 };

    let trackIdx = -1, artistIdx = -1, albumIdx = -1;
    if (selected.type === 'track') {
      trackIdx = results.tracks.indexOf(selected.data as Track);
    } else if (selected.type === 'artist') {
      artistIdx = results.artists.indexOf(selected.data as Artist);
    } else if (selected.type === 'album') {
      albumIdx = results.albums.indexOf(selected.data as Album);
    }
    return { trackIdx, artistIdx, albumIdx };
  };

  const selectedInfo = getSelectedInfo();

  // ─── Render ────────────────────────────────────────────
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      {/* Input */}
      <div className="relative mb-5 md:mb-6 max-w-lg">
        <SearchIcon className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B8B96]" strokeWidth={1.75} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Buscar por título, artista o álbum..."
          autoFocus
          className="w-full pl-10 md:pl-11 pr-10 py-2.5 md:py-3 rounded-xl bg-[#131318] border border-[#2A2A35] text-sm md:text-base text-[#F5F5F7] placeholder:text-[#8B8B96] focus:outline-none focus:border-[#7C3AED]/50 focus:bg-[#1E1E26] transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); clearSelection(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-[#2A2A35] transition-colors"
          >
            <X className="w-4 h-4 text-[#8B8B96]" strokeWidth={1.75} />
          </button>
        )}
      </div>

      {/* Historial de búsquedas */}
      {showHistory && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[#8B8B96] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
              Búsquedas recientes
            </h3>
            <button
              onClick={clearHistory}
              className="text-xs text-[#8B8B96] hover:text-[#F5F5F7] flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" strokeWidth={1.75} />
              Limpiar
            </button>
          </div>
          <div className="space-y-0.5">
            {history.map((entry) => (
              <div
                key={entry.query + entry.timestamp}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#1E1E26] transition-colors group"
              >
                <button
                  onClick={() => setQuery(entry.query)}
                  className="flex items-center gap-2.5 flex-1 text-left"
                >
                  <Clock className="w-3.5 h-3.5 text-[#8B8B96] shrink-0" strokeWidth={1.75} />
                  <span className="text-sm text-[#F5F5F7]">{entry.query}</span>
                </button>
                <button
                  onClick={() => removeFromHistory(entry.query)}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[#2A2A35] transition-all"
                >
                  <X className="w-3 h-3 text-[#8B8B96]" strokeWidth={1.75} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      {hasSearched && hasResults && (
        <div className="flex gap-2 mb-3 md:mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); clearSelection(); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === f.key
                  ? 'bg-[#F5F5F7] text-[#08080C]'
                  : 'bg-[#131318] text-[#8B8B96] border border-[#2A2A35] hover:bg-[#1E1E26] hover:text-[#F5F5F7]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Nota explicativa */}
      {hasSearched && hasResults && filter === 'all' && (
        <p className="text-xs text-[#8B8B96] mb-4 md:mb-5">
          Mostrando resultados organizados por categoría
        </p>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-4">
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <div className="w-10 h-10 bg-[#131318] rounded animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-48 bg-[#131318] rounded animate-pulse mb-1" />
                  <div className="h-3 w-32 bg-[#131318] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="text-center py-16">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" strokeWidth={1.75} />
            </div>
          </div>
          <p className="text-[#F5F5F7] font-medium mb-1">Algo se desafinó</p>
          <p className="text-sm text-[#8B8B96] mb-4">Intenta de nuevo.</p>
          <button
            onClick={retry}
            className="px-5 py-2 rounded-full bg-[#7C3AED] text-white text-sm font-medium hover:bg-[#6D28D9] transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Results */}
      {!loading && !error && hasSearched && (
        <div className="space-y-6">
          {/* Sin resultados */}
          {!hasResults && (
            <div className="text-center py-16">
              <div className="flex justify-center mb-4 opacity-30">
                <AuralLogo size={48} />
              </div>
              <p className="text-[#8B8B96]">No encontramos eso.</p>
              <p className="text-sm text-[#8B8B96]/60 mt-1">Prueba con otra cosa.</p>
            </div>
          )}

          {/* Canciones */}
          {results.tracks.length > 0 && (filter === 'all' || filter === 'tracks') && (
            <section>
              <h2 className="text-base sm:text-lg font-semibold mb-2 md:mb-3 text-[#F5F5F7]">
                Canciones
                {filter === 'all' ? (
                  <span className="text-sm text-[#8B8B96] font-normal ml-2">({results.tracks.length})</span>
                ) : (
                  <span className="text-sm text-[#8B8B96] font-normal ml-2">con "{query}" en el título</span>
                )}
              </h2>
              <div className="space-y-0.5 md:space-y-1">
                {results.tracks.map((track, i) =>
                  renderTrackItem(track, i, selectedInfo.trackIdx === i)
                )}
              </div>
            </section>
          )}

          {/* Artistas */}
          {results.artists.length > 0 && (filter === 'all' || filter === 'artists') && (
            <section>
              <h2 className="text-base sm:text-lg font-semibold mb-2 md:mb-3 text-[#F5F5F7]">
                Artistas
                {filter === 'all' ? (
                  <span className="text-sm text-[#8B8B96] font-normal ml-2">({results.artists.length})</span>
                ) : (
                  <span className="text-sm text-[#8B8B96] font-normal ml-2">con "{query}" en el nombre</span>
                )}
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
                {results.artists.map((artist) =>
                  renderArtistItem(artist, selectedInfo.artistIdx === results.artists.indexOf(artist))
                )}
              </div>
            </section>
          )}

          {/* Álbumes */}
          {results.albums.length > 0 && (filter === 'all' || filter === 'albums') && (
            <section>
              <h2 className="text-base sm:text-lg font-semibold mb-2 md:mb-3 text-[#F5F5F7]">
                Álbumes
                {filter === 'all' ? (
                  <span className="text-sm text-[#8B8B96] font-normal ml-2">({results.albums.length})</span>
                ) : (
                  <span className="text-sm text-[#8B8B96] font-normal ml-2">con "{query}" en el título</span>
                )}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {results.albums.map((album) =>
                  renderAlbumItem(album, selectedInfo.albumIdx === results.albums.indexOf(album))
                )}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Empty state - sin búsqueda */}
      {!loading && !error && !hasSearched && !showHistory && (
        <div className="text-center py-16">
          <div className="flex justify-center mb-4 opacity-30">
            <AuralLogo size={48} />
          </div>
          <p className="text-[#8B8B96]">Empieza a buscar</p>
          <p className="text-sm text-[#8B8B96]/60 mt-1">Descubre música nueva en Aural</p>
        </div>
      )}

      {/* Hint de atajos (solo desktop) */}
      {!loading && !hasSearched && !showHistory && (
        <div className="hidden md:flex justify-center mt-6 gap-4 text-xs text-[#8B8B96]/50">
          <span><kbd className="px-1.5 py-0.5 rounded bg-[#131318] border border-[#2A2A35] text-[#8B8B96]">/</kbd> para buscar</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-[#131318] border border-[#2A2A35] text-[#8B8B96]">↑↓</kbd> navegar</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-[#131318] border border-[#2A2A35] text-[#8B8B96]">Enter</kbd> reproducir</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-[#131318] border border-[#2A2A35] text-[#8B8B96]">Esc</kbd> limpiar</span>
        </div>
      )}
    </motion.div>
  );
}
