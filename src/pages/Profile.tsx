import { motion } from 'framer-motion';
import { Music2, Heart, Clock, Users, Play } from 'lucide-react';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayerStore } from '../store/playerStore';
import { playlists, getTrackById } from '../lib/mockData';
import { formatNumber } from '../lib/utils';
import { Link } from 'react-router-dom';
import { AuralLogo } from '../components/shared/AuralLogo';

export function ProfilePage() {
  const { likedTracks, recentlyPlayed } = useLibraryStore();
  const { playTrack } = usePlayerStore();

  const stats = [
    { label: 'Favoritas', value: likedTracks.length, icon: Heart },
    { label: 'Playlists', value: playlists.length, icon: Music2 },
    { label: 'Horas escuchadas', value: 47, icon: Clock },
    { label: 'Artistas top', value: 12, icon: Users },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="w-32 h-32 rounded-full gradient-aura-glow flex items-center justify-center mb-4"
        >
          <AuralLogo size={64} />
        </motion.div>
        <h1 className="text-2xl font-bold mb-1 text-[#F5F5F7]">Usuario Aural</h1>
        <p className="text-[#8B8B96] text-sm mb-4">@aural_user</p>
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-lg font-bold text-[#F5F5F7]">{formatNumber(234)}</p>
            <p className="text-xs text-[#8B8B96]">Seguidores</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[#F5F5F7]">{formatNumber(89)}</p>
            <p className="text-xs text-[#8B8B96]">Siguiendo</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[#F5F5F7]">{playlists.length}</p>
            <p className="text-xs text-[#8B8B96]">Playlists</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#131318] border border-[#2A2A35] rounded-xl p-4 text-center hover:border-[#7C3AED]/30 transition-colors"
          >
            <stat.icon className="w-5 h-5 text-[#A78BFA] mx-auto mb-2" strokeWidth={1.75} />
            <p className="text-xl font-bold text-[#F5F5F7]">{stat.value}</p>
            <p className="text-xs text-[#8B8B96]">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Playlists públicas */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold tracking-tight mb-4 text-[#F5F5F7]">Playlists públicas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {playlists.slice(0, 4).map(playlist => (
            <Link key={playlist.id} to={`/playlist/${playlist.id}`} className="group">
              <motion.div whileHover={{ y: -4 }} className="relative mb-3">
                <img src={playlist.cover} alt={playlist.title} className="w-full aspect-square rounded-xl object-cover shadow-lg ring-1 ring-[#2A2A35]" />
                <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full gradient-aura-glow flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" strokeWidth={1.75} />
                </div>
              </motion.div>
              <p className="text-sm font-medium truncate text-[#F5F5F7]">{playlist.title}</p>
              <p className="text-xs text-[#8B8B96] truncate">{playlist.tracks.length} canciones</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Reproducido recientemente */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-4 text-[#F5F5F7]">Reproducido recientemente</h2>
        <div className="space-y-1">
          {recentlyPlayed.slice(0, 5).map((trackId, i) => {
            const track = getTrackById(trackId);
            if (!track) return null;
            return (
              <motion.button
                key={trackId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => playTrack(track)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#1E1E26] transition-colors text-left"
              >
                <img src={track.cover} alt={track.title} className="w-10 h-10 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-[#F5F5F7]">{track.title}</p>
                  <p className="text-xs text-[#8B8B96] truncate">{track.artist}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}
