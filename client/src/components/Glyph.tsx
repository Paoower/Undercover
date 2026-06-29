// Renders a monochrome avatar shape as an SVG glyph (uses currentColor).
export function Glyph({ shape, size = 24 }: { shape: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "currentColor",
  } as const;

  switch (shape) {
    case "ring":
      return (
        <svg {...common} fill="none">
          <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2.6" />
        </svg>
      );
    case "triangle":
      return (
        <svg {...common}>
          <path d="M12 4 L20 19 L4 19 Z" />
        </svg>
      );
    case "square":
      return (
        <svg {...common}>
          <rect x="5" y="5" width="14" height="14" rx="2" />
        </svg>
      );
    case "diamond":
      return (
        <svg {...common}>
          <path d="M12 3 L21 12 L12 21 L3 12 Z" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="M12 3 l2.6 5.7 6.3 .6 -4.7 4.2 1.3 6.2 -5.5 -3.2 -5.5 3.2 1.3 -6.2 -4.7 -4.2 6.3 -.6 Z" />
        </svg>
      );
    case "hexagon":
      return (
        <svg {...common}>
          <path d="M6 4 H18 L22 12 L18 20 H6 L2 12 Z" />
        </svg>
      );
    case "pentagon":
      return (
        <svg {...common}>
          <path d="M12 3 L21 10 L17.5 21 L6.5 21 L3 10 Z" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M9 3 h6 v6 h6 v6 h-6 v6 H9 v-6 H3 V9 h6 Z" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...common}>
          <path d="M13 2 L4 14 H11 L9 22 L20 9 H13 Z" />
        </svg>
      );
    case "droplet":
      return (
        <svg {...common}>
          <path d="M12 3 C7 9 6 12 6 15 a6 6 0 0 0 12 0 C18 12 17 9 12 3 Z" />
        </svg>
      );
    case "cross":
      return (
        <svg {...common}>
          <path d="M5 6.4 L6.4 5 L12 10.6 L17.6 5 L19 6.4 L13.4 12 L19 17.6 L17.6 19 L12 13.4 L6.4 19 L5 17.6 L10.6 12 Z" />
        </svg>
      );
    case "circle":
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7" />
        </svg>
      );
  }
}
