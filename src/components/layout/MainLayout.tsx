import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Player } from '../player/Player';
import { MobileNav } from './MobileNav';
import { usePlayerStore } from '../../store/playerStore';

export function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const location = useLocation();
  const currentTrack = usePlayerStore((state) => state.currentTrack);

  // Aplicar tema al document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#08080C] dark:bg-[#08080C] light:bg-[#FAFAFA] overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <TopBar isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />
          <div
            id="main-content"
            className="flex-1 overflow-y-auto px-4 md:px-6 pb-4 transition-all duration-300 relative z-0"
            style={{
              paddingBottom: currentTrack 
                ? 'calc(env(safe-area-inset-bottom, 0px) + 160px)'
                : 'calc(env(safe-area-inset-bottom, 0px) + 80px)'
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.2 } }}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
      
      {/* Bottom Bar Container - Fixed en mobile, normal en desktop */}
      <div className="fixed bottom-0 left-0 right-0 md:relative md:bottom-auto z-40 pointer-events-none">
        <div className="pointer-events-auto">
          <Player />
          <MobileNav />
        </div>
      </div>
    </div>
  );
}
