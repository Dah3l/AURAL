import { motion } from 'framer-motion';
import { ChevronDown, Loader2 } from 'lucide-react';

interface LoadMoreButtonProps {
  onClick: () => void;
  hasMore: boolean;
  visibleCount: number;
  totalCount: number;
  loading?: boolean;
  label?: string;
}

export function LoadMoreButton({
  onClick,
  hasMore,
  visibleCount,
  totalCount,
  loading = false,
  label = 'Cargar más',
}: LoadMoreButtonProps) {
  if (!hasMore) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col items-center gap-2 mt-6 mb-2"
    >
      <button
        onClick={onClick}
        disabled={loading}
        className="group relative flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#131318] border border-[#2A2A35] hover:border-[#7C3AED]/40 hover:bg-[#1E1E26] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#7C3AED]/0 via-[#7C3AED]/5 to-[#EC4899]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {loading ? (
          <Loader2 className="w-4 h-4 text-[#7C3AED] animate-spin relative z-10" strokeWidth={2} />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#7C3AED] group-hover:translate-y-0.5 transition-transform relative z-10" strokeWidth={2} />
        )}
        <span className="text-sm font-medium text-[#F5F5F7] relative z-10">
          {loading ? 'Cargando...' : label}
        </span>
      </button>
      
      <span className="text-xs text-[#8B8B96]">
        Mostrando {visibleCount} de {totalCount}
      </span>
    </motion.div>
  );
}
