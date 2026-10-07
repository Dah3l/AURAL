import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3X3, List, Music2, Disc3, Users, Heart, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { cn } from '../lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { getTrackById as getJamendoTrack } from '../lib/jamendo';
import { jamendoTrackToTrack } from '../lib/adapters';
import type { Track, Artist, Album } from '../types';

type Tab = 'playlists' | 'albums' | 'artists' | 'liked';
type View = 'grid' | 'list';

export function LibraryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('playlists');
  const [view, setView] = useState<View>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [creating, setCreating] = useState(false);
  
  const [likedTracksList, setLikedTracksList] = useState<Track[]>([]);
  const [artistsList, setArtistsList] = useState<Artist[]>([]);
  const [albumsList, setAlbumsList] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { playTrack } = usePlayerStore();
  const { playlists, likedTracks, createPlaylist, recentlyPlayed } = useLibraryStore();
  const navigate = useNavigate();

  // Cargar tracks favoritos
  useEffect(() => {
    async function loadLikedTracks() {
      if (likedTracks.length === 0) {
        setLikedTracksList([]);
        return;
      }

      const tracks: Track[] = [];
      for (const trackId of likedTracks) {
        try {
          const jamendoTrack = await getJamendoTrack(trackId.replace('jamendo-', ''));
          if (jamendoTrack) {
            tracks.push(jamendoTrackToTrack(jamendoTrack));
          }
        } catch (error) {
          console.error(`Error loading track ${trackId}:`, error);
        }
      }
      setLikedTracksList(tracks);
    }

    loadLikedTracks();
  }, [likedTracks]);

  // Cargar artistas y álbumes del historial
  useEffect(() => {
    async function loadHistoryData() {
      setLoading(true);
      
      if (recentlyPlayed.length === 0) {
        setArtistsList([]);
        setAlbumsList([]);
        setLoading(false);
        return;
      }

      const artistsMap = new Map<string, Artist>();
      const albumsMap = new Map<string, Album>();

      for (const trackId of recentlyPlayed.slice(0, 30)) {
        try {
          const jamendoTrack = await getJamendoTrack(trackId.replace('jamendo-', ''));
          if (jamendoTrack) {
            const track = jamendoTrackToTrack(jamendoTrack);
            
            // Agregar artista si no existe
            if (!artistsMap.has(track.artistId)) {
              artistsMap.set(track.artistId, {
                id: track.artistId,
                name: track.artist,
                image: track.cover,
                genre: 'Various',
                monthlyListeners: 0,
                verified: false,
                albums: [],
              });
            }
            
            // Agregar álbum si no existe
            if (!albumsMap.has(track.albumId)) {
              albumsMap.set(track.albumId, {
                id: track.albumId,
                title: track.album,
                artist: track.artist,
                artistId: track.artistId,
                cover: track.cover,
                year: 2024,
                tracks: [],
                type: 'album',
              });
            }
          }
        } catch (error) {
          console.error(`Error loading track ${trackId}:`, error);
        }
      }

      setArtistsList(Array.from(artistsMap.values()));
      setAlbumsList(Array.from(albumsMap.values()));
      setLoading(false);
    }

    loadHistoryData();
  }, [recentlyPlayed]);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistTitle.trim()) {
      toast.error('El título es obligatorio');
      return;
    }

    setCreating(true);
    try {
      const { error, playlistId } = await createPlaylist(
        newPlaylistTitle,
        newPlaylistDescription
      );

      if (error) {
        toast.error(error);
      } else {
        toast.success('Playlist creada');
        setShowCreateModal(false);
        setNewPlaylistTitle('');
        setNewPlaylistDescription('');
        if (playlistId) {
          navigate(`/playlist/${playlistId}`);
        }
      }
    } catch (error) {
      toast.error('Algo se desafinó. Intenta de nuevo.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.15em] text-[#8B8B96] font-medium mb-1">Tu espacio</p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F5F5F7]">Tu biblioteca</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
            className="p-2 rounded-lg bg-[#131318] hover:bg-[#1E1E26] border border-[#2A2A35] transition-all"
            aria-label="Cambiar vista"
          >
            {view === 'grid' ? <List className="w-4 h-4 text-[#8B8B96]" strokeWidth={1.75} /> : <Grid3X3 className="w-4 h-4 text-[#8B8B96]" strokeWidth={1.75} />}
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="p-2 rounded-lg bg-[#131318] hover:bg-[#1E1E26] border border-[#2A2A35] transition-all" 
            aria-label="Crear playlist"
          >
            <Plus className="w-4 h-4 text-[#8B8B96]" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: 'playlists' as Tab, label: 'Playlists', icon: Music2 },
          { key: 'albums' as Tab, label: 'Álbumes', icon: Disc3 },
          { key: 'artists' as Tab, label: 'Artistas', icon: Users },
          { key: 'liked' as Tab, label: 'Favoritas', icon: Heart },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
              activeTab === tab.key
                ? 'bg-[#F5F5F7] text-[#08080C]'
                : 'bg-[#131318] text-[#8B8B96] border border-[#2A2A35] hover:bg-[#1E1E26] hover:text-[#F5F5F7]'
            )}
          >
            <tab.icon className="w-4 h-4" strokeWidth={1.75} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Playlists */}
      {activeTab === 'playlists' && (
        <div className={cn(
          view === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
            : 'space-y-1'
        )}>
          {playlists.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <Music2 className="w-12 h-12 text-[#8B8B96]/30 mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-[#8B8B96]">Aún no tienes playlists</p>
              <p className="text-sm text-[#8B8B96]/60 mt-1">Crea una para empezar</p>
            </div>
          ) : (
            playlists.map(playlist => (
              view === 'grid' ? (
                <Link key={playlist.id} to={`/playlist/${playlist.id}`} className="group">
                  <div className="relative mb-3">
                    {playlist.cover_url ? (
                      <img src={playlist.cover_url} alt={playlist.title} className="w-full aspect-square rounded-xl object-cover shadow-lg ring-1 ring-[#2A2A35]" />
                    ) : (
                      <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#EC4899] flex items-center justify-center shadow-lg ring-1 ring-[#2A2A35]">
                        <Music2 className="w-12 h-12 text-white" strokeWidth={1.75} />
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium truncate text-[#F5F5F7]">{playlist.title}</p>
                  <p className="text-xs text-[#8B8B96] truncate">{playlist.description || 'Playlist'}</p>
                </Link>
              ) : (
                <Link key={playlist.id} to={`/playlist/${playlist.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1E1E26] transition-colors">
                  {playlist.cover_url ? (
                    <img src={playlist.cover_url} alt={playlist.title} className="w-12 h-12 rounded object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded bg-gradient-to-br from-[#7C3AED] to-[#EC4899] flex items-center justify-center shrink-0">
                      <Music2 className="w-5 h-5 text-white" strokeWidth={1.75} />
                    </div>
                  )}
                  <div className="text-left min-w-0">
                    <p className="text-sm font-medium truncate text-[#F5F5F7]">{playlist.title}</p>
                    <p className="text-xs text-[#8B8B96] truncate">{playlist.description || 'Playlist'}</p>
                  </div>
                </Link>
              )
            ))
          )}
        </div>
      )}

      {/* Liked */}
      {activeTab === 'liked' && (
        <div className="space-y-1">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-[#7C3AED]/20 to-[#EC4899]/10 border border-[#7C3AED]/20 mb-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#EC4899] flex items-center justify-center shrink-0 shadow-lg">
              <Heart className="w-8 h-8 text-white fill-white" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-xl font-bold text-[#F5F5F7]">Tus favoritas</p>
              <p className="text-sm text-[#8B8B96]">{likedTracks.length} canciones</p>
            </div>
          </div>
          {likedTracksList.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-12 h-12 text-[#8B8B96]/30 mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-[#8B8B96]">Aún no tienes favoritas</p>
              <p className="text-sm text-[#8B8B96]/60 mt-1">Dale like a las canciones que te gusten</p>
            </div>
          ) : (
            likedTracksList.map((track, i) => (
              <motion.button
                key={track.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => playTrack(track, likedTracksList)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#1E1E26] transition-colors group text-left"
              >
                <span className="w-6 text-center text-sm text-[#8B8B96] font-mono">{i + 1}</span>
                <img src={track.cover} alt={track.title} className="w-10 h-10 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-[#F5F5F7]">{track.title}</p>
                  <p className="text-xs text-[#8B8B96] truncate">{track.artist}</p>
                </div>
                <span className="text-xs text-[#8B8B96] font-mono">{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</span>
              </motion.button>
            ))
          )}
        </div>
      )}

      {/* Albums */}
      {activeTab === 'albums' && (
        <div className={cn(
          view === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
            : 'space-y-1'
        )}>
          {loading ? (
            <div className="col-span-full text-center py-16">
              <div className="w-8 h-8 border-2 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#8B8B96]">Cargando...</p>
            </div>
          ) : albumsList.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <Disc3 className="w-12 h-12 text-[#8B8B96]/30 mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-[#8B8B96]">Aún no tienes álbumes</p>
              <p className="text-sm text-[#8B8B96]/60 mt-1">Empieza a escuchar música</p>
            </div>
          ) : (
            albumsList.map(album => (
              view === 'grid' ? (
                <div key={album.id} className="group cursor-pointer">
                  <div className="relative mb-3">
                    <img src={album.cover} alt={album.title} className="w-full aspect-square rounded-xl object-cover shadow-lg ring-1 ring-[#2A2A35]" />
                  </div>
                  <p className="text-sm font-medium truncate text-[#F5F5F7]">{album.title}</p>
                  <p className="text-xs text-[#8B8B96] truncate">{album.artist}</p>
                </div>
              ) : (
                <div key={album.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1E1E26] transition-colors">
                  <img src={album.cover} alt={album.title} className="w-12 h-12 rounded object-cover" />
                  <div>
                    <p className="text-sm font-medium text-[#F5F5F7]">{album.title}</p>
                    <p className="text-xs text-[#8B8B96]">{album.artist}</p>
                  </div>
                </div>
              )
            ))
          )}
        </div>
      )}

      {/* Artists */}
      {activeTab === 'artists' && (
        <div className={cn(
          view === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
            : 'space-y-1'
        )}>
          {loading ? (
            <div className="col-span-full text-center py-16">
              <div className="w-8 h-8 border-2 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#8B8B96]">Cargando...</p>
            </div>
          ) : artistsList.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <Users className="w-12 h-12 text-[#8B8B96]/30 mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-[#8B8B96]">Aún no tienes artistas</p>
              <p className="text-sm text-[#8B8B96]/60 mt-1">Empieza a escuchar música</p>
            </div>
          ) : (
            artistsList.map(artist => (
              view === 'grid' ? (
                <Link key={artist.id} to={`/artist/${artist.id}`} className="group cursor-pointer">
                  <img src={artist.image} alt={artist.name} className="w-full aspect-square rounded-full object-cover shadow-lg mb-2 ring-1 ring-[#2A2A35]" />
                  <p className="text-sm font-medium text-center truncate text-[#F5F5F7]">{artist.name}</p>
                  <p className="text-xs text-[#8B8B96] text-center">Artista</p>
                </Link>
              ) : (
                <Link key={artist.id} to={`/artist/${artist.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1E1E26] transition-colors">
                  <img src={artist.image} alt={artist.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-medium text-[#F5F5F7]">{artist.name}</p>
                    <p className="text-xs text-[#8B8B96]">Artista</p>
                  </div>
                </Link>
              )
            ))
          )}
        </div>
      )}

      {/* Modal de crear playlist */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[#131318] border border-[#2A2A35] rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#F5F5F7]">Nueva playlist</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
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
                    value={newPlaylistTitle}
                    onChange={(e) => setNewPlaylistTitle(e.target.value)}
                    placeholder="Mi playlist"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1E1E26] border border-[#2A2A35] text-[#F5F5F7] placeholder:text-[#8B8B96]/50 focus:outline-none focus:border-[#7C3AED]/50 transition-all"
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
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1E1E26] border border-[#2A2A35] text-[#F5F5F7] placeholder:text-[#8B8B96]/50 focus:outline-none focus:border-[#7C3AED]/50 transition-all resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-[#1E1E26] border border-[#2A2A35] text-[#8B8B96] hover:text-[#F5F5F7] hover:bg-[#2A2A35] transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreatePlaylist}
                    disabled={creating || !newPlaylistTitle.trim()}
                    className="flex-1 py-2.5 rounded-xl gradient-aura-glow text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? 'Creando...' : 'Crear'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
