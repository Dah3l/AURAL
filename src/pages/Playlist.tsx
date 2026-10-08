import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Heart, Share2, Clock, MoreHorizontal, Shuffle, Music2, Edit2, Trash2, X, Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { supabase } from '../lib/supabase';
import { getTrackById as getJamendoTrack, getAlbumTracks } from '../lib/jamendo';
import { jamendoTrackToTrack, jamendoTracksToTracks } from '../lib/adapters';
import { formatDuration, formatTime } from '../lib/utils';
import { usePagination } from '../hooks/usePagination';
import { LoadMoreButton } from '../components/shared/LoadMoreButton';
import type { Track } from '../types';
import type { Playlist } from '../types/database';

export function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const { toggleLike, isLiked, getPlaylistTracks, updatePlaylist, deletePlaylist, toggleSaveAlbum, isAlbumSaved } = useLibraryStore();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para menú de opciones
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Estados para editar playlist
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [updating, setUpdating] = useState(false);
  
  // Estados para eliminar playlist
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Paginación para tracks de la playlist
  const {
    visibleItems: visiblePlaylistTracks,
    hasMore: hasMorePlaylistTracks,
    loadMore: loadMorePlaylistTracks,
    visibleCount: playlistVisibleCount,
    totalItems: playlistTotalCount,
    reset: resetPlaylistPagination,
  } = usePagination(playlistTracks, { itemsPerPage: 15, loadMoreCount: 10 });

  useEffect(() => {
    async function loadPlaylist() {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Detectar si es un álbum de Jamendo
        if (id.startsWith('jamendo-album-')) {
          const jamendoAlbumId = id.replace('jamendo-album-', '');
          
          // Cargar tracks del álbum desde Jamendo
          const jamendoTracks = await getAlbumTracks(jamendoAlbumId);
          const tracks = jamendoTracksToTracks(jamendoTracks);
          
          if (tracks.length === 0) {
            setPlaylist(null);
            return;
          }
          
          // Construir un objeto playlist compatible usando datos del primer track
          const firstTrack = tracks[0];
          const mockPlaylist: Playlist = {
            id: id,
            user_id: '',
            title: firstTrack.album,
            description: `Álbum de ${firstTrack.artist}`,
            cover_url: firstTrack.cover,
            is_public: true,
            created_at: new Date().toISOString(),
          };
          
          setPlaylist(mockPlaylist);
          setPlaylistTracks(tracks);
          return;
        }
        
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

  // Resetear paginación cuando cambian los tracks
  useEffect(() => {
    resetPlaylistPagination();
  }, [playlistTracks.length, resetPlaylistPagination]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  // Función para abrir modal de editar
  const handleOpenEdit = () => {
    if (!playlist) return;
    setEditTitle(playlist.title);
    setEditDescription(playlist.description || '');
    setShowMenu(false);
    setShowEditModal(true);
  };

  // Función para editar playlist
  const handleEditPlaylist = async () => {
    if (!playlist || !editTitle.trim()) {
      toast.error('El título es obligatorio');
      return;
    }

    setUpdating(true);
    try {
      const { error } = await updatePlaylist(playlist.id, {
        title: editTitle,
        description: editDescription,
      });

      if (error) {
        toast.error(error);
      } else {
        toast.success('Playlist actualizada');
        setShowEditModal(false);
        // Recargar la playlist
        setPlaylist({ ...playlist, title: editTitle, description: editDescription });
      }
    } catch (error) {
      toast.error('Algo se desafinó. Intenta de nuevo.');
    } finally {
      setUpdating(false);
    }
  };

  // Función para abrir modal de eliminar
  const handleOpenDelete = () => {
    setShowMenu(false);
    setShowDeleteModal(true);
  };

  // Función para eliminar playlist
  const handleDeletePlaylist = async () => {
    if (!playlist) return;

    setDeleting(true);
    try {
      const { error } = await deletePlaylist(playlist.id);

      if (error) {
        toast.error(error);
      } else {
        toast.success('Playlist eliminada');
        setShowDeleteModal(false);
        navigate('/library');
      }
    } catch (error) {
      toast.error('Algo se desafinó. Intenta de nuevo.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="pb-8">
        {/* Skeleton header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-xl bg-[#131318] animate-pulse shrink-0" />
          <div className="text-center sm:text-left flex-1">
            <div className="h-3 w-16 bg-[#131318] rounded mb-2 animate-pulse mx-auto sm:mx-0" />
            <div className="h-8 sm:h-10 md:h-12 w-full max-w-md bg-[#131318] rounded mb-2 animate-pulse" />
            <div className="h-4 w-full max-w-sm bg-[#131318] rounded mb-2 animate-pulse mx-auto sm:mx-0" />
            <div className="h-4 w-32 bg-[#131318] rounded animate-pulse mx-auto sm:mx-0" />
          </div>
        </div>
        
        {/* Skeleton acciones */}
        <div className="flex items-center gap-2.5 md:gap-3 mb-5 md:mb-6">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#131318] animate-pulse" />
          <div className="w-9 h-9 rounded-full bg-[#131318] animate-pulse" />
          <div className="w-9 h-9 rounded-full bg-[#131318] animate-pulse" />
        </div>
        
        {/* Skeleton tracks */}
        <div className="space-y-1">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <div className="w-5 h-5 bg-[#131318] rounded animate-pulse" />
              <div className="w-10 h-10 bg-[#131318] rounded animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-48 bg-[#131318] rounded animate-pulse mb-1" />
                <div className="h-3 w-32 bg-[#131318] rounded animate-pulse" />
              </div>
              <div className="w-4 h-4 bg-[#131318] rounded animate-pulse" />
              <div className="w-10 h-3 bg-[#131318] rounded animate-pulse" />
            </div>
          ))}
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

  const isJamendoAlbum = id?.startsWith('jamendo-album-');
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
          <p className="text-[11px] uppercase tracking-[0.15em] text-[#8B8B96] font-medium mb-1.5 md:mb-2">{isJamendoAlbum ? 'Álbum' : 'Playlist'}</p>
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
        
        {/* Botón guardar álbum (solo para álbumes de Jamendo) */}
        {isJamendoAlbum && (
          <button
            onClick={() => {
              const wasSaved = isAlbumSaved(id!);
              toggleSaveAlbum(id!, playlist.title, playlist.cover_url, playlist.description?.replace('Álbum de ', '') || '');
              toast.success(
                wasSaved 
                  ? `"${playlist.title}" eliminado de tu colección` 
                  : `"${playlist.title}" guardado en tu colección`
              );
            }}
            className={`p-2 rounded-full transition-colors ${
              isAlbumSaved(id!) 
                ? 'bg-[#7C3AED]/20 text-[#A78BFA] hover:bg-[#7C3AED]/30' 
                : 'hover:bg-[#1E1E26] active:bg-[#1E1E26] text-[#8B8B96] hover:text-[#F5F5F7]'
            }`}
          >
            <Bookmark 
              className={`w-5 h-5 ${isAlbumSaved(id!) ? 'fill-[#A78BFA]' : ''}`} 
              strokeWidth={1.75} 
            />
          </button>
        )}
        
        {/* Menú de opciones (solo para playlists de Supabase) */}
        {!isJamendoAlbum && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full hover:bg-[#1E1E26] active:bg-[#1E1E26] transition-colors text-[#8B8B96] hover:text-[#F5F5F7]"
            >
              <MoreHorizontal className="w-5 h-5" strokeWidth={1.75} />
            </button>
              
            {/* Menú dropdown */}
            <AnimatePresence mode="popLayout">
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.15 } }}
                  exit={{ opacity: 0, scale: 0.95, y: -5, transition: { duration: 0.1 } }}
                  className="absolute left-0 md:right-0 top-full mt-2 w-56 max-w-[calc(100vw-2rem)] bg-[#131318] border border-[#2A2A35] rounded-xl shadow-2xl overflow-hidden z-50"
                >
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Link copiado. Ya es de quien quieras.');
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1E1E26] transition-colors text-left"
                  >
                    <Share2 className="w-4 h-4 text-[#8B8B96]" strokeWidth={1.75} />
                    <span className="text-sm text-[#F5F5F7]">Compartir</span>
                  </button>
                  <button
                    onClick={handleOpenEdit}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1E1E26] transition-colors text-left"
                  >
                    <Edit2 className="w-4 h-4 text-[#8B8B96]" strokeWidth={1.75} />
                    <span className="text-sm text-[#F5F5F7]">Editar playlist</span>
                  </button>
                  <div className="border-t border-[#2A2A35]" />
                  <button
                    onClick={handleOpenDelete}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 transition-colors text-left"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" strokeWidth={1.75} />
                    <span className="text-sm text-red-400">Eliminar playlist</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
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

          {visiblePlaylistTracks.map((track, i) => (
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
          {visiblePlaylistTracks.map((track, i) => (
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

          {/* Botón cargar más */}
          <LoadMoreButton
            onClick={() => {
              setLoadingMore(true);
              setTimeout(() => {
                loadMorePlaylistTracks();
                setLoadingMore(false);
              }, 300);
            }}
            hasMore={hasMorePlaylistTracks}
            visibleCount={playlistVisibleCount}
            totalCount={playlistTotalCount}
            loading={loadingMore}
          />
        </div>
      )}

      {/* Modal de editar playlist */}
      <AnimatePresence mode="popLayout">
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => !updating && setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: { duration: 0.2, delay: 0.05 } }}
              exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.15 } }}
              className="w-full max-w-md bg-[#131318] border border-[#2A2A35] rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#F5F5F7]">Editar playlist</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 rounded-full hover:bg-[#1E1E26] transition-colors"
                >
                  <X className="w-5 h-5 text-[#8B8B96]" strokeWidth={1.75} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#8B8B96] mb-1.5">
                    Título
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Mi playlist"
                    disabled={updating}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1E1E26] border border-[#2A2A35] text-[#F5F5F7] placeholder:text-[#8B8B96]/50 focus:outline-none focus:border-[#7C3AED]/50 transition-all disabled:opacity-50"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#8B8B96] mb-1.5">
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="¿De qué trata esta playlist?"
                    rows={3}
                    disabled={updating}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1E1E26] border border-[#2A2A35] text-[#F5F5F7] placeholder:text-[#8B8B96]/50 focus:outline-none focus:border-[#7C3AED]/50 transition-all resize-none disabled:opacity-50"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowEditModal(false)}
                    disabled={updating}
                    className="flex-1 py-2.5 rounded-xl bg-[#1E1E26] border border-[#2A2A35] text-[#8B8B96] hover:text-[#F5F5F7] hover:bg-[#2A2A35] transition-all disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleEditPlaylist}
                    disabled={updating || !editTitle.trim()}
                    className="flex-1 py-2.5 rounded-xl gradient-aura-glow text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de eliminar playlist */}
      <AnimatePresence mode="popLayout">
        {showDeleteModal && playlist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => !deleting && setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: { duration: 0.2, delay: 0.05 } }}
              exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.15 } }}
              className="w-full max-w-md bg-[#131318] border border-[#2A2A35] rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#F5F5F7]">Eliminar playlist</h2>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="p-1 rounded-full hover:bg-[#1E1E26] transition-colors"
                >
                  <X className="w-5 h-5 text-[#8B8B96]" strokeWidth={1.75} />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1E1E26] border border-[#2A2A35] mb-4">
                  {playlist.cover_url ? (
                    <img src={playlist.cover_url} alt={playlist.title} className="w-12 h-12 rounded object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded bg-gradient-to-br from-[#7C3AED] to-[#EC4899] flex items-center justify-center shrink-0">
                      <Music2 className="w-5 h-5 text-white" strokeWidth={1.75} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#F5F5F7] truncate">{playlist.title}</p>
                    <p className="text-xs text-[#8B8B96] truncate">{playlist.description || 'Playlist'}</p>
                  </div>
                </div>
                <p className="text-sm text-[#8B8B96]">
                  ¿Estás seguro de que quieres eliminar esta playlist? Esta acción no se puede deshacer.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-[#1E1E26] border border-[#2A2A35] text-[#8B8B96] hover:text-[#F5F5F7] hover:bg-[#2A2A35] transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeletePlaylist}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 font-medium hover:bg-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
