import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Shuffle, Heart, MoreHorizontal, CheckCircle2, UserCheck, UserPlus, Disc3 } from 'lucide-react';
import { toast } from 'sonner';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { getTracksByArtist, getPopularArtists } from '../lib/jamendo';
import { jamendoTracksToTracks, jamendoArtistsToArtists } from '../lib/adapters';
import { Track, Artist, Album } from '../types';

export function ArtistPage() {
  const { id } = useParams<{ id: string }>();
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const { toggleLike, isLiked, toggleFollowArtist, isFollowed } = useLibraryStore();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [artistTracks, setArtistTracks] = useState<Track[]>([]);
  const [artistAlbums, setArtistAlbums] = useState<Album[]>([]);
  const [relatedArtists, setRelatedArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArtist() {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Extraer ID real de Jamendo (quitar prefijo "jamendo-artist-")
        const jamendoArtistId = id.replace('jamendo-artist-', '');
        
        // Cargar tracks del artista (más cantidad) y artistas populares
        const [tracks, allArtists] = await Promise.all([
          getTracksByArtist(jamendoArtistId, 50),
          getPopularArtists(10)
        ]);
        
        const convertedTracks = jamendoTracksToTracks(tracks);
        setArtistTracks(convertedTracks);
        
        // Crear artista desde los datos del primer track
        if (tracks.length > 0) {
          const firstTrack = tracks[0];
          const genres = firstTrack.musicinfo?.tags?.genres || [];
          setArtist({
            id: `jamendo-artist-${firstTrack.artist_id}`,
            name: firstTrack.artist_name,
            image: firstTrack.artist_image || 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400&h=400&fit=crop',
            genre: genres[0] || 'Various',
            monthlyListeners: 0,
            verified: false,
            albums: [],
          });
        }
        
        // Agrupar tracks por álbum
        const albumsMap = new Map<string, Album>();
        for (const track of convertedTracks) {
          if (!albumsMap.has(track.albumId)) {
            albumsMap.set(track.albumId, {
              id: track.albumId,
              title: track.album,
              artist: track.artist,
              artistId: track.artistId,
              cover: track.cover,
              year: 2024,
              tracks: [],
              type: 'album',
            });
          }
          albumsMap.get(track.albumId)!.tracks.push(track.id);
        }
        setArtistAlbums(Array.from(albumsMap.values()));
        
        // Filtrar artistas relacionados (excluir el actual)
        const related = jamendoArtistsToArtists(allArtists)
          .filter(a => a.id !== id)
          .slice(0, 4);
        setRelatedArtists(related);
        
      } catch (error) {
        console.error('Error loading artist:', error);
      } finally {
        setLoading(false);
      }
    }

    loadArtist();
  }, [id]);

  if (loading) {
    return (
      <div className="pb-8">
        {/* Skeleton header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-[#131318] animate-pulse shrink-0" />
          <div className="text-center sm:text-left flex-1">
            <div className="h-3 w-20 bg-[#131318] rounded mb-2 animate-pulse mx-auto sm:mx-0" />
            <div className="h-8 sm:h-10 w-full max-w-xs bg-[#131318] rounded mb-2 animate-pulse" />
            <div className="h-4 w-40 bg-[#131318] rounded animate-pulse mx-auto sm:mx-0" />
          </div>
        </div>
        
        {/* Skeleton acciones */}
        <div className="flex items-center gap-2.5 md:gap-3 mb-6 md:mb-8">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#131318] animate-pulse" />
          <div className="h-10 w-24 bg-[#131318] rounded-full animate-pulse" />
          <div className="w-9 h-9 rounded-full bg-[#131318] animate-pulse" />
          <div className="w-9 h-9 rounded-full bg-[#131318] animate-pulse" />
        </div>
        
        {/* Skeleton canciones */}
        <div className="mb-8 md:mb-10">
          <div className="h-5 w-32 bg-[#131318] rounded mb-3 md:mb-4 animate-pulse" />
          <div className="space-y-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <div className="w-5 h-5 bg-[#131318] rounded animate-pulse" />
                <div className="w-10 h-10 bg-[#131318] rounded animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-48 bg-[#131318] rounded animate-pulse mb-1" />
                  <div className="h-3 w-32 bg-[#131318] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skeleton álbumes */}
        <div className="mb-8 md:mb-10">
          <div className="h-5 w-24 bg-[#131318] rounded mb-3 md:mb-4 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i}>
                <div className="w-full aspect-square rounded-xl bg-[#131318] animate-pulse mb-2" />
                <div className="h-3 w-full bg-[#131318] rounded animate-pulse mb-1" />
                <div className="h-2.5 w-2/3 bg-[#131318] rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#8B8B96]">No encontramos ese artista.</p>
      </div>
    );
  }

  const isCurrentArtist = artistTracks.some(t => t.id === currentTrack?.id);

  const handlePlayAll = () => {
    if (isCurrentArtist && isPlaying) {
      togglePlay();
    } else if (artistTracks.length > 0) {
      playTrack(artistTracks[0], artistTracks);
    }
  };

  const handleShuffle = () => {
    if (artistTracks.length > 0) {
      const shuffled = [...artistTracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Hero */}
      <div className="relative -mx-4 md:-mx-6 -mt-4 md:-mt-6 px-4 md:px-6 pt-12 md:pt-16 pb-6 md:pb-8 mb-6 md:mb-8">
        <div className="absolute inset-0 bg-gradient-to-b from-[#7C3AED]/20 via-[#7C3AED]/5 to-transparent" />
        <div className="relative flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={artist.image}
            alt={artist.name}
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full object-cover shadow-2xl ring-1 ring-[#2A2A35]"
          />
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
              {artist.verified && <CheckCircle2 className="w-4 h-4 text-[#A78BFA]" strokeWidth={1.75} />}
              <span className="text-[11px] uppercase tracking-[0.15em] text-[#8B8B96] font-medium">
                {artist.verified ? 'Artista verificado' : 'Artista'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-1.5 md:mb-2 text-[#F5F5F7]">{artist.name}</h1>
            <div className="flex items-center gap-2 text-sm md:text-base text-[#8B8B96]">
              <span>{artist.genre}</span>
              {artistTracks.length > 0 && (
                <>
                  <span>·</span>
                  <span>{artistTracks.length} canciones</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2.5 md:gap-3 mb-6 md:mb-8">
        <button
          onClick={handlePlayAll}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full gradient-aura-glow flex items-center justify-center hover:scale-105 transition-transform"
        >
          {isCurrentArtist && isPlaying ? (
            <Pause className="w-5 h-5 md:w-6 md:h-6 text-white fill-white" strokeWidth={1.75} />
          ) : (
            <Play className="w-5 h-5 md:w-6 md:h-6 text-white fill-white ml-0.5" strokeWidth={1.75} />
          )}
        </button>
        <motion.button
          key={isFollowed(artist.id) ? 'following' : 'follow'}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          onClick={() => {
            const wasFollowed = isFollowed(artist.id);
            toggleFollowArtist(artist.id, artist.name, artist.image);
            toast.success(
              wasFollowed 
                ? `Dejaste de seguir a ${artist.name}` 
                : `Ahora sigues a ${artist.name}`
            );
          }}
          className={`px-4 md:px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
            isFollowed(artist.id)
              ? 'bg-[#7C3AED]/15 border border-[#7C3AED]/40 text-[#A78BFA] hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400'
              : 'border border-[#2A2A35] text-[#F5F5F7] hover:bg-[#1E1E26] hover:border-[#7C3AED]/50'
          }`}
        >
          <AnimatePresence mode="wait">
            {isFollowed(artist.id) ? (
              <motion.span
                key="following-icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" strokeWidth={1.75} />
                <span>Siguiendo</span>
              </motion.span>
            ) : (
              <motion.span
                key="follow-icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" strokeWidth={1.75} />
                <span>Seguir</span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
        <button
          onClick={handleShuffle}
          className="p-2 rounded-full hover:bg-[#1E1E26] active:bg-[#1E1E26] transition-colors text-[#8B8B96] hover:text-[#F5F5F7]"
        >
          <Shuffle className="w-5 h-5" strokeWidth={1.75} />
        </button>
        <button className="p-2 rounded-full hover:bg-[#1E1E26] active:bg-[#1E1E26] transition-colors text-[#8B8B96] hover:text-[#F5F5F7]">
          <MoreHorizontal className="w-5 h-5" strokeWidth={1.75} />
        </button>
      </div>

      {/* Canciones */}
      {artistTracks.length > 0 && (
        <section className="mb-8 md:mb-10">
          <h2 className="text-base sm:text-lg font-semibold mb-2 md:mb-3 text-[#F5F5F7]">
            Canciones
            <span className="text-sm text-[#8B8B96] font-normal ml-2">({artistTracks.length})</span>
          </h2>
          <div className="space-y-0.5 md:space-y-1">
            {artistTracks.map((track, i) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => playTrack(track, artistTracks)}
                className="flex items-center gap-2.5 md:gap-4 px-2 md:px-4 py-2 rounded-lg hover:bg-[#1E1E26] active:bg-[#1E1E26] transition-colors group cursor-pointer"
              >
                <span className="w-5 md:w-6 text-center text-xs md:text-sm text-[#8B8B96] group-hover:hidden font-mono">{i + 1}</span>
                <Play className="w-4 h-4 text-[#F5F5F7] hidden group-hover:block" strokeWidth={1.75} />
                <img src={track.cover} alt={track.title} className="w-10 h-10 md:w-11 md:h-11 rounded object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${currentTrack?.id === track.id ? 'text-[#A78BFA]' : 'text-[#F5F5F7]'}`}>
                    {track.title}
                  </p>
                  <p className="text-xs text-[#8B8B96] truncate">{track.album}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleLike(track.id); }}
                  className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0 p-1"
                >
                  <Heart
                    className={`w-4 h-4 ${isLiked(track.id) ? 'text-[#A78BFA] fill-[#A78BFA]' : 'text-[#8B8B96]'}`}
                    strokeWidth={1.75}
                  />
                </button>
                <span className="text-xs md:text-sm text-[#8B8B96] font-mono shrink-0">
                  {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                </span>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Álbumes */}
      {artistAlbums.length > 0 && (
        <section className="mb-8 md:mb-10">
          <h2 className="text-base sm:text-lg font-semibold mb-2 md:mb-3 text-[#F5F5F7]">
            Álbumes
            <span className="text-sm text-[#8B8B96] font-normal ml-2">({artistAlbums.length})</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {artistAlbums.map((album) => (
              <motion.div
                key={album.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group cursor-pointer"
              >
                <Link to={`/playlist/${album.id}`}>
                  <div className="relative mb-2">
                    <img src={album.cover} alt={album.title} className="w-full aspect-square rounded-xl object-cover shadow-lg ring-1 ring-[#2A2A35]" />
                    <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full gradient-aura-glow flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <Disc3 className="w-5 h-5 text-white" strokeWidth={1.75} />
                    </div>
                  </div>
                  <p className="text-sm font-medium truncate text-[#F5F5F7]">{album.title}</p>
                  <p className="text-xs text-[#8B8B96] truncate">{album.tracks.length} canciones · {album.year}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Artistas similares */}
      {relatedArtists.length > 0 && (
        <section className="mb-10">
          <h2 className="text-base sm:text-lg font-semibold mb-2 md:mb-3 text-[#F5F5F7]">
            Artistas similares
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
            {relatedArtists.map(a => (
              <Link key={a.id} to={`/artist/${a.id}`} className="group">
                <motion.div whileHover={{ y: -4 }} className="relative mb-2">
                  <img src={a.image} alt={a.name} className="w-full aspect-square rounded-full object-cover shadow-lg ring-1 ring-[#2A2A35]" />
                  <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full gradient-aura-glow flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" strokeWidth={1.75} />
                  </div>
                </motion.div>
                <p className="text-sm font-medium text-center truncate text-[#F5F5F7]">{a.name}</p>
                <p className="text-xs text-[#8B8B96] text-center">Artista</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
