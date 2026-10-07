import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Pause, Shuffle, Heart, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { getTracksByArtist, getPopularArtists } from '../lib/jamendo';
import { jamendoTracksToTracks, jamendoArtistsToArtists } from '../lib/adapters';
import { formatNumber } from '../lib/utils';
import { Track, Artist } from '../types';

export function ArtistPage() {
  const { id } = useParams<{ id: string }>();
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const { toggleLike, isLiked } = useLibraryStore();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [artistTracks, setArtistTracks] = useState<Track[]>([]);
  const [relatedArtists, setRelatedArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArtist() {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Extraer ID real de Jamendo (quitar prefijo "jamendo-artist-")
        const jamendoArtistId = id.replace('jamendo-artist-', '');
        
        // Cargar tracks del artista y artistas relacionados
        const [tracks, allArtists] = await Promise.all([
          getTracksByArtist(jamendoArtistId, 20),
          getPopularArtists(10)
        ]);
        
        const convertedTracks = jamendoTracksToTracks(tracks);
        setArtistTracks(convertedTracks);
        
        // Crear artista desde los datos del primer track
        if (tracks.length > 0) {
          const firstTrack = tracks[0];
          setArtist({
            id: `jamendo-artist-${firstTrack.artist_id}`,
            name: firstTrack.artist_name,
            image: firstTrack.artist_image || 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400&h=400&fit=crop',
            genre: firstTrack.musicinfo?.tags?.[0] || 'Various',
            monthlyListeners: 0,
            verified: false,
            albums: [],
          });
        }
        
        // Filtrar artistas relacionados (excluir el actual)
        const related = jamendoArtistsToArtists(allArtists)
          .filter(a => a.id !== id)
          .slice(0, 4);
        setRelatedArtists(related);
        
      } catch (error) {
        console.error('Error loading artist:', error);
        toast.error('Algo se desafinó. Intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    }

    loadArtist();
  }, [id]);

  if (loading) {
    return (
      <div className="pb-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-40 h-40 rounded-full bg-[#131318] animate-pulse" />
          <div className="flex-1">
            <div className="h-4 w-32 bg-[#131318] rounded mb-2 animate-pulse" />
            <div className="h-10 w-64 bg-[#131318] rounded mb-2 animate-pulse" />
            <div className="h-4 w-48 bg-[#131318] rounded animate-pulse" />
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

  const topTracks = artistTracks.slice(0, 5);
  const isCurrentArtist = artistTracks.some(t => t.id === currentTrack?.id);

  const handlePlayAll = () => {
    if (isCurrentArtist && isPlaying) {
      togglePlay();
    } else if (artistTracks.length > 0) {
      playTrack(artistTracks[0], artistTracks);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Hero */}
      <div className="relative -mx-4 md:-mx-6 -mt-4 md:-mt-6 px-4 md:px-6 pt-16 pb-8 mb-8">
        <div className="absolute inset-0 bg-gradient-to-b from-[#7C3AED]/20 via-[#7C3AED]/5 to-transparent" />
        <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6">
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={artist.image}
            alt={artist.name}
            className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover shadow-2xl ring-1 ring-[#2A2A35]"
          />
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
              {artist.verified && <CheckCircle2 className="w-4 h-4 text-[#A78BFA]" strokeWidth={1.75} />}
              <span className="text-[11px] uppercase tracking-[0.15em] text-[#8B8B96] font-medium">
                {artist.verified ? 'Artista verificado' : 'Artista'}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2 text-[#F5F5F7]">{artist.name}</h1>
            <p className="text-[#8B8B96]">{formatNumber(artist.monthlyListeners)} oyentes mensuales</p>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={handlePlayAll}
          className="w-14 h-14 rounded-full gradient-aura-glow flex items-center justify-center hover:scale-105 transition-transform"
        >
          {isCurrentArtist && isPlaying ? (
            <Pause className="w-6 h-6 text-white fill-white" strokeWidth={1.75} />
          ) : (
            <Play className="w-6 h-6 text-white fill-white ml-0.5" strokeWidth={1.75} />
          )}
        </button>
        <button className="px-6 py-2 rounded-full border border-[#2A2A35] text-sm font-medium text-[#F5F5F7] hover:bg-[#1E1E26] hover:border-[#7C3AED]/50 transition-all">
          Seguir
        </button>
        <button className="p-2 rounded-full hover:bg-[#1E1E26] transition-colors text-[#8B8B96] hover:text-[#F5F5F7]">
          <Shuffle className="w-5 h-5" strokeWidth={1.75} />
        </button>
        <button className="p-2 rounded-full hover:bg-[#1E1E26] transition-colors text-[#8B8B96] hover:text-[#F5F5F7]">
          <MoreHorizontal className="w-5 h-5" strokeWidth={1.75} />
        </button>
      </div>

      {/* Populares */}
      {topTracks.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold tracking-tight mb-4 text-[#F5F5F7]">Populares</h2>
          <div className="space-y-1">
            {topTracks.map((track, i) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => playTrack(track, artistTracks)}
                className="flex items-center gap-4 px-4 py-2 rounded-lg hover:bg-[#1E1E26] transition-colors group cursor-pointer"
              >
                <span className="w-6 text-center text-sm text-[#8B8B96] group-hover:hidden font-mono">{i + 1}</span>
                <Play className="w-4 h-4 text-[#F5F5F7] hidden group-hover:block" strokeWidth={1.75} />
                <img src={track.cover} alt={track.title} className="w-10 h-10 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${currentTrack?.id === track.id ? 'text-[#A78BFA]' : 'text-[#F5F5F7]'}`}>
                    {track.title}
                  </p>
                  <p className="text-xs text-[#8B8B96]">{formatNumber(track.playCount)} reproducciones</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleLike(track.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart
                    className={`w-4 h-4 ${isLiked(track.id) ? 'text-[#A78BFA] fill-[#A78BFA]' : 'text-[#8B8B96]'}`}
                    strokeWidth={1.75}
                  />
                </button>
                <span className="text-sm text-[#8B8B96] font-mono">
                  {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                </span>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Relacionados */}
      {relatedArtists.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold tracking-tight mb-4 text-[#F5F5F7]">Artistas similares</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {relatedArtists.map(a => (
              <Link key={a.id} to={`/artist/${a.id}`} className="group">
                <motion.div whileHover={{ y: -4 }} className="relative mb-3">
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
