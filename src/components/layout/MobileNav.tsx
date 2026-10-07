import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Library, User } from 'lucide-react';
import { cn } from '../../lib/utils';

export function MobileNav() {
  const location = useLocation();

  const items = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Library, label: 'Library', path: '/library' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-20 left-0 right-0 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/5 z-30">
      <div className="flex items-center justify-around py-2">
        {items.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors',
                isActive ? 'text-white' : 'text-white/50'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
