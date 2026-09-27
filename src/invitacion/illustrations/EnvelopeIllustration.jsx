export default function EnvelopeIllustration({ className = "", ...props }) {
  return (
    <svg viewBox="0 0 200 140" className={className} xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M20 40h160v80H20V40z"
        fill="#FFFFFF"
        stroke="#1B3B6F"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path
        d="M20 40l80 60 80-60"
        fill="none"
        stroke="#1B3B6F"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path
        d="M20 120l70-54"
        fill="none"
        stroke="#1B3B6F"
        strokeWidth="6"
        strokeLinejoin="round"
        opacity="0.35"
      />
      <path
        d="M180 120l-70-54"
        fill="none"
        stroke="#1B3B6F"
        strokeWidth="6"
        strokeLinejoin="round"
        opacity="0.35"
      />
      <circle cx="100" cy="92" r="10" fill="#D4AF37" opacity="0.9" />
    </svg>
  );
}
