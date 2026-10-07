import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Music2, Heart, Clock, Users, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { useLibraryStore } from '../store/libraryStore';
import { getTrackById as getJamendoTrack } from '../lib/jamendo';
import { jamendoTrackToTrack } from '../lib/adapters';
import { formatNumber } from '../lib/utils';
import { Link } from 'react-router-dom';
import { AuralLogo } from '../components/shared/AuralLogo';
import { usePlayerStore } from '../store/playerStore';
import type { Track } from '../types';

export function ProfilePage() {
  const { profile, signOut } = useAuthStore();
  const { likedTracks, recentlyPlayed, playlists } = useLibraryStore();
  const { playTrack } = usePlayerStore();
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar tracks recientes
  useState(() => {
    async function loadRecentTracks() {
      try {
        const tracks: Track[] = [];
        for (const trackId of recentlyPlayed.slice(0, 5)) {
          try {
            const jamendoTrack = await getJamendoTrack(trackId.replace('jamendo-', ''));
            if (jamendoTrack) {
              tracks.push(jamendoTrackToTrack(jamendoTrack));
            }
          } catch (error) {
            console.error(`Error loading track ${trackId}:`, error);
          }
        }
        setRecentTracks(tracks);
      } catch (error) {
        console.error('Error loading recent tracks:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (recentlyPlayed.length > 0) {
      loadRecentTracks();
    } else {
      setLoading(false);
    }
  });

  const handleSignOut = async () => {
    await signOut();
    toast.success('Sesión cerrada. ¡Hasta pronto!');
  };

  const stats = [
    { label: 'Favoritas', value: likedTracks.length, icon: Heart },
    { label: 'Playlists', value: playlists.length, icon: Music2 },
    { label: 'Escuchadas', value: recentlyPlayed.length, icon: Clock },
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
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.username} className="w-full h-full rounded-full object-cover" />
          ) : (
            <AuralLogo size={64} />
          )}
        </motion.div>
        <h1 className="text-2xl font-bold mb-1 text-[#F5F5F7]">{profile?.username || 'Usuario'}</h1>
        <div className="flex gap-6 text-center mt-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-lg font-bold text-[#F5F5F7]">{stat.value}</p>
              <p className="text-xs text-[#8B8B96]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Playlists */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold tracking-tight mb-4 text-[#F5F5F7]">Tus playlists</h2>
        {playlists.length === 0 ? (
          <div className="text-center py-8 bg-[#131318] border border-[#2A2A35] rounded-xl">
            <Music2 className="w-12 h-12 text-[#8B8B96]/30 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-[#8B8B96]">Aún no tienes playlists</p>
            <p className="text-sm text-[#8B8B96]/60 mt-1">Crea una desde tu biblioteca</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {playlists.slice(0, 8).map(playlist => (
              <Link key={playlist.id} to={`/playlist/${playlist.id}`} className="group">
                <motion.div whileHover={{ y: -4 }} className="relative mb-3">
                  {playlist.cover_url ? (
                    <img src={playlist.cover_url} alt={playlist.title} className="w-full aspect-square rounded-xl object-cover shadow-lg ring-1 ring-[#2A2A35]" />
                  ) : (
                    <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#EC4899] flex items-center justify-center shadow-lg ring-1 ring-[#2A2A35]">
                      <Music2 className="w-12 h-12 text-white" strokeWidth={1.5} />
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full gradient-aura-glow flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" strokeWidth={1.75} />
                  </div>
                </motion.div>
                <p className="text-sm font-medium truncate text-[#F5F5F7]">{playlist.title}</p>
                <p className="text-xs text-[#8B8B96] truncate">{playlist.description || 'Playlist'}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Reproducido recientemente */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-4 text-[#F5F5F7]">Reproducido recientemente</h2>
        {loading ? (
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
        ) : recentTracks.length === 0 ? (
          <div className="text-center py-8 bg-[#131318] border border-[#2A2A35] rounded-xl">
            <Clock className="w-12 h-12 text-[#8B8B96]/30 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-[#8B8B96]">Aún no has escuchado nada</p>
            <p className="text-sm text-[#8B8B96]/60 mt-1">Empieza a explorar música</p>
          </div>
        ) : (
          <div className="space-y-1">
            {recentTracks.map((track, i) => (
              <motion.button
                key={track.id}
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
            ))}
          </div>
        )}
      </section>

      {/* Sign Out */}
      <div className="mt-12 pt-8 border-t border-[#2A2A35]">
        <button
          onClick={handleSignOut}
          className="w-full py-3 rounded-xl bg-[#131318] border border-[#2A2A35] text-[#8B8B96] hover:text-[#F5F5F7] hover:bg-[#1E1E26] transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.75} />
          Cerrar sesión
        </button>
      </div>
    </motion.div>
  );
}
