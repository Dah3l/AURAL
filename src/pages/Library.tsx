import { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, List, Music2, Disc3, Users, Download, Plus, Heart } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { tracks, getTrackById } from '../lib/mockData';
import { cn, formatNumber } from '../lib/utils';
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
    { key: 'albums' as Tab, label: 'Albums', icon: Disc3 },
    { key: 'artists' as Tab, label: 'Artists', icon: Users },
    { key: 'liked' as Tab, label: 'Liked', icon: Heart },
  ];

  const likedTracksList = likedTracks.map(id => getTrackById(id)).filter(Boolean);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Library</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            {view === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
          </button>
          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <Plus className="w-4 h-4" />
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
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab.key
                ? 'bg-white text-black'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'playlists' && (
        <div className={cn(
          view === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
            : 'space-y-1'
        )}>
          {/* Liked Songs card */}
          {view === 'grid' ? (
            <Link to="/library" className="group">
              <div className="relative mb-3">
                <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center shadow-lg">
                  <Heart className="w-12 h-12 text-white fill-white" />
                </div>
              </div>
              <p className="text-sm font-medium">Liked Songs</p>
              <p className="text-xs text-white/50">{likedTracks.length} songs</p>
            </Link>
          ) : (
            <button
              onClick={() => setActiveTab('liked')}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="w-12 h-12 rounded bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Liked Songs</p>
                <p className="text-xs text-white/50">Playlist • {likedTracks.length} songs</p>
              </div>
            </button>
          )}

          {playlists.map(playlist => (
            view === 'grid' ? (
              <Link key={playlist.id} to={`/playlist/${playlist.id}`} className="group">
                <div className="relative mb-3">
                  <img src={playlist.cover} alt={playlist.title} className="w-full aspect-square rounded-xl object-cover shadow-lg" />
                </div>
                <p className="text-sm font-medium truncate">{playlist.title}</p>
                <p className="text-xs text-white/50 truncate">{playlist.owner} • {playlist.tracks.length} songs</p>
              </Link>
            ) : (
              <Link key={playlist.id} to={`/playlist/${playlist.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                <img src={playlist.cover} alt={playlist.title} className="w-12 h-12 rounded object-cover shrink-0" />
                <div className="text-left min-w-0">
                  <p className="text-sm font-medium truncate">{playlist.title}</p>
                  <p className="text-xs text-white/50 truncate">Playlist • {playlist.owner}</p>
                </div>
              </Link>
            )
          ))}
        </div>
      )}

      {activeTab === 'liked' && (
        <div className="space-y-1">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-violet-600/20 to-pink-500/20 mb-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center shrink-0">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
            <div>
              <p className="text-xl font-bold">Liked Songs</p>
              <p className="text-sm text-white/60">{likedTracks.length} songs</p>
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
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group text-left"
              >
                <span className="w-6 text-center text-sm text-white/40">{i + 1}</span>
                <img src={track.cover} alt={track.title} className="w-10 h-10 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{track.title}</p>
                  <p className="text-xs text-white/50 truncate">{track.artist}</p>
                </div>
                <span className="text-xs text-white/40">{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</span>
              </motion.button>
            )
          ))}
        </div>
      )}

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
                  <img src={item.cover} alt={item.title} className="w-full aspect-square rounded-xl object-cover shadow-lg" />
                </div>
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className="text-xs text-white/50 truncate">{item.owner}</p>
              </div>
            ) : (
              <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                <img src={item.cover} alt={item.title} className="w-12 h-12 rounded object-cover" />
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-white/50">{item.owner}</p>
                </div>
              </div>
            )
          ))}
        </div>
      )}

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
                <img src={track.cover} alt={track.artist} className="w-full aspect-square rounded-full object-cover shadow-lg mb-2" />
                <p className="text-sm font-medium text-center truncate">{track.artist}</p>
                <p className="text-xs text-white/50 text-center">Artist</p>
              </Link>
            ) : (
              <Link key={track.artistId} to={`/artist/${track.artistId}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                <img src={track.cover} alt={track.artist} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-medium">{track.artist}</p>
                  <p className="text-xs text-white/50">Artist</p>
                </div>
              </Link>
            ));
          })()}
        </div>
      )}
    </motion.div>
  );
}
