import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Play, Music2 } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { tracks, albums, artists, genres } from '../lib/mockData';
import { useDebounce } from '../hooks/useDebounce';
import { formatNumber } from '../lib/utils';
import { AuralLogo } from '../components/shared/AuralLogo';

type Filter = 'all' | 'tracks' | 'albums' | 'artists';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const { playTrack } = usePlayerStore();
  const debouncedQuery = useDebounce(query, 300);

  const results = useMemo(() => {
    if (!debouncedQuery) return null;
    const q = debouncedQuery.toLowerCase();
    return {
      tracks: tracks.filter(t => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)),
      albums: albums.filter(a => a.title.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q)),
      artists: artists.filter(a => a.name.toLowerCase().includes(q) || a.genre.toLowerCase().includes(q)),
    };
  }, [debouncedQuery]);

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Todo' },
    { key: 'tracks', label: 'Canciones' },
    { key: 'albums', label: 'Álbumes' },
    { key: 'artists', label: 'Artistas' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      {/* Input */}
      <div className="relative mb-6 max-w-lg">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B8B96]" strokeWidth={1.75} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busca canciones, álbumes, artistas..."
          autoFocus
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#131318] border border-[#2A2A35] text-[#F5F5F7] placeholder:text-[#8B8B96] focus:outline-none focus:border-[#7C3AED]/50 focus:bg-[#1E1E26] transition-all"
        />
      </div>

      {/* Filtros */}
      {debouncedQuery && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
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

      {/* Resultados */}
      {results && (
        <div className="space-y-6">
          {results.tracks.length === 0 && results.artists.length === 0 && results.albums.length === 0 && (
            <div className="text-center py-16">
              <div className="flex justify-center mb-4 opacity-30">
                <AuralLogo size={48} />
              </div>
              <p className="text-[#8B8B96]">No encontramos eso.</p>
              <p className="text-sm text-[#8B8B96]/60 mt-1">Prueba con otra cosa.</p>
            </div>
          )}

          {(filter === 'all' || filter === 'tracks') && results.tracks.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 text-[#F5F5F7]">Canciones</h2>
              <div className="space-y-1">
                {results.tracks.slice(0, 5).map((track, i) => (
                  <motion.button
                    key={track.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => playTrack(track, results.tracks)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#1E1E26] transition-colors group text-left"
                  >
                    <div className="relative w-10 h-10 shrink-0">
                      <img src={track.cover} alt={track.title} className="w-10 h-10 rounded object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                        <Play className="w-4 h-4 text-white fill-white" strokeWidth={1.75} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-[#F5F5F7]">{track.title}</p>
                      <p className="text-xs text-[#8B8B96] truncate">{track.artist}</p>
                    </div>
                    <span className="text-xs text-[#8B8B96] font-mono">{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</span>
                  </motion.button>
                ))}
              </div>
            </section>
          )}

          {(filter === 'all' || filter === 'artists') && results.artists.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 text-[#F5F5F7]">Artistas</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.artists.map(artist => (
                  <motion.div
                    key={artist.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group cursor-pointer"
                  >
                    <img src={artist.image} alt={artist.name} className="w-full aspect-square rounded-full object-cover shadow-lg mb-2 ring-1 ring-[#2A2A35]" />
                    <p className="text-sm font-medium text-center truncate text-[#F5F5F7]">{artist.name}</p>
                    <p className="text-xs text-[#8B8B96] text-center">{formatNumber(artist.monthlyListeners)} oyentes</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {(filter === 'all' || filter === 'albums') && results.albums.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 text-[#F5F5F7]">Álbumes</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.albums.map(album => (
                  <motion.div
                    key={album.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group cursor-pointer"
                  >
                    <img src={album.cover} alt={album.title} className="w-full aspect-square rounded-xl object-cover shadow-lg mb-2 ring-1 ring-[#2A2A35]" />
                    <p className="text-sm font-medium truncate text-[#F5F5F7]">{album.title}</p>
                    <p className="text-xs text-[#8B8B96] truncate">{album.artist}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Explorar géneros */}
      {!debouncedQuery && (
        <div>
          <h2 className="text-xl font-semibold mb-4 tracking-tight text-[#F5F5F7]">Explorar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {genres.map((genre, i) => (
              <motion.div
                key={genre.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="relative h-32 rounded-xl overflow-hidden cursor-pointer group ring-1 ring-[#2A2A35]"
                style={{ backgroundColor: genre.color }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/40" />
                <span className="absolute top-3 left-3 text-lg font-bold text-white drop-shadow">{genre.name}</span>
                <img
                  src={genre.image}
                  alt={genre.name}
                  className="absolute bottom-0 right-0 w-20 h-20 object-cover rounded-tl-xl rotate-12 translate-x-4 translate-y-2 group-hover:scale-110 transition-transform duration-300"
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
