import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Pause, Heart, Share2, Clock, MoreHorizontal, Shuffle } from 'lucide-react';
import { toast } from 'sonner';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { getPlaylistById, getTrackById } from '../lib/mockData';
import { formatDuration, formatTime } from '../lib/utils';

export function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const playlist = getPlaylistById(id || '');
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const { toggleLike, isLiked } = useLibraryStore();

  if (!playlist) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white/50">Playlist not found</p>
      </div>
    );
  }

  const playlistTracks = playlist.tracks.map(tid => getTrackById(tid)).filter(Boolean);
  const totalDuration = playlistTracks.reduce((sum, t) => sum + (t?.duration || 0), 0);
  const isCurrentPlaylist = playlistTracks.some(t => t?.id === currentTrack?.id);

  const handlePlayAll = () => {
    if (isCurrentPlaylist && isPlaying) {
      togglePlay();
    } else if (playlistTracks.length > 0) {
      playTrack(playlistTracks[0]!, playlistTracks as NonNullable<ReturnType<typeof getTrackById>>[]);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
        <motion.img
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          src={playlist.cover}
          alt={playlist.title}
          className="w-48 h-48 md:w-56 md:h-56 rounded-xl object-cover shadow-2xl"
        />
        <div className="text-center md:text-left">
          <p className="text-xs uppercase tracking-wider text-white/50 mb-1">Playlist</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-2">{playlist.title}</h1>
          <p className="text-white/60 mb-3">{playlist.description}</p>
          <div className="flex items-center gap-2 text-sm text-white/50 justify-center md:justify-start">
            <span className="font-medium text-white">{playlist.owner}</span>
            <span>•</span>
            <span>{playlist.tracks.length} songs</span>
            <span>•</span>
            <span>{formatDuration(totalDuration)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handlePlayAll}
          className="w-14 h-14 rounded-full gradient-accent flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
        >
          {isCurrentPlaylist && isPlaying ? (
            <Pause className="w-6 h-6 text-white fill-white" />
          ) : (
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          )}
        </button>
        <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white">
          <Shuffle className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
          }}
          className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
        >
          <Share2 className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Track List */}
      <div className="space-y-0">
        {/* Header */}
        <div className="grid grid-cols-[2rem_1fr_1fr_4rem] md:grid-cols-[2rem_2fr_1fr_1fr_4rem] gap-4 px-4 py-2 border-b border-white/5 text-xs text-white/40 uppercase tracking-wider">
          <span>#</span>
          <span>Title</span>
          <span className="hidden md:block">Album</span>
          <span className="hidden md:block"><Clock className="w-4 h-4" /></span>
          <span></span>
        </div>

        {/* Tracks */}
        {playlistTracks.map((track, i) => (
          track && (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => playTrack(track, playlistTracks as NonNullable<ReturnType<typeof getTrackById>>[])}
              className="grid grid-cols-[2rem_1fr_1fr_4rem] md:grid-cols-[2rem_2fr_1fr_1fr_4rem] gap-4 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer items-center"
            >
              <span className="text-sm text-white/40 group-hover:hidden">{i + 1}</span>
              <Play className="w-4 h-4 text-white hidden group-hover:block" />
              <div className="flex items-center gap-3 min-w-0">
                <img src={track.cover} alt={track.title} className="w-10 h-10 rounded object-cover shrink-0" />
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate ${currentTrack?.id === track.id ? 'text-violet-400' : ''}`}>
                    {track.title}
                  </p>
                  <p className="text-xs text-white/50 truncate">{track.artist}</p>
                </div>
              </div>
              <span className="text-sm text-white/50 truncate hidden md:block">{track.album}</span>
              <span className="text-sm text-white/40 hidden md:block">{formatTime(track.duration)}</span>
              <button
                onClick={(e) => { e.stopPropagation(); toggleLike(track.id); }}
                className="justify-self-end"
              >
                <Heart
                  className={`w-4 h-4 transition-all ${
                    isLiked(track.id) ? 'text-violet-400 fill-violet-400' : 'text-transparent group-hover:text-white/40'
                  }`}
                />
              </button>
            </motion.div>
          )
        ))}
      </div>
    </motion.div>
  );
}
