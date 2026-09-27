export default function RingsIllustration({ className = "", ...props }) {
  return (
    <svg viewBox="0 0 160 120" className={className} xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E7D18A" />
          <stop offset="1" stopColor="#C9A437" />
        </linearGradient>
      </defs>

      <circle cx="62" cy="64" r="34" fill="none" stroke="url(#gold)" strokeWidth="10" />
      <circle cx="98" cy="70" r="34" fill="none" stroke="url(#gold)" strokeWidth="10" opacity="0.95" />

      {/* Diamante */}
      <path
        d="M98 18l10 10-10 10-10-10 10-10z"
        fill="#EAF2FF"
        stroke="#A9C7FF"
        strokeWidth="2"
      />
    </svg>
  );
}
