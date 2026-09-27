export default function BotanicalSprig({ className = "", flip = false, ...props }) {
  return (
    <svg
      viewBox="0 0 220 140"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      {...props}
    >
      <path
        d="M20 120c40-60 85-90 160-100"
        fill="none"
        stroke="#1B3B6F"
        strokeOpacity="0.28"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {[
        { x: 62, y: 92, w: 56, c: "#E7F3EA", r: -12 },
        { x: 96, y: 76, w: 64, c: "#DDEBFF", r: 14 },
        { x: 132, y: 60, w: 60, c: "#E7F3EA", r: -10 },
        { x: 160, y: 48, w: 50, c: "#DDEBFF", r: 12 },
      ].map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.r})`} opacity="0.95">
          <path d={`M0 0c${p.w}-18 ${p.w}-4 ${p.w} 24C${p.w - 24} 34 22 28 0 0z`} fill={p.c} />
          <path
            d="M6 6c16-8 30-5 40 10"
            fill="none"
            stroke="#1B3B6F"
            strokeOpacity="0.16"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      ))}

      {/* mini flor */}
      <g transform="translate(190 34)" opacity="0.95">
        <circle cx="0" cy="0" r="2.6" fill="#D4AF37" />
        <path d="M0-11c6 4 6 7 0 11-6-4-6-7 0-11z" fill="#FFFFFF" opacity="0.85" />
        <path d="M11 0c-4 6-7 6-11 0 4-6 7-6 11 0z" fill="#FFFFFF" opacity="0.85" />
        <path d="M0 11c-6-4-6-7 0-11 6 4 6 7 0 11z" fill="#FFFFFF" opacity="0.85" />
        <path d="M-11 0c4-6 7-6 11 0-4 6-7 6-11 0z" fill="#FFFFFF" opacity="0.85" />
      </g>
    </svg>
  );
}
