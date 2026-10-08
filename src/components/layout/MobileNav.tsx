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
    <nav className="md:hidden bg-[#08080C] border-t border-[#2A2A35] relative z-40">
      <div className="flex items-center justify-around py-2 px-2">
        {items.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all min-w-[64px]',
                isActive ? 'text-[#A78BFA]' : 'text-[#8B8B96] active:text-[#F5F5F7] active:bg-[#1E1E26]'
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
