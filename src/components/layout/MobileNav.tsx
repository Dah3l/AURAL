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
    <nav className="md:hidden fixed bottom-[72px] left-0 right-0 bg-[#08080C]/98 backdrop-blur-xl border-t border-[#2A2A35] z-30 safe-area-bottom">
      <div className="flex items-center justify-around py-1.5 px-2">
        {items.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all min-w-[56px]',
                isActive ? 'text-[#A78BFA]' : 'text-[#8B8B96] active:text-[#F5F5F7]'
              )}
            >
              <item.icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.75} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
