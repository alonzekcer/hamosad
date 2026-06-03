// SVG illustrations for the calendar cells — summer / snakes & ladders style

export function FishSVG() {
  return (
    <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20" cy="16" rx="14" ry="9" fill="#38bdf8" opacity="0.85"/>
      <polygon points="34,16 44,9 44,23" fill="#0284c7" opacity="0.8"/>
      <ellipse cx="12" cy="13" rx="2.5" ry="2.5" fill="white"/>
      <circle cx="12.5" cy="13.5" r="1.2" fill="#0c4a6e"/>
      <path d="M17,12 Q20,16 17,20" stroke="white" strokeWidth="1" opacity="0.5" fill="none"/>
      <path d="M21,10 Q24,16 21,22" stroke="white" strokeWidth="0.8" opacity="0.3" fill="none"/>
    </svg>
  );
}

export function CrabSVG() {
  return (
    <svg viewBox="0 0 48 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="22" rx="11" ry="7" fill="#f97316"/>
      <ellipse cx="17" cy="15" rx="3" ry="3.5" fill="#f97316"/>
      <ellipse cx="31" cy="15" rx="3" ry="3.5" fill="#f97316"/>
      <circle cx="17" cy="14" r="2" fill="white"/>
      <circle cx="17.5" cy="14.5" r="1" fill="#1e293b"/>
      <circle cx="31" cy="14" r="2" fill="white"/>
      <circle cx="31.5" cy="14.5" r="1" fill="#1e293b"/>
      <path d="M13,22 Q6,17 4,13 Q7,10 10,14 Q11,18 14,20" fill="#f97316" stroke="#ea580c" strokeWidth="0.5"/>
      <path d="M35,22 Q42,17 44,13 Q41,10 38,14 Q37,18 36,20" fill="#f97316" stroke="#ea580c" strokeWidth="0.5"/>
      <line x1="17" y1="27" x2="13" y2="33" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
      <line x1="20" y1="28" x2="18" y2="35" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
      <line x1="28" y1="28" x2="30" y2="35" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
      <line x1="31" y1="27" x2="35" y2="33" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function StarfishSVG() {
  return (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22,5 L26,17 L38,17 L28,25 L32,37 L22,29 L12,37 L16,25 L6,17 L18,17 Z"
        fill="#fbbf24" opacity="0.9" stroke="#f59e0b" strokeWidth="0.5"/>
      <circle cx="22" cy="22" r="4" fill="#fde68a"/>
    </svg>
  );
}

export function AnchorSVG() {
  return (
    <svg viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="9" r="6" stroke="#0284c7" strokeWidth="2.5" fill="none"/>
      <line x1="18" y1="15" x2="18" y2="40" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M8,22 L18,40 L28,22" fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="5" y1="17" x2="12" y2="17" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="24" y1="17" x2="31" y2="17" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

export function SnakeSVG() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10,40 Q6,30 10,22 Q14,14 24,16 Q34,18 34,26 Q34,34 26,36 Q18,38 16,30 Q14,22 22,20"
        stroke="#22c55e" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <ellipse cx="22" cy="19" rx="5" ry="4.5" fill="#22c55e"/>
      <circle cx="20.5" cy="17.5" r="1.2" fill="white"/>
      <circle cx="21" cy="18" r="0.6" fill="#1e293b"/>
      <circle cx="23.5" cy="17.5" r="1.2" fill="white"/>
      <circle cx="24" cy="18" r="0.6" fill="#1e293b"/>
      <path d="M24,22 L28,25 M24,22 L28,21" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round"/>
      <ellipse cx="10" cy="42" rx="3.5" ry="2.5" fill="#16a34a" transform="rotate(-20,10,42)"/>
    </svg>
  );
}

export function LadderSVG() {
  return (
    <svg viewBox="0 0 30 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="5" y1="4" x2="5" y2="44" stroke="#92400e" strokeWidth="3" strokeLinecap="round"/>
      <line x1="25" y1="4" x2="25" y2="44" stroke="#92400e" strokeWidth="3" strokeLinecap="round"/>
      <line x1="5" y1="11" x2="25" y2="11" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="5" y1="21" x2="25" y2="21" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="5" y1="31" x2="25" y2="31" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="5" y1="41" x2="25" y2="41" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

export function SunSVG() {
  return (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="22" r="9" fill="#fbbf24"/>
      {[0,45,90,135,180,225,270,315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 22 + 12 * Math.cos(rad);
        const y1 = 22 + 12 * Math.sin(rad);
        const x2 = 22 + 17 * Math.cos(rad);
        const y2 = 22 + 17 * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>;
      })}
      <circle cx="22" cy="22" r="5" fill="#fde68a" opacity="0.6"/>
    </svg>
  );
}

export function ShellSVG() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20,35 C10,35 5,27 5,20 C5,13 10,7 20,5 C30,7 35,13 35,20 C35,27 30,35 20,35 Z"
        fill="#fce7f3" stroke="#f472b6" strokeWidth="1"/>
      <path d="M20,35 L20,5" stroke="#f9a8d4" strokeWidth="1.5" opacity="0.6"/>
      <path d="M7,14 Q20,11 33,14" stroke="#f9a8d4" strokeWidth="1.2" fill="none" opacity="0.5"/>
      <path d="M6,20 Q20,17 34,20" stroke="#f9a8d4" strokeWidth="1.2" fill="none" opacity="0.5"/>
      <path d="M8,26 Q20,23 32,26" stroke="#f9a8d4" strokeWidth="1.2" fill="none" opacity="0.5"/>
      <circle cx="20" cy="35" r="2.5" fill="#f472b6" opacity="0.7"/>
    </svg>
  );
}

export function SurfboardSVG() {
  return (
    <svg viewBox="0 0 20 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10,2 Q16,10 16,25 Q16,40 10,48 Q4,40 4,25 Q4,10 10,2 Z"
        fill="#0ea5e9" stroke="#0284c7" strokeWidth="1"/>
      <line x1="10" y1="8" x2="10" y2="42" stroke="white" strokeWidth="1.5" opacity="0.5"/>
      <ellipse cx="10" cy="32" rx="4" ry="2.5" fill="#fbbf24" opacity="0.8"/>
    </svg>
  );
}

export function WaveSVG() {
  return (
    <svg viewBox="0 0 48 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2,14 C8,6 14,20 20,14 C26,8 32,20 38,14 C42,10 45,16 48,12 L48,28 L2,28 Z"
        fill="#38bdf8" opacity="0.5"/>
      <path d="M2,18 C10,12 18,22 26,17 C32,13 38,20 48,16 L48,28 L2,28 Z"
        fill="#0284c7" opacity="0.35"/>
      <path d="M2,10 C6,6 10,14 14,10 C18,6 24,14 28,10 C32,6 36,12 40,9"
        stroke="#bae6fd" strokeWidth="1.5" fill="none" opacity="0.7"/>
    </svg>
  );
}

export function DiceSVG() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="32" height="32" rx="7" fill="#818cf8" stroke="#6366f1" strokeWidth="1.5"/>
      <circle cx="13" cy="13" r="3" fill="white"/>
      <circle cx="27" cy="13" r="3" fill="white"/>
      <circle cx="13" cy="27" r="3" fill="white"/>
      <circle cx="27" cy="27" r="3" fill="white"/>
      <circle cx="20" cy="20" r="3" fill="white"/>
    </svg>
  );
}

// Map of illustrations — deterministic by position
const ILLUSTRATIONS = [
  FishSVG, CrabSVG, StarfishSVG, AnchorSVG, SnakeSVG,
  LadderSVG, SunSVG, ShellSVG, SurfboardSVG, WaveSVG, DiceSVG,
];

export function getCellIllustration(dayOfMonth: number, colIndex: number): React.ComponentType | null {
  // Show in ~1 out of 3 empty cells, deterministically
  const seed = dayOfMonth * 7 + colIndex;
  if (seed % 3 !== 0) return null;
  return ILLUSTRATIONS[seed % ILLUSTRATIONS.length];
}
