import { useEffect, useState } from "react";

// Ticks locally against a server-provided deadline (epoch ms). The server stays
// authoritative — this is display only.
export function useCountdown(deadline: number | null): number | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!deadline) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [deadline]);

  if (!deadline) return null;
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

export function Countdown({
  deadline,
  label,
}: {
  deadline: number | null;
  label?: string;
}) {
  const seconds = useCountdown(deadline);
  if (seconds === null) return null;
  const urgent = seconds <= 5;
  return (
    <div
      className={`chip ${urgent ? "anim-pop" : ""}`}
      style={
        urgent
          ? {
              background: "linear-gradient(120deg,#ff2e9a,#b91c5c)",
              boxShadow: "0 0 14px -2px rgba(255,46,154,0.8)",
            }
          : undefined
      }
    >
      ⏱️ {label ? `${label} ` : ""}
      {seconds}s
    </div>
  );
}
