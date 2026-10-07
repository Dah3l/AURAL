import { motion } from 'framer-motion';
import { Music2, Heart, Clock, Users, Play } from 'lucide-react';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayerStore } from '../store/playerStore';
import { playlists, getTrackById } from '../lib/mockData';
import { formatNumber } from '../lib/utils';
import { Link } from 'react-router-dom';

export function ProfilePage() {
  const { likedTracks, recentlyPlayed } = useLibraryStore();
  const { playTrack } = usePlayerStore();

  const stats = [
    { label: 'Liked Songs', value: likedTracks.length, icon: Heart },
    { label: 'Playlists', value: playlists.length, icon: Music2 },
    { label: 'Hours Played', value: 47, icon: Clock },
    { label: 'Top Artists', value: 12, icon: Users },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mb-4 shadow-2xl"
        >
          <span className="text-4xl font-bold text-white">S</span>
        </motion.div>
        <h1 className="text-2xl font-bold mb-1">Soundwave User</h1>
        <p className="text-white/50 text-sm mb-4">@soundwave_user</p>
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-lg font-bold">{formatNumber(234)}</p>
            <p className="text-xs text-white/50">Followers</p>
          </div>
          <div>
            <p className="text-lg font-bold">{formatNumber(89)}</p>
            <p className="text-xs text-white/50">Following</p>
          </div>
          <div>
            <p className="text-lg font-bold">{playlists.length}</p>
            <p className="text-xs text-white/50">Playlists</p>
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
            className="bg-white/5 rounded-xl p-4 text-center"
          >
            <stat.icon className="w-5 h-5 text-violet-400 mx-auto mb-2" />
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-xs text-white/50">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Public Playlists */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Public Playlists</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {playlists.slice(0, 4).map(playlist => (
            <Link key={playlist.id} to={`/playlist/${playlist.id}`} className="group">
              <motion.div whileHover={{ y: -4 }} className="relative mb-3">
                <img src={playlist.cover} alt={playlist.title} className="w-full aspect-square rounded-xl object-cover shadow-lg" />
                <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-xl">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                </div>
              </motion.div>
              <p className="text-sm font-medium truncate">{playlist.title}</p>
              <p className="text-xs text-white/50 truncate">{playlist.tracks.length} songs</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently Played */}
      <section>
        <h2 className="text-xl font-bold mb-4">Recently Played</h2>
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
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
              >
                <img src={track.cover} alt={track.title} className="w-10 h-10 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{track.title}</p>
                  <p className="text-xs text-white/50 truncate">{track.artist}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}
