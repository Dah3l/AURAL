import { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, List, Music2, Disc3, Users, Heart, Plus } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { tracks, getTrackById } from '../lib/mockData';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

type Tab = 'playlists' | 'albums' | 'artists' | 'liked';
type View = 'grid' | 'list';

export function LibraryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('playlists');
  const [view, setView] = useState<View>('grid');
  const { playTrack } = usePlayerStore();
  const { playlists, likedTracks } = useLibraryStore();

  const tabs = [
    { key: 'playlists' as Tab, label: 'Playlists', icon: Music2 },
    { key: 'albums' as Tab, label: 'Álbumes', icon: Disc3 },
    { key: 'artists' as Tab, label: 'Artistas', icon: Users },
    { key: 'liked' as Tab, label: 'Favoritas', icon: Heart },
  ];

  const likedTracksList = likedTracks.map(id => getTrackById(id)).filter(Boolean);

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
          <button className="p-2 rounded-lg bg-[#131318] hover:bg-[#1E1E26] border border-[#2A2A35] transition-all" aria-label="Crear">
            <Plus className="w-4 h-4 text-[#8B8B96]" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
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
          {view === 'grid' ? (
            <button onClick={() => setActiveTab('liked')} className="group text-left">
              <div className="relative mb-3">
                <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#EC4899] flex items-center justify-center shadow-lg ring-1 ring-[#2A2A35]">
                  <Heart className="w-12 h-12 text-white fill-white" strokeWidth={1.75} />
                </div>
              </div>
              <p className="text-sm font-medium text-[#F5F5F7]">Tus favoritas</p>
              <p className="text-xs text-[#8B8B96]">{likedTracks.length} canciones</p>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('liked')}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#1E1E26] transition-colors"
            >
              <div className="w-12 h-12 rounded bg-gradient-to-br from-[#7C3AED] to-[#EC4899] flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 text-white fill-white" strokeWidth={1.75} />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-[#F5F5F7]">Tus favoritas</p>
                <p className="text-xs text-[#8B8B96]">Playlist · {likedTracks.length} canciones</p>
              </div>
            </button>
          )}

          {playlists.map(playlist => (
            view === 'grid' ? (
              <Link key={playlist.id} to={`/playlist/${playlist.id}`} className="group">
                <div className="relative mb-3">
                  <img src={playlist.cover} alt={playlist.title} className="w-full aspect-square rounded-xl object-cover shadow-lg ring-1 ring-[#2A2A35]" />
                </div>
                <p className="text-sm font-medium truncate text-[#F5F5F7]">{playlist.title}</p>
                <p className="text-xs text-[#8B8B96] truncate">{playlist.owner} · {playlist.tracks.length} canciones</p>
              </Link>
            ) : (
              <Link key={playlist.id} to={`/playlist/${playlist.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1E1E26] transition-colors">
                <img src={playlist.cover} alt={playlist.title} className="w-12 h-12 rounded object-cover shrink-0" />
                <div className="text-left min-w-0">
                  <p className="text-sm font-medium truncate text-[#F5F5F7]">{playlist.title}</p>
                  <p className="text-xs text-[#8B8B96] truncate">Playlist · {playlist.owner}</p>
                </div>
              </Link>
            )
          ))}
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
          {likedTracksList.map((track, i) => (
            track && (
              <motion.button
                key={track.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => playTrack(track, likedTracksList as typeof tracks)}
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
            )
          ))}
          {likedTracks.length === 0 && (
            <div className="text-center py-16">
              <Heart className="w-12 h-12 text-[#8B8B96]/30 mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-[#8B8B96]">Silencio.</p>
              <p className="text-sm text-[#8B8B96]/60 mt-1">Añade algo para romperlo.</p>
            </div>
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
          {playlists.slice(0, 4).map(item => (
            view === 'grid' ? (
              <div key={item.id} className="group cursor-pointer">
                <div className="relative mb-3">
                  <img src={item.cover} alt={item.title} className="w-full aspect-square rounded-xl object-cover shadow-lg ring-1 ring-[#2A2A35]" />
                </div>
                <p className="text-sm font-medium truncate text-[#F5F5F7]">{item.title}</p>
                <p className="text-xs text-[#8B8B96] truncate">{item.owner}</p>
              </div>
            ) : (
              <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1E1E26] transition-colors">
                <img src={item.cover} alt={item.title} className="w-12 h-12 rounded object-cover" />
                <div>
                  <p className="text-sm font-medium text-[#F5F5F7]">{item.title}</p>
                  <p className="text-xs text-[#8B8B96]">{item.owner}</p>
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Artists */}
      {activeTab === 'artists' && (
        <div className={cn(
          view === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
            : 'space-y-1'
        )}>
          {(() => {
            const seen = new Set<string>();
            const uniqueArtists = tracks.filter(t => {
              if (seen.has(t.artistId)) return false;
              seen.add(t.artistId);
              return true;
            }).slice(0, 10);
            return uniqueArtists.map((track) => view === 'grid' ? (
              <Link key={track.artistId} to={`/artist/${track.artistId}`} className="group cursor-pointer">
                <img src={track.cover} alt={track.artist} className="w-full aspect-square rounded-full object-cover shadow-lg mb-2 ring-1 ring-[#2A2A35]" />
                <p className="text-sm font-medium text-center truncate text-[#F5F5F7]">{track.artist}</p>
                <p className="text-xs text-[#8B8B96] text-center">Artista</p>
              </Link>
            ) : (
              <Link key={track.artistId} to={`/artist/${track.artistId}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1E1E26] transition-colors">
                <img src={track.cover} alt={track.artist} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-medium text-[#F5F5F7]">{track.artist}</p>
                  <p className="text-xs text-[#8B8B96]">Artista</p>
                </div>
              </Link>
            ));
          })()}
        </div>
      )}
    </motion.div>
  );
}
