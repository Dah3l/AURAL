import { cn } from '../../lib/utils';

interface AuralLogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export function AuralLogo({ size = 32, className, animated = false }: AuralLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(animated && 'animate-aura-pulse', className)}
    >
      <defs>
        <linearGradient id="auraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
      </defs>
      {/* Aura exterior */}
      <circle cx="256" cy="256" r="230" stroke="url(#auraGrad)" strokeWidth="3" opacity="0.25" />
      {/* Onda media */}
      <circle cx="256" cy="256" r="170" stroke="url(#auraGrad)" strokeWidth="3" opacity="0.55" />
      {/* Onda interna */}
      <circle cx="256" cy="256" r="110" stroke="url(#auraGrad)" strokeWidth="3" opacity="0.85" />
      {/* Núcleo sólido */}
      <circle cx="256" cy="256" r="42" fill="url(#auraGrad)" />
    </svg>
  );
}
