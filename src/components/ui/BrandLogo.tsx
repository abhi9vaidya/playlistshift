import React from "react";

interface BrandLogoProps {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = "full",
  size = "md",
  className = "",
}) => {
  const sizeMap = {
    sm: { icon: "w-8 h-8", text: "text-lg", sub: "text-[10px]" },
    md: { icon: "w-10 h-10", text: "text-xl", sub: "text-xs" },
    lg: { icon: "w-12 h-12", text: "text-2xl", sub: "text-sm" },
    xl: { icon: "w-16 h-16", text: "text-3xl", sub: "text-base" },
  };

  const currentSize = sizeMap[size];

  const IconElement = (
    <div
      className={`relative ${currentSize.icon} rounded-xl bg-gradient-to-br from-brandGreen via-brandPurple to-brandRed p-[1.5px] shadow-lg shadow-brandGreen/10 group-hover:shadow-brandGreen/25 group-hover:scale-105 transition-all duration-300 shrink-0`}
    >
      <div className="w-full h-full bg-[#090A0F] rounded-[10.5px] flex items-center justify-center overflow-hidden relative">
        {/* Ambient subtle glow inside icon */}
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-brandGreen/30 rounded-full blur-sm" />
        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-brandRed/30 rounded-full blur-sm" />

        {/* Vector SVG Mark */}
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 h-3/4"
        >
          {/* Sound Waves (Spotify Green) */}
          <rect x="7" y="15" width="2.8" height="10" rx="1.4" fill="#00E599" />
          <rect x="12" y="11" width="2.8" height="18" rx="1.4" fill="#00E599" />
          <rect x="17" y="14" width="2.8" height="12" rx="1.4" fill="#00E599" />

          {/* Shift Play Chevron (Purple to Red) */}
          <path
            d="M 23 12 L 28 19.5 L 23 27 Q 22 28 21 27 Q 20 26.5 20 25 L 20 14 Q 20 12.5 21 12 Q 22 11 23 12 Z"
            fill="url(#logoShiftGrad)"
          />
          <path
            d="M 28 14 L 33 19.5 L 28 25 Q 27 26 26.5 25 Q 26 24.5 26 23.5 L 26 15.5 Q 26 14.5 26.5 14 Q 27 13 28 14 Z"
            fill="url(#logoShiftGrad2)"
            opacity="0.85"
          />

          <defs>
            <linearGradient
              id="logoShiftGrad"
              x1="20"
              y1="12"
              x2="28"
              y2="27"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#8B5CF6" />
              <stop offset="1" stopColor="#EC4899" />
            </linearGradient>
            <linearGradient
              id="logoShiftGrad2"
              x1="26"
              y1="14"
              x2="33"
              y2="25"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#A855F7" />
              <stop offset="1" stopColor="#FF0055" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );

  if (variant === "icon") {
    return <div className={`inline-flex ${className}`}>{IconElement}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {IconElement}
      <div className="flex flex-col">
        <span
          className={`${currentSize.text} font-black tracking-tight text-white flex items-center leading-none`}
        >
          Playlist
          <span className="bg-gradient-to-r from-brandGreen via-emerald-400 to-brandPurple bg-clip-text text-transparent">
            Shift
          </span>
        </span>
      </div>
    </div>
  );
};
