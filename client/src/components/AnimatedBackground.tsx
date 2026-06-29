import { useEffect, useRef } from "react";

// Black & white animated background: a chain of rings trails the cursor with a
// soft light halo, while faint ambient circles drift behind. Pure monochrome.
export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const canvas: HTMLCanvasElement = canvasEl;
    const ctx0 = canvas.getContext("2d");
    if (!ctx0) return;
    const ctx = ctx0; // non-null, preserved inside the animation closures

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Cursor target + a chain of followers (comet trail).
    const target = { x: w / 2, y: h / 2 };
    const followers = Array.from({ length: 8 }, () => ({ x: w / 2, y: h / 2 }));

    // Ambient drifting rings.
    const ambient = Array.from({ length: 12 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 30 + Math.random() * 170,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
    }));

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    function onMove(e: MouseEvent) {
      target.x = e.clientX;
      target.y = e.clientY;
    }
    function onTouch(e: TouchEvent) {
      if (e.touches[0]) {
        target.x = e.touches[0].clientX;
        target.y = e.touches[0].clientY;
      }
    }

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouch, { passive: true });

    function drawAmbient() {
      for (const a of ambient) {
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }

    let raf = 0;
    function frame() {
      // Motion-blur trail: fade previous frame toward black.
      ctx.fillStyle = "rgba(0,0,0,0.16)";
      ctx.fillRect(0, 0, w, h);

      // Ambient rings drift and wrap around the screen.
      for (const a of ambient) {
        a.x += a.dx;
        a.y += a.dy;
        if (a.x < -a.r) a.x = w + a.r;
        if (a.x > w + a.r) a.x = -a.r;
        if (a.y < -a.r) a.y = h + a.r;
        if (a.y > h + a.r) a.y = -a.r;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.07)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Soft light halo around the cursor head.
      const head = followers[0];
      const glow = ctx.createRadialGradient(
        head.x,
        head.y,
        0,
        head.x,
        head.y,
        200
      );
      glow.addColorStop(0, "rgba(255,255,255,0.10)");
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(head.x - 200, head.y - 200, 400, 400);

      // Each follower eases toward the previous one -> trailing comet of rings.
      let px = target.x;
      let py = target.y;
      followers.forEach((f, i) => {
        f.x += (px - f.x) * 0.3;
        f.y += (py - f.y) * 0.3;
        px = f.x;
        py = f.y;
        const t = 1 - i / followers.length;
        const radius = 7 + i * 6;
        ctx.beginPath();
        ctx.arc(f.x, f.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${0.7 * t})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Bright dot at the cursor head.
      ctx.beginPath();
      ctx.arc(head.x, head.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.fill();

      raf = requestAnimationFrame(frame);
    }

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    if (reduced) {
      drawAmbient();
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
    };
  }, []);

  return <canvas ref={canvasRef} className="bg-canvas" aria-hidden />;
}
