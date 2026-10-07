import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Library, User } from 'lucide-react';
import { cn } from '../../lib/utils';

export function MobileNav() {
  const location = useLocation();

  const items = [
    { icon: Home, label: 'Inicio', path: '/' },
    { icon: Search, label: 'Buscar', path: '/search' },
    { icon: Library, label: 'Biblioteca', path: '/library' },
    { icon: User, label: 'Perfil', path: '/profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-14 left-0 right-0 bg-[#08080C]/98 backdrop-blur-xl border-t border-[#2A2A35] z-30">
      <div className="flex items-center justify-around py-2 px-2">
        {items.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg transition-all',
                isActive ? 'text-[#A78BFA]' : 'text-[#8B8B96] hover:text-[#F5F5F7]'
              )}
            >
              <item.icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.75} />
              <span className="text-[11px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
