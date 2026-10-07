import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Search, Library, Plus, Music2, Heart,
  ChevronLeft, ChevronRight, ListMusic, Disc3
} from 'lucide-react';
import { useLibraryStore } from '../../store/libraryStore';
import { cn } from '../../lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const playlists = useLibraryStore(s => s.playlists);
  const [showPlaylists, setShowPlaylists] = useState(true);

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Library, label: 'Your Library', path: '/library' },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-full flex flex-col bg-[#0A0A0A] border-r border-white/5 relative"
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <Disc3 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Soundwave</span>
          </motion.div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center mx-auto">
            <Disc3 className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="px-2 mt-2">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              <item.icon className={cn('w-5 h-5 shrink-0', collapsed && 'mx-auto')} />
              {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 my-3 border-t border-white/5" />

      {/* Playlists section */}
      {!collapsed && (
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-4 flex items-center justify-between mb-2">
            <button
              onClick={() => setShowPlaylists(!showPlaylists)}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ListMusic className="w-4 h-4" />
              <span className="text-sm font-medium">Playlists</span>
            </button>
            <button className="p-1 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {showPlaylists && (
            <div className="flex-1 overflow-y-auto px-2">
              {/* Liked Songs */}
              <Link
                to="/library"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded gradient-accent flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4 text-white fill-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">Liked Songs</p>
                  <p className="text-xs text-white/40">Playlist</p>
                </div>
              </Link>

              {/* User Playlists */}
              {playlists.slice(0, 8).map(playlist => (
                <Link
                  key={playlist.id}
                  to={`/playlist/${playlist.id}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center shrink-0">
                    <Music2 className="w-4 h-4 text-white/60" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{playlist.title}</p>
                    <p className="text-xs text-white/40">Playlist • {playlist.owner}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Collapse button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#1A1A1A] border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors z-10"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-white/60" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-white/60" />
        )}
      </button>

      {/* Now Playing indicator */}
      {!collapsed && (
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            <span>Ad-free • Unlimited skips</span>
          </div>
        </div>
      )}
    </motion.aside>
  );
}
