export default function BotanicalCornerTL({ className = "", ...props }) {
  return (
    <svg viewBox="0 0 260 260" className={className} xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="washTL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E9F2FF" stopOpacity="0.85" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* acuarela suave */}
      <path
        d="M10 30c40-30 90-25 125 5s55 85 35 125-70 75-120 55S-5 60 10 30z"
        fill="url(#washTL)"
      />

      {/* tallo principal */}
      <path
        d="M35 220c28-65 58-110 100-150 34-32 66-45 95-50"
        fill="none"
        stroke="#1B3B6F"
        strokeOpacity="0.35"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* hojas */}
      <path d="M78 170c-20-6-35-2-46 12 18 7 35 4 46-12z" fill="#DDEBFF" />
      <path d="M102 142c-10-18-24-26-44-23 8 17 23 26 44 23z" fill="#E7F3EA" />
      <path d="M135 112c-8-20-22-32-42-35 6 20 20 33 42 35z" fill="#DDEBFF" />
      <path d="M170 82c-2-18-12-30-28-36-1 18 9 31 28 36z" fill="#E7F3EA" />

      {/* flor mínima */}
      <g transform="translate(58 200)" opacity="0.9">
        <circle cx="0" cy="0" r="2.8" fill="#D4AF37" />
        <path d="M0-12c6 4 6 8 0 12-6-4-6-8 0-12z" fill="#FFFFFF" opacity="0.8" />
        <path d="M12 0c-4 6-8 6-12 0 4-6 8-6 12 0z" fill="#FFFFFF" opacity="0.8" />
        <path d="M0 12c-6-4-6-8 0-12 6 4 6 8 0 12z" fill="#FFFFFF" opacity="0.8" />
        <path d="M-12 0c4-6 8-6 12 0-4 6-8 6-12 0z" fill="#FFFFFF" opacity="0.8" />
      </g>

      {/* líneas finas */}
      <path
        d="M46 214c20-46 48-84 86-120"
        fill="none"
        stroke="#1B3B6F"
        strokeOpacity="0.18"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
