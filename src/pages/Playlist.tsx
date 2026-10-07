import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Pause, Heart, Share2, Clock, MoreHorizontal, Shuffle, Music2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { supabase } from '../lib/supabase';
import { getTrackById as getJamendoTrack } from '../lib/jamendo';
import { jamendoTrackToTrack } from '../lib/adapters';
import { formatDuration, formatTime } from '../lib/utils';
import type { Track } from '../types';
import type { Playlist } from '../types/database';

export function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const { toggleLike, isLiked, getPlaylistTracks } = useLibraryStore();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlaylist() {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Obtener playlist de Supabase
        const { data: playlistData, error: playlistError } = await supabase
          .from('playlists')
          .select('*')
          .eq('id', id)
          .single();

        if (playlistError || !playlistData) {
          console.error('Error loading playlist:', playlistError);
          setPlaylist(null);
          return;
        }

        setPlaylist(playlistData);

        // Obtener tracks de la playlist
        const trackIds = await getPlaylistTracks(id);
        
        if (trackIds.length === 0) {
          setPlaylistTracks([]);
          return;
        }

        // Obtener datos de Jamendo para cada track
        const tracks: Track[] = [];
        for (const trackId of trackIds) {
          try {
            const jamendoTrack = await getJamendoTrack(trackId.replace('jamendo-', ''));
            if (jamendoTrack) {
              tracks.push(jamendoTrackToTrack(jamendoTrack));
            }
          } catch (error) {
            console.error(`Error loading track ${trackId}:`, error);
          }
        }

        setPlaylistTracks(tracks);
      } catch (error) {
        console.error('Error loading playlist:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPlaylist();
  }, [id, getPlaylistTracks]);

  if (loading) {
    return (
      <div className="pb-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-48 h-48 rounded-xl bg-[#131318] animate-pulse" />
          <div className="flex-1">
            <div className="h-4 w-24 bg-[#131318] rounded mb-2 animate-pulse" />
            <div className="h-12 w-96 bg-[#131318] rounded mb-2 animate-pulse" />
            <div className="h-4 w-64 bg-[#131318] rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#8B8B96]">No encontramos esa playlist.</p>
      </div>
    );
  }

  const totalDuration = playlistTracks.reduce((sum, t) => sum + t.duration, 0);
  const isCurrentPlaylist = playlistTracks.some(t => t.id === currentTrack?.id);

  const handlePlayAll = () => {
    if (isCurrentPlaylist && isPlaying) {
      togglePlay();
    } else if (playlistTracks.length > 0) {
      playTrack(playlistTracks[0], playlistTracks);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 md:gap-6 mb-6 md:mb-8">
        {playlist.cover_url ? (
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={playlist.cover_url}
            alt={playlist.title}
            className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-xl object-cover shadow-2xl ring-1 ring-[#2A2A35]"
          />
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#EC4899] flex items-center justify-center shadow-2xl ring-1 ring-[#2A2A35]"
          >
            <Music2 className="w-16 h-16 md:w-20 md:h-20 text-white" strokeWidth={1.5} />
          </motion.div>
        )}
        <div className="text-center sm:text-left">
          <p className="text-[11px] uppercase tracking-[0.15em] text-[#8B8B96] font-medium mb-1.5 md:mb-2">Playlist</p>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-1.5 md:mb-2 text-[#F5F5F7]">{playlist.title}</h1>
          {playlist.description && (
            <p className="text-sm md:text-base text-[#8B8B96] mb-2 md:mb-3 line-clamp-2">{playlist.description}</p>
          )}
          <div className="flex items-center gap-1.5 md:gap-2 text-xs sm:text-sm text-[#8B8B96] justify-center sm:justify-start flex-wrap">
            <span>{playlistTracks.length} canciones</span>
            {totalDuration > 0 && (
              <>
                <span>·</span>
                <span className="font-mono">{formatDuration(totalDuration)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2.5 md:gap-3 mb-5 md:mb-6">
        <button
          onClick={handlePlayAll}
          disabled={playlistTracks.length === 0}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full gradient-aura-glow flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCurrentPlaylist && isPlaying ? (
            <Pause className="w-5 h-5 md:w-6 md:h-6 text-white fill-white" strokeWidth={1.75} />
          ) : (
            <Play className="w-5 h-5 md:w-6 md:h-6 text-white fill-white ml-0.5" strokeWidth={1.75} />
          )}
        </button>
        <button className="p-2 rounded-full hover:bg-[#1E1E26] active:bg-[#1E1E26] transition-colors text-[#8B8B96] hover:text-[#F5F5F7]">
          <Shuffle className="w-5 h-5" strokeWidth={1.75} />
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copiado. Ya es de quien quieras.');
          }}
          className="p-2 rounded-full hover:bg-[#1E1E26] active:bg-[#1E1E26] transition-colors text-[#8B8B96] hover:text-[#F5F5F7]"
        >
          <Share2 className="w-5 h-5" strokeWidth={1.75} />
        </button>
        <button className="p-2 rounded-full hover:bg-[#1E1E26] active:bg-[#1E1E26] transition-colors text-[#8B8B96] hover:text-[#F5F5F7]">
          <MoreHorizontal className="w-5 h-5" strokeWidth={1.75} />
        </button>
      </div>

      {/* Lista de canciones */}
      {playlistTracks.length === 0 ? (
        <div className="text-center py-16">
          <Music2 className="w-12 h-12 text-[#8B8B96]/30 mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-[#8B8B96]">Aún no hay canciones aquí</p>
          <p className="text-sm text-[#8B8B96]/60 mt-1">Añade canciones para empezar a escuchar</p>
        </div>
      ) : (
        <div className="space-y-0">
          <div className="hidden sm:grid grid-cols-[2rem_2fr_1fr_1fr_4rem] gap-4 px-4 py-2 border-b border-[#2A2A35] text-[11px] text-[#8B8B96] uppercase tracking-[0.1em] font-medium">
            <span>#</span>
            <span>Título</span>
            <span>Álbum</span>
            <span className="flex justify-end"><Clock className="w-4 h-4" strokeWidth={1.75} /></span>
            <span></span>
          </div>

          {playlistTracks.map((track, i) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => playTrack(track, playlistTracks)}
              className="hidden sm:grid grid-cols-[2rem_2fr_1fr_1fr_4rem] gap-4 px-4 py-2 rounded-lg hover:bg-[#1E1E26] active:bg-[#1E1E26] transition-colors group cursor-pointer items-center"
            >
              <span className="text-sm text-[#8B8B96] group-hover:hidden font-mono">{i + 1}</span>
              <Play className="w-4 h-4 text-[#F5F5F7] hidden group-hover:block" strokeWidth={1.75} />
              <div className="flex items-center gap-3 min-w-0">
                <img src={track.cover} alt={track.title} className="w-10 h-10 rounded object-cover shrink-0" />
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate ${currentTrack?.id === track.id ? 'text-[#A78BFA]' : 'text-[#F5F5F7]'}`}>
                    {track.title}
                  </p>
                  <p className="text-xs text-[#8B8B96] truncate">{track.artist}</p>
                </div>
              </div>
              <span className="text-sm text-[#8B8B96] truncate">{track.album}</span>
              <span className="text-sm text-[#8B8B96] text-right font-mono">{formatTime(track.duration)}</span>
              <button
                onClick={(e) => { e.stopPropagation(); toggleLike(track.id); }}
                className="justify-self-end"
              >
                <Heart
                  className={`w-4 h-4 transition-all ${
                    isLiked(track.id) ? 'text-[#A78BFA] fill-[#A78BFA]' : 'text-transparent group-hover:text-[#8B8B96]'
                  }`}
                  strokeWidth={1.75}
                />
              </button>
            </motion.div>
          ))}

          {/* Mobile layout */}
          {playlistTracks.map((track, i) => (
            <motion.div
              key={`mobile-${track.id}`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => playTrack(track, playlistTracks)}
              className="sm:hidden flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#1E1E26] active:bg-[#1E1E26] transition-colors group cursor-pointer"
            >
              <span className="w-5 text-center text-xs text-[#8B8B96] group-hover:hidden font-mono shrink-0">{i + 1}</span>
              <Play className="w-4 h-4 text-[#F5F5F7] hidden group-hover:block shrink-0" strokeWidth={1.75} />
              <img src={track.cover} alt={track.title} className="w-10 h-10 rounded object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${currentTrack?.id === track.id ? 'text-[#A78BFA]' : 'text-[#F5F5F7]'}`}>
                  {track.title}
                </p>
                <p className="text-xs text-[#8B8B96] truncate">{track.artist}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleLike(track.id); }}
                className="shrink-0 p-1"
              >
                <Heart
                  className={`w-4 h-4 transition-all ${
                    isLiked(track.id) ? 'text-[#A78BFA] fill-[#A78BFA]' : 'text-[#8B8B96]'
                  }`}
                  strokeWidth={1.75}
                />
              </button>
              <span className="text-xs text-[#8B8B96] font-mono shrink-0">{formatTime(track.duration)}</span>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
