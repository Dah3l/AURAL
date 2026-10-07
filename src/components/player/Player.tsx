import { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Heart, Volume2, VolumeX, Volume1, Maximize2, Minimize2, ListMusic, X
} from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { useLibraryStore } from '../../store/libraryStore';
import { formatTime } from '../../lib/utils';

export function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLInputElement>(null);
  const {
    currentTrack, queue, queueIndex, isPlaying, progress, duration, volume, isMuted,
    shuffle, repeat, showQueue, showExpanded,
    togglePlay, nextTrack, prevTrack, setProgress, setDuration,
    setVolume, toggleMute, toggleShuffle, cycleRepeat,
    toggleQueue, toggleExpanded, playTrack,
  } = usePlayerStore();
  const { toggleLike, isLiked, addToRecentlyPlayed } = useLibraryStore();

  // Audio element control
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    audio.src = currentTrack.audioUrl;
    if (isPlaying) {
      audio.play().catch(() => {});
    }
    addToRecentlyPlayed(currentTrack.id);
  }, [currentTrack?.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          if (audioRef.current) {
            audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 5, duration);
          }
          break;
        case 'ArrowLeft':
          if (audioRef.current) {
            audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 5, 0);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(volume + 0.05, 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(volume - 0.05, 0));
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, volume, duration, setVolume]);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      setProgress(audio.currentTime);
    }
  }, [setProgress]);

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      setDuration(audio.duration);
    }
  }, [setDuration]);

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setProgress(value);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
    }
  };

  const handleEnded = useCallback(() => {
    if (repeat === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } else {
      nextTrack();
    }
  }, [repeat, nextTrack]);

  if (!currentTrack) {
    return (
      <div className="h-20 bg-[#0A0A0A] border-t border-white/5 flex items-center justify-center">
        <p className="text-white/30 text-sm">Select a track to start playing</p>
      </div>
    );
  }

  const liked = isLiked(currentTrack.id);
  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Expanded Player */}
      <AnimatePresence>
        {showExpanded && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-50 bg-[#0A0A0A] flex flex-col"
          >
            <div className="flex items-center justify-between p-4">
              <button onClick={toggleExpanded} className="p-2 rounded-full hover:bg-white/10">
                <Minimize2 className="w-5 h-5 text-white/70" />
              </button>
              <p className="text-sm text-white/60 font-medium">Now Playing</p>
              <button onClick={toggleQueue} className="p-2 rounded-full hover:bg-white/10">
                <ListMusic className="w-5 h-5 text-white/70" />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-8">
              <motion.img
                key={currentTrack.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={currentTrack.cover}
                alt={currentTrack.title}
                className="w-64 h-64 md:w-80 md:h-80 rounded-2xl object-cover shadow-2xl mb-8"
              />
              <h2 className="text-2xl font-bold mb-1">{currentTrack.title}</h2>
              <p className="text-white/60 text-lg">{currentTrack.artist}</p>
            </div>

            <div className="px-8 pb-8">
              <div className="mb-4">
                <input
                  type="range"
                  min={0}
                  max={duration || 1}
                  value={progress}
                  onChange={handleProgressChange}
                  className="w-full"
                  style={{ background: `linear-gradient(to right, #8B5CF6 ${(progress / (duration || 1)) * 100}%, #333 ${(progress / (duration || 1)) * 100}%)` }}
                />
                <div className="flex justify-between text-xs text-white/40 mt-1">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-6">
                <button onClick={toggleShuffle} className={shuffle ? 'text-violet-400' : 'text-white/60'}>
                  <Shuffle className="w-5 h-5" />
                </button>
                <button onClick={prevTrack} className="text-white hover:text-white/80">
                  <SkipBack className="w-6 h-6 fill-current" />
                </button>
                <button
                  onClick={togglePlay}
                  className="w-14 h-14 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause className="w-6 h-6 text-black fill-black" /> : <Play className="w-6 h-6 text-black fill-black ml-0.5" />}
                </button>
                <button onClick={nextTrack} className="text-white hover:text-white/80">
                  <SkipForward className="w-6 h-6 fill-current" />
                </button>
                <button onClick={cycleRepeat} className={repeat !== 'off' ? 'text-violet-400' : 'text-white/60'}>
                  {repeat === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Queue Panel */}
      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-20 w-80 bg-[#121212] border-l border-white/5 z-40 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h3 className="font-bold">Queue</h3>
              <button onClick={toggleQueue} className="p-1 rounded-full hover:bg-white/10">
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {currentTrack && (
                <div className="mb-4">
                  <p className="text-xs text-white/40 uppercase tracking-wider px-2 mb-2">Now Playing</p>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                    <img src={currentTrack.cover} alt={currentTrack.title} className="w-10 h-10 rounded object-cover" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate text-violet-400">{currentTrack.title}</p>
                      <p className="text-xs text-white/50 truncate">{currentTrack.artist}</p>
                    </div>
                  </div>
                </div>
              )}
              <p className="text-xs text-white/40 uppercase tracking-wider px-2 mb-2">Next Up</p>
              {queue.slice(queueIndex + 1, queueIndex + 20).map((track, i) => (
                <div key={`${track.id}-${i}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer" onClick={() => playTrack(track)}>
                  <span className="text-xs text-white/40 w-4">{i + 1}</span>
                  <img src={track.cover} alt={track.title} className="w-8 h-8 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{track.title}</p>
                    <p className="text-xs text-white/50 truncate">{track.artist}</p>
                  </div>
                </div>
              ))}
              {queueIndex + 1 >= queue.length && (
                <p className="text-sm text-white/30 text-center py-4">No more tracks in queue</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Player Bar */}
      <div className="h-20 bg-[#0A0A0A] border-t border-white/5 px-2 md:px-4 flex items-center gap-2 md:gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 w-1/4 min-w-0">
          <motion.img
            key={currentTrack.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={currentTrack.cover}
            alt={currentTrack.title}
            className="w-12 h-12 md:w-14 md:h-14 rounded-lg object-cover cursor-pointer"
            onClick={toggleExpanded}
          />
          <div className="min-w-0 hidden sm:block">
            <p className="text-sm font-medium truncate hover:underline cursor-pointer" onClick={toggleExpanded}>
              {currentTrack.title}
            </p>
            <p className="text-xs text-white/50 truncate">{currentTrack.artist}</p>
          </div>
          <button
            onClick={() => toggleLike(currentTrack.id)}
            className="hidden sm:block shrink-0"
          >
            <Heart
              className={`w-4 h-4 transition-all ${liked ? 'text-violet-400 fill-violet-400' : 'text-white/40 hover:text-white'}`}
            />
          </button>
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-xl">
          <div className="flex items-center gap-3 md:gap-5 mb-1">
            <button
              onClick={toggleShuffle}
              className={`hidden md:block transition-colors ${shuffle ? 'text-violet-400' : 'text-white/50 hover:text-white'}`}
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button onClick={prevTrack} className="text-white/70 hover:text-white transition-colors">
              <SkipBack className="w-4 h-4 md:w-5 md:h-5 fill-current" />
            </button>
            <button
              onClick={togglePlay}
              className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 md:w-5 md:h-5 text-black fill-black" />
              ) : (
                <Play className="w-4 h-4 md:w-5 md:h-5 text-black fill-black ml-0.5" />
              )}
            </button>
            <button onClick={nextTrack} className="text-white/70 hover:text-white transition-colors">
              <SkipForward className="w-4 h-4 md:w-5 md:h-5 fill-current" />
            </button>
            <button
              onClick={cycleRepeat}
              className={`hidden md:block transition-colors ${repeat !== 'off' ? 'text-violet-400' : 'text-white/50 hover:text-white'}`}
            >
              {repeat === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </button>
          </div>
          <div className="w-full flex items-center gap-2">
            <span className="text-[10px] text-white/40 w-8 text-right">{formatTime(progress)}</span>
            <input
              ref={progressRef}
              type="range"
              min={0}
              max={duration || 1}
              value={progress}
              onChange={handleProgressChange}
              className="flex-1 h-1"
              style={{ background: `linear-gradient(to right, #8B5CF6 ${(progress / (duration || 1)) * 100}%, #333 ${(progress / (duration || 1)) * 100}%)` }}
            />
            <span className="text-[10px] text-white/40 w-8">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & extras */}
        <div className="w-1/4 flex items-center justify-end gap-2 md:gap-3">
          <button onClick={toggleQueue} className="hidden md:block text-white/50 hover:text-white transition-colors">
            <ListMusic className="w-4 h-4" />
          </button>
          <button onClick={toggleExpanded} className="hidden md:block text-white/50 hover:text-white transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button onClick={toggleMute} className="text-white/50 hover:text-white transition-colors">
            <VolumeIcon className="w-4 h-4" />
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="hidden md:block w-20 h-1"
            style={{ background: `linear-gradient(to right, #8B5CF6 ${(isMuted ? 0 : volume) * 100}%, #333 ${(isMuted ? 0 : volume) * 100}%)` }}
          />
        </div>
      </div>
    </>
  );
}
