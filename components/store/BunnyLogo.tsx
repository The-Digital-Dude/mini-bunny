import React from "react"

export function BunnyIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer Circle Background */}
      <circle cx="50" cy="50" r="48" fill="#3A6D95" stroke="#FFFFFF" strokeWidth="4" />

      {/* Bunny Left Ear */}
      <ellipse cx="40" cy="30" rx="6.5" ry="15" fill="#FFF0E5" />
      <ellipse cx="40" cy="31" rx="3.8" ry="11" fill="#F7A3B3" />

      {/* Bunny Right Ear */}
      <ellipse cx="60" cy="30" rx="6.5" ry="15" fill="#FFF0E5" />
      <ellipse cx="60" cy="31" rx="3.8" ry="11" fill="#F7A3B3" />

      {/* Bunny Head */}
      <ellipse cx="50" cy="46" rx="14" ry="12" fill="#FFF0E5" />

      {/* Left Eye */}
      <circle cx="43" cy="46" r="1.8" fill="#2A1B16" />
      <circle cx="43.6" cy="45.3" r="0.6" fill="#FFFFFF" />

      {/* Right Eye */}
      <circle cx="57" cy="46" r="1.8" fill="#2A1B16" />
      <circle cx="57.6" cy="45.3" r="0.6" fill="#FFFFFF" />

      {/* Nose */}
      <ellipse cx="50" cy="49.5" rx="1.6" ry="1.2" fill="#F7A3B3" />

      {/* W-Smile Mouth */}
      <path
        d="M47.5 50.8C48.3 52 49.3 52 50 51.2C50.7 52 51.7 52 52.5 50.8"
        stroke="#2A1B16"
        strokeWidth="0.9"
        strokeLinecap="round"
      />

      {/* "mini" text */}
      <text
        x="18"
        y="70"
        fill="#F7A3B3"
        fontFamily="var(--font-heading), 'Outfit', 'Quicksand', sans-serif"
        fontWeight="800"
        fontSize="17"
        letterSpacing="-0.5"
      >
        mini
      </text>

      {/* Wavy Underline under "mini" */}
      <path
        d="M18 74.5 C 23 72.5, 27 76.5, 34 73.5 C 38 72, 42 74, 44 73"
        stroke="#F7A3B3"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* "bunny" text */}
      <text
        x="47"
        y="70"
        fill="#FFFFFF"
        fontFamily="var(--font-heading), 'Outfit', 'Quicksand', sans-serif"
        fontWeight="800"
        fontSize="17"
        letterSpacing="-0.5"
      >
        bunny
      </text>

      {/* Tiny Pink Heart above the 'y' */}
      <path
        d="M84.5 62 C84.5 60.8 85.8 59.8 87 61 C88.2 59.8 89.5 60.8 89.5 62 C89.5 63.3 87 65.2 87 65.2 C87 65.2 84.5 63.3 84.5 62 Z"
        fill="#F7A3B3"
        transform="rotate(15 87 63)"
      />
    </svg>
  )
}

export default function BunnyLogo({
  showTagline = false,
  inverted = false,
  className = "",
}: {
  showTagline?: boolean
  inverted?: boolean
  className?: string
}) {
  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 select-none shrink-0 ${className}`}>
      {/* Badge Icon */}
      <div className="relative shrink-0 transition-transform duration-300 hover:scale-105">
        <BunnyIcon className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 drop-shadow-sm" />
      </div>

      {/* Wordmark & Tagline */}
      <div className="flex flex-col justify-center shrink-0">
        <div className="flex items-center leading-none">
          {/* mini with wavy underline */}
          <div className="relative inline-flex flex-col">
            <span className="font-heading font-extrabold text-lg sm:text-xl md:text-2xl text-[#F7A3B3] tracking-tight">
              mini
            </span>
            <svg
              viewBox="0 0 36 6"
              className="w-full h-1 sm:h-1.5 -mt-0.5 text-[#F7A3B3]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 3.5 C 8 0.5, 14 6, 22 2 C 28 -0.5, 32 3, 35 2"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* bunny with heart */}
          <div className="relative inline-flex items-center ml-0.5 sm:ml-1">
            <span
              className={`font-heading font-extrabold text-lg sm:text-xl md:text-2xl tracking-tight ${
                inverted ? "text-white" : "text-[#3A6D95]"
              }`}
            >
              bunny
            </span>
            <span className="text-[#F7A3B3] text-[10px] sm:text-xs font-bold -mt-3 ml-0.5 animate-pulse">
              ♥
            </span>
          </div>
        </div>

        {showTagline && (
          <span
            className={`text-[9px] sm:text-[10px] font-semibold tracking-wide mt-0.5 ${
              inverted ? "text-white/80" : "text-[#6C7A89]"
            }`}
          >
            Quality is our main priority
          </span>
        )}
      </div>
    </div>
  )
}
