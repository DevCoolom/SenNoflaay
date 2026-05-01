import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  textColor?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "h-12", showText = true, textColor = "currentColor" }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 120 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto flex-shrink-0"
      >
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
        </defs>

        {/* Three Interlocking Rings */}
        <circle
          cx="30"
          cy="35"
          r="19"
          stroke="url(#ringGradient)"
          strokeWidth="6"
        />
        <circle
          cx="60"
          cy="35"
          r="19"
          stroke="url(#ringGradient)"
          strokeWidth="6"
        />
        <circle
          cx="45"
          cy="58"
          r="19"
          stroke="url(#ringGradient)"
          strokeWidth="6"
        />
      </svg>

      {showText && (
        <div className="flex flex-col justify-center">
          <span
            className="text-2xl font-bold tracking-tight font-sans leading-[0.9]"
            style={{ color: textColor }}
          >
            SenNoflaay
          </span>
          <span
            className="text-[6px] font-bold tracking-[0.25em] uppercase mt-1 opacity-60"
            style={{ color: textColor }}
          >
            Association Management Platform
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
