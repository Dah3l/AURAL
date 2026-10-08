import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Play, Disc3 } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { searchTracks, searchArtists, searchAlbums } from '../lib/jamendo';
import { jamendoTracksToTracks, jamendoArtistsToArtists, jamendoAlbumsToAlbums } from '../lib/adapters';
import { useDebounce } from '../hooks/useDebounce';
import { formatNumber } from '../lib/utils';
import { AuralLogo } from '../components/shared/AuralLogo';
import { Track, Artist, Album } from '../types';
import { Link } from 'react-router-dom';

type SearchFilter = 'all' | 'tracks' | 'artists' | 'albums';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SearchFilter>('all');
  const { playTrack } = usePlayerStore();
  const debouncedQuery = useDebounce(query, 300);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    async function search() {
      if (!debouncedQuery.trim()) {
        setTracks([]);
        setArtists([]);
        setAlbums([]);
        setHasSearched(false);
        return;
      }

      try {
        setLoading(true);
        setHasSearched(true);
        
        const queryLower = debouncedQuery.toLowerCase();
        
        // Búsquedas en paralelo
        const [trackResults, artistResults, albumResults] = await Promise.all([
          searchTracks(debouncedQuery, 30),
          searchArtists(debouncedQuery, 20),
          searchAlbums(debouncedQuery, 20),
        ]);
        
        // Filtrar tracks: solo los que coinciden en el TÍTULO
        const filteredTracks = jamendoTracksToTracks(trackResults).filter(track => 
          track.title.toLowerCase().includes(queryLower)
        );
        
        // Filtrar artistas: solo los que coinciden en el NOMBRE
        const filteredArtists = jamendoArtistsToArtists(artistResults).filter(artist => 
          artist.name.toLowerCase().includes(queryLower)
        );
        
        // Filtrar álbumes: solo los que coinciden en el TÍTULO
        const filteredAlbums = jamendoAlbumsToAlbums(albumResults).filter(album => 
          album.title.toLowerCase().includes(queryLower)
        );
        
        setTracks(filteredTracks);
        setArtists(filteredArtists);
        setAlbums(filteredAlbums);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }

    search();
  }, [debouncedQuery]);

  const hasResults = tracks.length > 0 || artists.length > 0 || albums.length > 0;

  const filters: { key: SearchFilter; label: string }[] = [
    { key: 'all', label: 'Todo' },
    { key: 'tracks', label: 'Canciones' },
    { key: 'artists', label: 'Artistas' },
    { key: 'albums', label: 'Álbumes' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      {/* Input */}
      <div className="relative mb-5 md:mb-6 max-w-lg">
        <SearchIcon className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B8B96]" strokeWidth={1.75} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por título, artista o álbum..."
          autoFocus
          className="w-full pl-10 md:pl-11 pr-4 py-2.5 md:py-3 rounded-xl bg-[#131318] border border-[#2A2A35] text-sm md:text-base text-[#F5F5F7] placeholder:text-[#8B8B96] focus:outline-none focus:border-[#7C3AED]/50 focus:bg-[#1E1E26] transition-all"
        />
      </div>

      {/* Filtros */}
      {hasSearched && hasResults && (
        <div className="flex gap-2 mb-3 md:mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
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
          {tracks.length > 0 && (filter === 'all' || filter === 'tracks') && (
            <section>
              <h2 className="text-base sm:text-lg font-semibold mb-2 md:mb-3 text-[#F5F5F7]">
                Canciones
                {filter === 'all' ? (
                  <span className="text-sm text-[#8B8B96] font-normal ml-2">({tracks.length})</span>
                ) : (
                  <span className="text-sm text-[#8B8B96] font-normal ml-2">con "{debouncedQuery}" en el título</span>
                )}
              </h2>
              <div className="space-y-0.5 md:space-y-1">
                {(filter === 'tracks' ? tracks : tracks.slice(0, 5)).map((track, i) => (
                  <motion.button
                    key={track.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => playTrack(track, tracks)}
                    className="w-full flex items-center gap-2.5 md:gap-3 p-2 rounded-lg hover:bg-[#1E1E26] active:bg-[#1E1E26] transition-colors group text-left"
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
                    <span className="text-xs text-[#8B8B96] font-mono shrink-0">{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</span>
                  </motion.button>
                ))}
              </div>
            </section>
          )}

          {/* Artistas */}
          {artists.length > 0 && (filter === 'all' || filter === 'artists') && (
            <section>
              <h2 className="text-base sm:text-lg font-semibold mb-2 md:mb-3 text-[#F5F5F7]">
                Artistas
                {filter === 'all' ? (
                  <span className="text-sm text-[#8B8B96] font-normal ml-2">({artists.length})</span>
                ) : (
                  <span className="text-sm text-[#8B8B96] font-normal ml-2">con "{debouncedQuery}" en el nombre</span>
                )}
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
                {(filter === 'artists' ? artists : artists.slice(0, 6)).map(artist => (
                  <motion.div
                    key={artist.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Link to={`/artist/${artist.id}`} className="group cursor-pointer block">
                      <img src={artist.image} alt="" className="w-full aspect-square rounded-full object-cover shadow-lg mb-1.5 md:mb-2 ring-1 ring-[#2A2A35]" />
                      <p className="text-xs sm:text-sm font-medium text-center truncate text-[#F5F5F7]">{artist.name}</p>
                      <p className="text-[10px] sm:text-xs text-[#8B8B96] text-center">Artista</p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Álbumes */}
          {albums.length > 0 && (filter === 'all' || filter === 'albums') && (
            <section>
              <h2 className="text-base sm:text-lg font-semibold mb-2 md:mb-3 text-[#F5F5F7]">
                Álbumes
                {filter === 'all' ? (
                  <span className="text-sm text-[#8B8B96] font-normal ml-2">({albums.length})</span>
                ) : (
                  <span className="text-sm text-[#8B8B96] font-normal ml-2">con "{debouncedQuery}" en el título</span>
                )}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {(filter === 'albums' ? albums : albums.slice(0, 5)).map(album => (
                  <motion.div
                    key={album.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group cursor-pointer"
                  >
                    <div className="relative mb-2">
                      <img src={album.cover} alt={album.title} className="w-full aspect-square rounded-xl object-cover shadow-lg ring-1 ring-[#2A2A35]" />
                      <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full gradient-aura-glow flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <Disc3 className="w-5 h-5 text-white" strokeWidth={1.75} />
                      </div>
                    </div>
                    <p className="text-sm font-medium truncate text-[#F5F5F7]">{album.title}</p>
                    <p className="text-xs text-[#8B8B96] truncate">{album.artist} · {album.year}</p>
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
