import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Player } from '../player/Player';
import { MobileNav } from './MobileNav';

export function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(true);

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
    <div className="h-screen flex flex-col bg-[#08080C] overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
        <main className="flex-1 flex flex-col overflow-hidden">
          <TopBar isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />
          <div
            id="main-content"
            className="flex-1 overflow-y-auto px-4 md:px-6 pb-36 md:pb-4"
          >
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNav />
      <Player />
    </div>
  );
}
