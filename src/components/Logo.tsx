interface LogoProps {
  size?: number;
  showText?: boolean;
}

export function Logo({ size = 40, showText = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="relative shrink-0"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 48 48" width={size} height={size}>
          <defs>
            <linearGradient id="cora-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="12" fill="url(#cora-grad)" />
          <path
            d="M16 18 C16 14, 20 12, 24 12 C28 12, 32 14, 32 18 L32 30 C32 34, 28 36, 24 36 C20 36, 16 34, 16 30 Z"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx="24" cy="24" r="4" fill="white" />
          <circle cx="24" cy="24" r="2" fill="#3b82f6" />
        </svg>
      </div>
      {showText && (
        <div className="leading-none">
          <div className="text-base font-bold text-white tracking-tight">CORA<span className="text-cyan-400"> AI</span></div>
          <div className="text-[9px] text-slate-400 uppercase tracking-widest font-medium">Your AI Business Team</div>
        </div>
      )}
    </div>
  );
}
