import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { getTracksByGenre } from '../lib/jamendo';
import { jamendoTracksToTracks } from '../lib/adapters';
import { Track } from '../types';

const genreNames: Record<string, string> = {
  'electronic': 'Electronic',
  'rock': 'Rock',
  'pop': 'Pop',
  'jazz': 'Jazz',
  'classical': 'Classical',
  'hip-hop': 'Hip Hop',
  'ambient': 'Ambient',
  'indie': 'Indie',
  'folk': 'Folk',
  'metal': 'Metal',
  'blues': 'Blues',
  'reggae': 'Reggae',
};

export function GenrePage() {
  const { genre } = useParams<{ genre: string }>();
  const { playTrack } = usePlayerStore();
  
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGenre() {
      if (!genre) return;
      
      try {
        setLoading(true);
        const genreTracks = await getTracksByGenre(genre, 30);
        setTracks(jamendoTracksToTracks(genreTracks));
      } catch (error) {
        console.error('Error loading genre:', error);
      } finally {
        setLoading(false);
      }
    }

    loadGenre();
  }, [genre]);

  if (loading) {
    return (
      <div className="pb-8">
        <div className="mb-8">
          <div className="h-4 w-24 bg-[#131318] rounded mb-2 animate-pulse" />
          <div className="h-12 w-64 bg-[#131318] rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i}>
              <div className="w-full aspect-square rounded-xl bg-[#131318] animate-pulse mb-3" />
              <div className="h-4 w-32 bg-[#131318] rounded animate-pulse mb-1" />
              <div className="h-3 w-24 bg-[#131318] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const genreName = genre ? (genreNames[genre] || genre) : 'Genre';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.15em] text-[#8B8B96] font-medium mb-2">Género</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#F5F5F7]">{genreName}</h1>
      </div>

      {tracks.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#8B8B96]">No hay canciones en este género.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {tracks.map(track => (
            <motion.div
              key={track.id}
              whileHover={{ y: -4 }}
              className="group cursor-pointer"
              onClick={() => playTrack(track, tracks)}
            >
              <div className="relative mb-3">
                <img src={track.cover} alt={track.title} className="w-full aspect-square rounded-xl object-cover shadow-lg ring-1 ring-[#2A2A35]" />
                <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full gradient-aura-glow flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" strokeWidth={1.75} />
                </div>
              </div>
              <p className="text-sm font-medium truncate text-[#F5F5F7]">{track.title}</p>
              <p className="text-xs text-[#8B8B96] truncate">{track.artist}</p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
