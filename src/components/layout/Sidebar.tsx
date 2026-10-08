import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Search, Library, Plus, Music2, Heart,
  ChevronLeft, ChevronRight, ListMusic
} from 'lucide-react';
import { useLibraryStore } from '../../store/libraryStore';
import { AuralLogo } from '../shared/AuralLogo';
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
    { icon: Home, label: 'Inicio', path: '/' },
    { icon: Search, label: 'Buscar', path: '/search' },
    { icon: Library, label: 'Tu biblioteca', path: '/library' },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="h-full flex flex-col bg-[#08080C] border-r border-[#2A2A35] relative"
    >
      {/* Logo + wordmark */}
      <div className="p-4 flex items-center gap-3">
        <AnimatePresence mode="popLayout">
          {collapsed ? (
            <motion.div
              key="collapsed-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.2 } }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
              className="mx-auto"
            >
              <AuralLogo size={32} />
            </motion.div>
          ) : (
            <motion.div
              key="expanded-logo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0, transition: { duration: 0.2 } }}
              exit={{ opacity: 0, x: -10, transition: { duration: 0.15 } }}
              className="flex items-center gap-2.5"
            >
              <AuralLogo size={28} />
              <div className="flex flex-col leading-none">
                <span className="font-semibold text-[17px] tracking-tight text-[#F5F5F7]">
                  aural
                </span>
                <span className="text-[10px] text-[#8B8B96] tracking-wide mt-0.5">
                  el sonido, sin ruido
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navegación */}
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
                  ? 'bg-[#7C3AED]/15 text-[#A78BFA]'
                  : 'text-[#8B8B96] hover:text-[#F5F5F7] hover:bg-[#1E1E26]'
              )}
            >
              <item.icon className={cn('w-5 h-5 shrink-0', collapsed && 'mx-auto')} strokeWidth={1.75} />
              {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Divisor */}
      <div className="mx-4 my-3 border-t border-[#2A2A35]" />

      {/* Playlists */}
      {!collapsed && (
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-4 flex items-center justify-between mb-2">
            <button
              onClick={() => setShowPlaylists(!showPlaylists)}
              className="flex items-center gap-2 text-[#8B8B96] hover:text-[#F5F5F7] transition-colors"
            >
              <ListMusic className="w-4 h-4" strokeWidth={1.75} />
              <span className="text-sm font-medium">Playlists</span>
            </button>
            <button className="p-1 rounded-full hover:bg-[#1E1E26] transition-colors text-[#8B8B96] hover:text-[#F5F5F7]">
              <Plus className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>

          {showPlaylists && (
            <div className="flex-1 overflow-y-auto px-2">
              {/* Liked Songs */}
              <Link
                to="/library"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1E1E26] transition-colors"
              >
                <div className="w-8 h-8 rounded gradient-aura flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4 text-white fill-white" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate text-[#F5F5F7]">Tus favoritas</p>
                  <p className="text-xs text-[#8B8B96]">Playlist</p>
                </div>
              </Link>

              {playlists.slice(0, 8).map(playlist => (
                <Link
                  key={playlist.id}
                  to={`/playlist/${playlist.id}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1E1E26] transition-colors"
                >
                  <div className="w-8 h-8 rounded bg-[#1E1E26] flex items-center justify-center shrink-0 overflow-hidden">
                    {playlist.cover_url ? (
                      <img src={playlist.cover_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Music2 className="w-4 h-4 text-[#8B8B96]" strokeWidth={1.75} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate text-[#F5F5F7]">{playlist.title}</p>
                    <p className="text-xs text-[#8B8B96] truncate">Playlist</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Botón colapsar */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#131318] border border-[#2A2A35] flex items-center justify-center hover:bg-[#1E1E26] hover:border-[#7C3AED]/50 transition-all z-10"
        aria-label="Colapsar sidebar"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-[#8B8B96]" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-[#8B8B96]" />
        )}
      </button>

      {/* Footer — promesa de marca */}
      {!collapsed && (
        <div className="p-3 border-t border-[#2A2A35]">
          <div className="flex items-center gap-2 text-[11px] text-[#8B8B96]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-pulse" />
            <span>Sin anuncios. Sin límites.</span>
          </div>
        </div>
      )}
    </motion.aside>
  );
}
