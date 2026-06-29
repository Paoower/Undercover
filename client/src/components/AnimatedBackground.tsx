import { useEffect, useRef } from "react";

// Black & white animated background: a chain of rings trails the cursor while
// faint ambient circles drift behind. Pure monochrome.
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
    const followers = Array.from({ length: 7 }, () => ({ x: w / 2, y: h / 2 }));

    // Ambient drifting rings.
    const ambient = Array.from({ length: 10 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 30 + Math.random() * 160,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25,
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

    function drawStatic() {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);
      for (const a of ambient) {
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.05)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    let raf = 0;
    function frame() {
      // Motion-blur trail: fade previous frame toward black.
      ctx.fillStyle = "rgba(0,0,0,0.14)";
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
        ctx.strokeStyle = "rgba(255,255,255,0.045)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Each follower eases toward the previous one -> trailing comet of rings.
      let px = target.x;
      let py = target.y;
      followers.forEach((f, i) => {
        f.x += (px - f.x) * 0.28;
        f.y += (py - f.y) * 0.28;
        px = f.x;
        py = f.y;
        const t = 1 - i / followers.length;
        const radius = 6 + i * 5;
        ctx.beginPath();
        ctx.arc(f.x, f.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${0.5 * t})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Bright dot at the cursor head.
      ctx.beginPath();
      ctx.arc(followers[0].x, followers[0].y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fill();

      raf = requestAnimationFrame(frame);
    }

    if (reduced) {
      drawStatic();
    } else {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);
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
