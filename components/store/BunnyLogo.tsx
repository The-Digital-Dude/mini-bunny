import React from "react"

export function BunnyIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Background Soft Circle */}
      <circle cx="24" cy="24" r="22" fill="#EBF5FB" />
      
      {/* Left Ear */}
      <path
        d="M16 8C16 4.68629 18.6863 2 22 2C22 2 22 14 20 18C18 22 16 19 16 8Z"
        fill="#4A8DB7"
      />
      <path
        d="M17.5 8C17.5 5.5 19.5 4 20.5 4C20.5 4 20.5 12 19 15C17.5 18 17.5 15 17.5 8Z"
        fill="#FFCCD5"
      />

      {/* Right Ear */}
      <path
        d="M32 8C32 4.68629 29.3137 2 26 2C26 2 26 14 28 18C30 22 32 19 32 8Z"
        fill="#4A8DB7"
      />
      <path
        d="M30.5 8C30.5 5.5 28.5 4 27.5 4C27.5 4 27.5 12 29 15C30.5 18 30.5 15 30.5 8Z"
        fill="#FFCCD5"
      />

      {/* Head */}
      <ellipse cx="24" cy="28" rx="15" ry="13" fill="#FFFFFF" stroke="#4A8DB7" strokeWidth="2.5" />

      {/* Eyes */}
      <circle cx="19" cy="26" r="2" fill="#1E3E5B" />
      <circle cx="19.7" cy="25.3" r="0.7" fill="#FFFFFF" />
      
      <circle cx="29" cy="26" r="2" fill="#1E3E5B" />
      <circle cx="29.7" cy="25.3" r="0.7" fill="#FFFFFF" />

      {/* Blush Cheeks */}
      <ellipse cx="15.5" cy="30" rx="2.5" ry="1.5" fill="#FFCCD5" />
      <ellipse cx="32.5" cy="30" rx="2.5" ry="1.5" fill="#FFCCD5" />

      {/* Nose (Heart/Triangle) */}
      <path
        d="M24 29.5L22.5 28C22.5 28 23 27 24 27C25 27 25.5 28 25.5 28L24 29.5Z"
        fill="#FF758F"
      />

      {/* Mouth */}
      <path
        d="M21.5 31C22.5 32.2 23.5 32.2 24 31C24.5 32.2 25.5 32.2 26.5 31"
        stroke="#4A8DB7"
        strokeWidth="1.5"
        strokeLinecap="round"
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
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative shrink-0 transition-transform duration-300 hover:scale-105">
        <BunnyIcon className="w-10 h-10 md:w-11 md:h-11 drop-shadow-sm" />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1 leading-none">
          <span
            className={`font-heading font-extrabold text-xl md:text-2xl tracking-tight ${
              inverted ? "text-white" : "text-[#1E3E5B]"
            }`}
          >
            Mini<span className="text-[#4A8DB7]">Bunny</span>
          </span>
          <span className="inline-block w-2 h-2 rounded-full bg-[#FF758F] -mt-2" />
        </div>
        {showTagline && (
          <span
            className={`text-[9px] font-semibold tracking-widest uppercase mt-0.5 ${
              inverted ? "text-white/70" : "text-[#6C7A89]"
            }`}
          >
            Baby & Kids Boutique
          </span>
        )}
      </div>
    </div>
  )
}
