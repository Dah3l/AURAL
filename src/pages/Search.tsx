import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Play, Music } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { tracks, albums, artists, genres } from '../lib/mockData';
import { useDebounce } from '../hooks/useDebounce';
import { formatNumber } from '../lib/utils';

type Filter = 'all' | 'tracks' | 'albums' | 'artists' | 'playlists';

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
    { key: 'all', label: 'All' },
    { key: 'tracks', label: 'Songs' },
    { key: 'albums', label: 'Albums' },
    { key: 'artists', label: 'Artists' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      {/* Search Input */}
      <div className="relative mb-6 max-w-lg">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs, albums, artists..."
          autoFocus
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all"
        />
      </div>

      {/* Filters */}
      {debouncedQuery && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f.key
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Search Results */}
      {results && (
        <div className="space-y-6">
          {/* Tracks */}
          {(filter === 'all' || filter === 'tracks') && results.tracks.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3">Songs</h2>
              <div className="space-y-1">
                {results.tracks.slice(0, 5).map((track, i) => (
                  <motion.button
                    key={track.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => playTrack(track, results.tracks)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group text-left"
                  >
                    <div className="relative w-10 h-10 shrink-0">
                      <img src={track.cover} alt={track.title} className="w-10 h-10 rounded object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{track.title}</p>
                      <p className="text-xs text-white/50 truncate">{track.artist}</p>
                    </div>
                    <span className="text-xs text-white/40">{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</span>
                  </motion.button>
                ))}
              </div>
            </section>
          )}

          {/* Artists */}
          {(filter === 'all' || filter === 'artists') && results.artists.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3">Artists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.artists.map(artist => (
                  <motion.div
                    key={artist.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group cursor-pointer"
                  >
                    <img src={artist.image} alt={artist.name} className="w-full aspect-square rounded-full object-cover shadow-lg mb-2" />
                    <p className="text-sm font-medium text-center truncate">{artist.name}</p>
                    <p className="text-xs text-white/50 text-center">{formatNumber(artist.monthlyListeners)} listeners</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Albums */}
          {(filter === 'all' || filter === 'albums') && results.albums.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3">Albums</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.albums.map(album => (
                  <motion.div
                    key={album.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group cursor-pointer"
                  >
                    <img src={album.cover} alt={album.title} className="w-full aspect-square rounded-xl object-cover shadow-lg mb-2" />
                    <p className="text-sm font-medium truncate">{album.title}</p>
                    <p className="text-xs text-white/50 truncate">{album.artist}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* No results */}
          {results.tracks.length === 0 && results.artists.length === 0 && results.albums.length === 0 && (
            <div className="text-center py-16">
              <Music className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/50">No results found for "{debouncedQuery}"</p>
            </div>
          )}
        </div>
      )}

      {/* Browse Genres (when no search) */}
      {!debouncedQuery && (
        <div>
          <h2 className="text-xl font-bold mb-4">Browse All</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {genres.map((genre, i) => (
              <motion.div
                key={genre.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="relative h-32 rounded-xl overflow-hidden cursor-pointer group"
                style={{ backgroundColor: genre.color }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/40" />
                <span className="absolute top-3 left-3 text-lg font-bold">{genre.name}</span>
                <img
                  src={genre.image}
                  alt={genre.name}
                  className="absolute bottom-0 right-0 w-20 h-20 object-cover rounded-tl-xl rotate-12 translate-x-4 translate-y-2 group-hover:scale-110 transition-transform"
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
