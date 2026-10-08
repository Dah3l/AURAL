import { useRef, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Heart, Volume2, VolumeX, Volume1, Maximize2, Minimize2, ListMusic, X, PlusCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { usePlayerStore } from '../../store/playerStore';
import { useLibraryStore } from '../../store/libraryStore';
import { formatTime } from '../../lib/utils';
import { AuralLogo } from '../shared/AuralLogo';

export function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [addingToPlaylistId, setAddingToPlaylistId] = useState<string | null>(null);
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const {
    currentTrack, queue, queueIndex, isPlaying, progress, duration, volume, isMuted,
    shuffle, repeat, showQueue, showExpanded,
    togglePlay, nextTrack, prevTrack, setProgress, setDuration,
    setVolume, toggleMute, toggleShuffle, cycleRepeat,
    toggleQueue, toggleExpanded, playTrack,
  } = usePlayerStore();
  const { toggleLike, isLiked, addToHistory, playlists, addTrackToPlaylist, createPlaylist } = useLibraryStore();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    audio.src = currentTrack.audioUrl;
    if (isPlaying) audio.play().catch(() => {});
    addToHistory(currentTrack.id);
  }, [currentTrack?.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          if (audioRef.current) audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 5, duration);
          break;
        case 'ArrowLeft':
          if (audioRef.current) audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 5, 0);
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
    if (audio) setProgress(audio.currentTime);
  }, [setProgress]);

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (audio) setDuration(audio.duration);
  }, [setDuration]);

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setProgress(value);
    if (audioRef.current) audioRef.current.currentTime = value;
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
      <div className="h-20 bg-[#08080C] border-t border-[#2A2A35] flex items-center justify-center gap-3">
        <AuralLogo size={20} />
        <p className="text-[#8B8B96] text-sm">Elige algo para empezar a escuchar</p>
      </div>
    );
  }

  const liked = isLiked(currentTrack.id);
  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const progressPercent = duration ? (progress / duration) * 100 : 0;

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Vista expandida */}
      <AnimatePresence>
        {showExpanded && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[60] bg-[#08080C] flex flex-col"
          >
            <div className="flex items-center justify-between p-4">
              <button onClick={toggleExpanded} className="p-2 rounded-full hover:bg-[#1E1E26]">
                <Minimize2 className="w-5 h-5 text-[#8B8B96]" strokeWidth={1.75} />
              </button>
              <div className="flex items-center gap-2">
                <AuralLogo size={18} />
                <span className="text-sm text-[#8B8B96] font-medium">Reproduciendo</span>
              </div>
              <button 
                onClick={toggleQueue} 
                className={`p-2 rounded-full hover:bg-[#1E1E26] transition-colors ${showQueue ? 'text-[#A78BFA]' : 'text-[#8B8B96]'}`}
              >
                <ListMusic className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-8">
              <motion.img
                key={currentTrack.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={currentTrack.cover}
                alt={currentTrack.title}
                className="w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-2xl object-cover shadow-2xl mb-6 md:mb-8 ring-1 ring-[#2A2A35]"
              />
              <h2 className="text-xl sm:text-2xl font-bold mb-1 text-[#F5F5F7] text-center px-4">{currentTrack.title}</h2>
              <p className="text-[#8B8B96] text-base sm:text-lg text-center mb-4">{currentTrack.artist}</p>
              
              {/* Botones de acción */}
              <div className="flex items-center gap-6">
                <button
                  onClick={() => toggleLike(currentTrack.id)}
                  className="p-3 rounded-full hover:bg-[#1E1E26] transition-colors"
                  aria-label={liked ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                >
                  <Heart
                    className={`w-6 h-6 transition-all ${liked ? 'text-[#A78BFA] fill-[#A78BFA]' : 'text-[#8B8B96] hover:text-[#F5F5F7]'}`}
                    strokeWidth={1.75}
                  />
                </button>
                <button
                  onClick={() => setShowPlaylistModal(true)}
                  className="p-3 rounded-full hover:bg-[#1E1E26] transition-colors"
                  aria-label="Añadir a playlist"
                >
                  <PlusCircle className="w-6 h-6 text-[#8B8B96] hover:text-[#F5F5F7]" strokeWidth={1.75} />
                </button>
              </div>
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
                  style={{ background: `linear-gradient(to right, #7C3AED ${progressPercent}%, #2A2A35 ${progressPercent}%)` }}
                />
                <div className="flex justify-between text-xs text-[#8B8B96] mt-1 font-mono">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-6">
                <button onClick={toggleShuffle} className={shuffle ? 'text-[#A78BFA]' : 'text-[#8B8B96]'}>
                  <Shuffle className="w-5 h-5" strokeWidth={1.75} />
                </button>
                <button onClick={prevTrack} className="text-[#F5F5F7] hover:text-[#A78BFA]">
                  <SkipBack className="w-6 h-6 fill-current" strokeWidth={1.75} />
                </button>
                <button
                  onClick={togglePlay}
                  className="w-14 h-14 rounded-full gradient-aura-glow flex items-center justify-center hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause className="w-6 h-6 text-white fill-white" /> : <Play className="w-6 h-6 text-white fill-white ml-0.5" />}
                </button>
                <button onClick={nextTrack} className="text-[#F5F5F7] hover:text-[#A78BFA]">
                  <SkipForward className="w-6 h-6 fill-current" strokeWidth={1.75} />
                </button>
                <button onClick={cycleRepeat} className={repeat !== 'off' ? 'text-[#A78BFA]' : 'text-[#8B8B96]'}>
                  {repeat === 'one' ? <Repeat1 className="w-5 h-5" strokeWidth={1.75} /> : <Repeat className="w-5 h-5" strokeWidth={1.75} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cola de reproducción - Mobile First */}
      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-[#08080C] border-l border-[#2A2A35] z-[70] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-[#2A2A35]">
              <h3 className="font-semibold text-[#F5F5F7]">Cola</h3>
              <button onClick={toggleQueue} className="p-2 rounded-full hover:bg-[#1E1E26]">
                <X className="w-5 h-5 text-[#8B8B96]" strokeWidth={1.75} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {currentTrack && (
                <div className="mb-4">
                  <p className="text-[11px] text-[#8B8B96] uppercase tracking-wider px-2 mb-2 font-medium">Ahora suena</p>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-[#7C3AED]/10 border border-[#7C3AED]/20">
                    <img src={currentTrack.cover} alt={currentTrack.title} className="w-10 h-10 rounded object-cover" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate text-[#A78BFA]">{currentTrack.title}</p>
                      <p className="text-xs text-[#8B8B96] truncate">{currentTrack.artist}</p>
                    </div>
                  </div>
                </div>
              )}
              <p className="text-[11px] text-[#8B8B96] uppercase tracking-wider px-2 mb-2 font-medium">A continuación</p>
              {queue.slice(queueIndex + 1, queueIndex + 20).map((track, i) => (
                <div
                  key={`${track.id}-${i}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1E1E26] transition-colors cursor-pointer"
                  onClick={() => playTrack(track)}
                >
                  <span className="text-xs text-[#8B8B96] w-4 font-mono">{i + 1}</span>
                  <img src={track.cover} alt={track.title} className="w-8 h-8 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate text-[#F5F5F7]">{track.title}</p>
                    <p className="text-xs text-[#8B8B96] truncate">{track.artist}</p>
                  </div>
                </div>
              ))}
              {queueIndex + 1 >= queue.length && (
                <p className="text-sm text-[#8B8B96] text-center py-4 italic">Se acabó. ¿Otra vuelta?</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barra del reproductor - Web Layout */}
      <div className="bg-[#08080C]/98 backdrop-blur-xl border-t border-[#2A2A35]">
        {/* Layout Desktop - 3 columnas */}
        <div className="hidden md:flex items-center gap-4 px-4 h-[90px]">
          {/* Columna 1: Cover + Info */}
          <div 
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
            onClick={toggleExpanded}
          >
            <motion.img
              key={currentTrack.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={currentTrack.cover}
              alt={currentTrack.title}
              className="w-14 h-14 rounded-lg object-cover ring-1 ring-[#2A2A35] shrink-0 group-hover:ring-[#7C3AED]/50 transition-all"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate text-[#F5F5F7] group-hover:text-[#A78BFA] transition-colors">
                {currentTrack.title}
              </p>
              <p className="text-xs text-[#8B8B96] truncate">{currentTrack.artist}</p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); toggleLike(currentTrack.id); }} 
              className="shrink-0 p-1.5"
              aria-label={liked ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            >
              <Heart
                className={`w-4 h-4 transition-all ${liked ? 'text-[#A78BFA] fill-[#A78BFA]' : 'text-[#8B8B96] hover:text-[#F5F5F7]'}`}
                strokeWidth={1.75}
              />
            </button>
          </div>

          {/* Columna 2: Controles */}
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleShuffle}
              className={`transition-colors ${shuffle ? 'text-[#A78BFA]' : 'text-[#8B8B96] hover:text-[#F5F5F7]'}`}
              aria-label="Aleatorio"
            >
              <Shuffle className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <button 
              onClick={prevTrack} 
              className="text-[#8B8B96] hover:text-[#F5F5F7] transition-colors p-1"
              aria-label="Anterior"
            >
              <SkipBack className="w-5 h-5 fill-current" strokeWidth={1.75} />
            </button>
            <button
              onClick={togglePlay}
              className="w-11 h-11 rounded-full gradient-aura-glow flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white fill-white" />
              ) : (
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              )}
            </button>
            <button 
              onClick={nextTrack} 
              className="text-[#8B8B96] hover:text-[#F5F5F7] transition-colors p-1"
              aria-label="Siguiente"
            >
              <SkipForward className="w-5 h-5 fill-current" strokeWidth={1.75} />
            </button>
            <button 
              onClick={cycleRepeat}
              className={`transition-colors ${repeat !== 'off' ? 'text-[#A78BFA]' : 'text-[#8B8B96] hover:text-[#F5F5F7]'}`}
              aria-label={repeat === 'one' ? 'Repetir una' : repeat === 'all' ? 'Repetir todo' : 'No repetir'}
            >
              {repeat === 'one' ? <Repeat1 className="w-4 h-4" strokeWidth={1.75} /> : <Repeat className="w-4 h-4" strokeWidth={1.75} />}
            </button>
          </div>

          {/* Columna 3: Extras */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            <button 
              onClick={toggleQueue} 
              className={`transition-colors ${showQueue ? 'text-[#A78BFA]' : 'text-[#8B8B96] hover:text-[#F5F5F7]'}`}
              aria-label="Cola de reproducción"
            >
              <ListMusic className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <button 
              onClick={toggleMute} 
              className="text-[#8B8B96] hover:text-[#F5F5F7] transition-colors"
              aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              <VolumeIcon className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24 h-1"
              aria-label="Volumen"
              style={{ background: `linear-gradient(to right, #7C3AED ${(isMuted ? 0 : volume) * 100}%, #2A2A35 ${(isMuted ? 0 : volume) * 100}%)` }}
            />
            <button 
              onClick={toggleExpanded} 
              className="text-[#8B8B96] hover:text-[#F5F5F7] transition-colors"
              aria-label="Pantalla completa"
            >
              <Maximize2 className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Layout Móvil - Simétrico */}
        <div className="md:hidden flex flex-col">
          {/* Fila 1: Cover + Info */}
          <div 
            className="flex items-center gap-2 px-3 pt-2 cursor-pointer"
            onClick={toggleExpanded}
          >
            <motion.img
              key={currentTrack.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={currentTrack.cover}
              alt={currentTrack.title}
              className="w-9 h-9 rounded object-cover ring-1 ring-[#2A2A35] shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate text-[#F5F5F7]">
                {currentTrack.title}
              </p>
              <p className="text-[10px] text-[#8B8B96] truncate">{currentTrack.artist}</p>
            </div>
          </div>

          {/* Fila 2: Controles simétricos */}
          <div className="flex items-center justify-between px-6 py-2">
            <button 
              onClick={() => toggleLike(currentTrack.id)}
              className="w-9 h-9 flex items-center justify-center"
              aria-label={liked ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            >
              <Heart
                className={`w-5 h-5 transition-all ${liked ? 'text-[#A78BFA] fill-[#A78BFA]' : 'text-[#8B8B96]'}`}
                strokeWidth={1.75}
              />
            </button>
            <button 
              onClick={prevTrack} 
              className="w-9 h-9 flex items-center justify-center text-[#8B8B96] hover:text-[#F5F5F7] transition-colors"
              aria-label="Anterior"
            >
              <SkipBack className="w-5 h-5 fill-current" strokeWidth={1.75} />
            </button>
            <button
              onClick={togglePlay}
              className="w-11 h-11 rounded-full gradient-aura-glow flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white fill-white" />
              ) : (
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              )}
            </button>
            <button 
              onClick={nextTrack} 
              className="w-9 h-9 flex items-center justify-center text-[#8B8B96] hover:text-[#F5F5F7] transition-colors"
              aria-label="Siguiente"
            >
              <SkipForward className="w-5 h-5 fill-current" strokeWidth={1.75} />
            </button>
            <button 
              onClick={toggleQueue}
              className="w-9 h-9 flex items-center justify-center"
              aria-label="Cola de reproducción"
            >
              <ListMusic className={`w-5 h-5 transition-colors ${showQueue ? 'text-[#A78BFA]' : 'text-[#8B8B96]'}`} strokeWidth={1.75} />
            </button>
          </div>

          {/* Barra de progreso móvil */}
          <div className="px-3 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#8B8B96] w-9 text-right font-mono shrink-0">
                {formatTime(progress)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 1}
                value={progress}
                onChange={handleProgressChange}
                className="flex-1 h-1"
                style={{ background: `linear-gradient(to right, #7C3AED ${progressPercent}%, #2A2A35 ${progressPercent}%)` }}
              />
              <span className="text-[10px] text-[#8B8B96] w-9 font-mono shrink-0">
                {duration > 0 ? formatTime(duration) : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Barra de progreso desktop */}
        <div className="hidden md:block px-4 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#8B8B96] w-10 text-right font-mono shrink-0">
              {formatTime(progress)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 1}
              value={progress}
              onChange={handleProgressChange}
              className="flex-1 h-1 hover:h-1.5 transition-all"
              style={{ background: `linear-gradient(to right, #7C3AED ${progressPercent}%, #2A2A35 ${progressPercent}%)` }}
            />
            <span className="text-[10px] text-[#8B8B96] w-10 font-mono shrink-0">
              {duration > 0 ? formatTime(duration) : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Modal de añadir a playlist */}
      <AnimatePresence>
        {showPlaylistModal && currentTrack && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => !addingToPlaylistId && setShowPlaylistModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[#131318] border border-[#2A2A35] rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b border-[#2A2A35]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-[#F5F5F7]">Añadir a playlist</h3>
                  {!addingToPlaylistId && (
                    <button
                      onClick={() => setShowPlaylistModal(false)}
                      className="p-1 rounded-full hover:bg-[#1E1E26] transition-colors"
                    >
                      <X className="w-5 h-5 text-[#8B8B96]" strokeWidth={1.75} />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <img
                    src={currentTrack.cover}
                    alt={currentTrack.title}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#F5F5F7] truncate">{currentTrack.title}</p>
                    <p className="text-xs text-[#8B8B96] truncate">{currentTrack.artist}</p>
                  </div>
                </div>
              </div>

              {/* Lista de playlists */}
              <div className="max-h-80 overflow-y-auto p-2">
                {playlists.length === 0 ? (
                  <div className="text-center py-8">
                    <ListMusic className="w-12 h-12 text-[#8B8B96]/30 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-[#8B8B96]">No tienes playlists</p>
                    <p className="text-sm text-[#8B8B96]/60 mt-1">Crea una para empezar</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {playlists.map((playlist) => {
                      const isAdding = addingToPlaylistId === playlist.id;
                      return (
                        <button
                          key={playlist.id}
                          disabled={!!addingToPlaylistId}
                          onClick={async () => {
                            setAddingToPlaylistId(playlist.id);
                            const { error } = await addTrackToPlaylist(playlist.id, currentTrack.id);
                            if (error) {
                              toast.error(error);
                              setAddingToPlaylistId(null);
                            } else {
                              toast.success(`Añadida a "${playlist.title}"`);
                              setAddingToPlaylistId(null);
                              setShowPlaylistModal(false);
                            }
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#1E1E26] transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isAdding ? (
                            <div className="w-10 h-10 rounded bg-[#1E1E26] flex items-center justify-center shrink-0">
                              <div className="w-5 h-5 border-2 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin" />
                            </div>
                          ) : playlist.cover_url ? (
                            <img
                              src={playlist.cover_url}
                              alt={playlist.title}
                              className="w-10 h-10 rounded object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gradient-to-br from-[#7C3AED] to-[#EC4899] flex items-center justify-center shrink-0">
                              <ListMusic className="w-5 h-5 text-white" strokeWidth={1.75} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#F5F5F7] truncate">{playlist.title}</p>
                            <p className="text-xs text-[#8B8B96] truncate">
                              {isAdding ? 'Añadiendo...' : (playlist.description || 'Playlist')}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer - Crear nueva playlist */}
              <div className="p-3 border-t border-[#2A2A35]">
                <button
                  disabled={!!addingToPlaylistId}
                  onClick={() => {
                    setShowPlaylistModal(false);
                    setShowCreatePlaylistModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-[#1E1E26] hover:bg-[#2A2A35] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusCircle className="w-5 h-5 text-[#A78BFA]" strokeWidth={1.75} />
                  <span className="text-sm font-medium text-[#F5F5F7]">Crear nueva playlist</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de crear nueva playlist */}
      <AnimatePresence>
        {showCreatePlaylistModal && currentTrack && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => !creatingPlaylist && setShowCreatePlaylistModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[#131318] border border-[#2A2A35] rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b border-[#2A2A35]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-[#F5F5F7]">Crear nueva playlist</h3>
                  {!creatingPlaylist && (
                    <button
                      onClick={() => {
                        setShowCreatePlaylistModal(false);
                        setShowPlaylistModal(true);
                        setNewPlaylistTitle('');
                        setNewPlaylistDescription('');
                      }}
                      className="p-1 rounded-full hover:bg-[#1E1E26] transition-colors"
                    >
                      <X className="w-5 h-5 text-[#8B8B96]" strokeWidth={1.75} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-[#8B8B96]">
                  La canción actual se añadirá automáticamente a esta nueva playlist
                </p>
              </div>

              {/* Form */}
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#8B8B96] mb-1.5">
                    Nombre de la playlist
                  </label>
                  <input
                    type="text"
                    value={newPlaylistTitle}
                    onChange={(e) => setNewPlaylistTitle(e.target.value)}
                    placeholder="Mi playlist"
                    disabled={creatingPlaylist}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#1E1E26] border border-[#2A2A35] text-[#F5F5F7] placeholder:text-[#8B8B96]/50 focus:outline-none focus:border-[#7C3AED]/50 transition-all disabled:opacity-50"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#8B8B96] mb-1.5">
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={newPlaylistDescription}
                    onChange={(e) => setNewPlaylistDescription(e.target.value)}
                    placeholder="¿De qué trata esta playlist?"
                    disabled={creatingPlaylist}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#1E1E26] border border-[#2A2A35] text-[#F5F5F7] placeholder:text-[#8B8B96]/50 focus:outline-none focus:border-[#7C3AED]/50 transition-all resize-none disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[#2A2A35] flex gap-3">
                <button
                  disabled={creatingPlaylist}
                  onClick={() => {
                    setShowCreatePlaylistModal(false);
                    setShowPlaylistModal(true);
                    setNewPlaylistTitle('');
                    setNewPlaylistDescription('');
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-[#1E1E26] hover:bg-[#2A2A35] transition-colors text-[#8B8B96] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  disabled={creatingPlaylist || !newPlaylistTitle.trim()}
                  onClick={async () => {
                    if (!newPlaylistTitle.trim() || !currentTrack) return;
                    
                    setCreatingPlaylist(true);
                    const { error, playlistId } = await createPlaylist(
                      newPlaylistTitle,
                      newPlaylistDescription
                    );
                    
                    if (error) {
                      toast.error(error);
                      setCreatingPlaylist(false);
                    } else if (playlistId) {
                      // Agregar la canción actual a la nueva playlist
                      const { error: addError } = await addTrackToPlaylist(playlistId, currentTrack.id);
                      
                      if (addError) {
                        toast.error(addError);
                      } else {
                        toast.success(`Playlist creada y canción añadida`);
                      }
                      
                      setCreatingPlaylist(false);
                      setShowCreatePlaylistModal(false);
                      setNewPlaylistTitle('');
                      setNewPlaylistDescription('');
                    }
                  }}
                  className="flex-1 py-2.5 rounded-lg gradient-aura-glow text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creatingPlaylist ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creando...</span>
                    </>
                  ) : (
                    'Crear playlist'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
