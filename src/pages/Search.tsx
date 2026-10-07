import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Play } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { searchTracks, getPopularArtists } from '../lib/jamendo';
import { jamendoTracksToTracks, jamendoArtistsToArtists } from '../lib/adapters';
import { useDebounce } from '../hooks/useDebounce';
import { formatNumber } from '../lib/utils';
import { AuralLogo } from '../components/shared/AuralLogo';
import { Track, Artist } from '../types';
import { Link } from 'react-router-dom';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const { playTrack } = usePlayerStore();
  const debouncedQuery = useDebounce(query, 300);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    async function search() {
      if (!debouncedQuery.trim()) {
        setTracks([]);
        setArtists([]);
        setHasSearched(false);
        return;
      }

      try {
        setLoading(true);
        setHasSearched(true);
        
        const [trackResults, artistResults] = await Promise.all([
          searchTracks(debouncedQuery, 20),
          getPopularArtists(10)
        ]);
        
        setTracks(jamendoTracksToTracks(trackResults));
        setArtists(jamendoArtistsToArtists(artistResults));
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }

    search();
  }, [debouncedQuery]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      {/* Input */}
      <div className="relative mb-6 max-w-lg">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B8B96]" strokeWidth={1.75} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busca canciones, artistas..."
          autoFocus
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#131318] border border-[#2A2A35] text-[#F5F5F7] placeholder:text-[#8B8B96] focus:outline-none focus:border-[#7C3AED]/50 focus:bg-[#1E1E26] transition-all"
        />
      </div>

      {/* Loading */}
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

      {/* Results */}
      {!loading && hasSearched && (
        <div className="space-y-6">
          {tracks.length === 0 && artists.length === 0 && (
            <div className="text-center py-16">
              <div className="flex justify-center mb-4 opacity-30">
                <AuralLogo size={48} />
              </div>
              <p className="text-[#8B8B96]">No encontramos eso.</p>
              <p className="text-sm text-[#8B8B96]/60 mt-1">Prueba con otra cosa.</p>
            </div>
          )}

          {tracks.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 text-[#F5F5F7]">Canciones</h2>
              <div className="space-y-1">
                {tracks.slice(0, 10).map((track, i) => (
                  <motion.button
                    key={track.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => playTrack(track, tracks)}
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

          {artists.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 text-[#F5F5F7]">Artistas</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {artists.slice(0, 6).map(artist => (
                  <motion.div
                    key={artist.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Link to={`/artist/${artist.id}`} className="group cursor-pointer block">
                      <img src={artist.image} alt={artist.name} className="w-full aspect-square rounded-full object-cover shadow-lg mb-2 ring-1 ring-[#2A2A35]" />
                      <p className="text-sm font-medium text-center truncate text-[#F5F5F7]">{artist.name}</p>
                      <p className="text-xs text-[#8B8B96] text-center">Artista</p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading && !hasSearched && (
        <div className="text-center py-16">
          <div className="flex justify-center mb-4 opacity-30">
            <AuralLogo size={48} />
          </div>
          <p className="text-[#8B8B96]">Empieza a buscar</p>
          <p className="text-sm text-[#8B8B96]/60 mt-1">Descubre música nueva en Aural</p>
        </div>
      )}
    </motion.div>
  );
}
