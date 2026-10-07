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
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !searchFocused) {
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
        scrolled ? 'bg-[#0A0A0A]/90 backdrop-blur-xl' : 'bg-transparent'
      )}
    >
      {/* Navigation arrows */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-white/70" />
        </button>
        <button
          onClick={() => navigate(1)}
          className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {/* Search */}
      <div className={cn(
        'flex-1 max-w-md relative transition-all duration-300',
        searchFocused && 'max-w-lg'
      )}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          ref={searchRef}
          type="text"
          placeholder="What do you want to listen to? (/)"
          onFocus={() => { setSearchFocused(true); navigate('/search'); }}
          onBlur={() => setSearchFocused(false)}
          className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleTheme}
          className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-white/70" /> : <Moon className="w-4 h-4 text-white/70" />}
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          <User className="w-4 h-4 text-white" />
        </button>
      </div>
    </header>
  );
}
