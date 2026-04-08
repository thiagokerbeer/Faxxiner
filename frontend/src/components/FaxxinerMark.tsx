import { useId } from "react";

type Props = {
  className?: string;
  /** Cabeçalho (44px) ou rodapé / compacto (36px) */
  size?: "md" | "sm";
};

/**
 * Símbolo Faxxiner: lar + brilho (casa com estrela), gradiente rosa da marca.
 * Cada instância usa um id único de gradiente para não colidir no DOM.
 */
export function FaxxinerMark({ className = "", size = "md" }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gradId = `fx-grad-${uid}`;
  const glossId = `fx-gloss-${uid}`;
  const px = size === "sm" ? 36 : 44;

  return (
    <svg
      className={className}
      width={px}
      height={px}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9d174d" />
          <stop offset="0.35" stopColor="#db2777" />
          <stop offset="1" stopColor="#f9a8d4" />
        </linearGradient>
        <linearGradient id={glossId} x1="24" y1="4" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect x="2" y="2" width="44" height="44" rx="13" fill={`url(#${gradId})`} />
      <rect x="4" y="4" width="40" height="22" rx="10" fill={`url(#${glossId})`} />

      {/* Casa — lar cuidado */}
      <path
        fill="white"
        fillOpacity={0.96}
        d="M24 12.2L13.8 21.4h2.9v12.9h6.9v-7.4h4.8v7.4h6.9V21.4h2.9L24 12.2z"
      />
      <rect x="20.5" y="26" width="7" height="8.3" rx="1" fill="#fce7f3" fillOpacity={0.35} />

      {/* Brilho / “faxina feita” */}
      <path
        fill="white"
        d="M35.2 9.4l1 2.1 2.3.3-1.65 1.7.4 2.35-2.05-1.1-2.05 1.1.4-2.35-1.65-1.7 2.3-.3 1-2.1z"
      />
      <circle cx="11.5" cy="33.5" r="2.2" fill="white" fillOpacity={0.45} />
      <circle cx="15.2" cy="36" r="1.1" fill="white" fillOpacity={0.35} />
    </svg>
  );
}
