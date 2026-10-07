import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Moon, Sun, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TopBarProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function TopBar({ isDark, onToggleTheme }: TopBarProps) {
  const navigate = useNavigate();
  const [searchFocused, setSearchFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !searchFocused && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchFocused]);

  useEffect(() => {
    const main = document.getElementById('main-content');
    if (!main) return;
    const handleScroll = () => setScrolled(main.scrollTop > 20);
    main.addEventListener('scroll', handleScroll);
    return () => main.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-20 px-4 md:px-6 py-3 flex items-center gap-4 transition-all duration-300',
        scrolled ? 'bg-[#08080C]/90 backdrop-blur-xl border-b border-[#2A2A35]/50' : 'bg-transparent'
      )}
    >
      {/* Nav arrows */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-[#131318] hover:bg-[#1E1E26] border border-[#2A2A35] flex items-center justify-center transition-all"
          aria-label="Atrás"
        >
          <ChevronLeft className="w-4 h-4 text-[#8B8B96]" strokeWidth={1.75} />
        </button>
        <button
          onClick={() => navigate(1)}
          className="w-8 h-8 rounded-full bg-[#131318] hover:bg-[#1E1E26] border border-[#2A2A35] flex items-center justify-center transition-all"
          aria-label="Adelante"
        >
          <ChevronRight className="w-4 h-4 text-[#8B8B96]" strokeWidth={1.75} />
        </button>
      </div>

      {/* Search - Solo desktop */}
      <div className={cn(
        'hidden md:flex flex-1 max-w-md relative transition-all duration-300',
        searchFocused && 'max-w-lg'
      )}>
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B8B96]" strokeWidth={1.75} />
        <input
          ref={searchRef}
          type="text"
          placeholder="¿Qué quieres escuchar?"
          onFocus={() => { setSearchFocused(true); navigate('/search'); }}
          onBlur={() => setSearchFocused(false)}
          className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#131318] border border-[#2A2A35] text-sm text-[#F5F5F7] placeholder:text-[#8B8B96] focus:outline-none focus:border-[#7C3AED]/50 focus:bg-[#1E1E26] transition-all"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleTheme}
          className="w-9 h-9 rounded-full bg-[#131318] hover:bg-[#1E1E26] border border-[#2A2A35] flex items-center justify-center transition-all"
          aria-label="Cambiar tema"
        >
          {isDark ? <Sun className="w-4 h-4 text-[#8B8B96]" strokeWidth={1.75} /> : <Moon className="w-4 h-4 text-[#8B8B96]" strokeWidth={1.75} />}
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-full gradient-aura flex items-center justify-center hover:opacity-90 transition-opacity shadow-[0_0_16px_rgba(124,58,237,0.3)]"
          aria-label="Perfil"
        >
          <User className="w-4 h-4 text-white" strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
}
