import { useEffect, useRef, useState } from "react";

interface Coin {
  id: number;
  left: number;
  top: number;
  duration: number;
}
interface Bird {
  id: number;
  top: number;
  duration: number;
  direction: 1 | -1;
}

const AmbientEffects = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [birds, setBirds] = useState<Bird[]>([]);
  const [glitching, setGlitching] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Moving star-field canvas (space drift)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0, h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    type Star = {
      x: number; y: number;
      vx: number; vy: number;
      size: number;
      alpha: number;
      twinkle: number;
      shade: number; // 0-1 (0 = dim green, 1 = bright white-green)
    };
    let stars: Star[] = [];

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const seed = () => {
      const count = Math.min(180, Math.floor((w * h) / 9000));
      stars = Array.from({ length: count }, () => {
        const size = Math.random() < 0.85 ? 1 : Math.random() < 0.7 ? 2 : 3;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: rand(-0.15, 0.15),
          vy: rand(-0.15, 0.15),
          size,
          alpha: rand(0.3, 1),
          twinkle: rand(0.005, 0.03) * (Math.random() < 0.5 ? -1 : 1),
          shade: Math.random(),
        };
      });
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        // wander: slight random drift + slow velocity changes
        s.vx += rand(-0.01, 0.01);
        s.vy += rand(-0.01, 0.01);
        s.vx = Math.max(-0.4, Math.min(0.4, s.vx));
        s.vy = Math.max(-0.4, Math.min(0.4, s.vy));
        s.x += s.vx;
        s.y += s.vy;
        // wrap around screen
        if (s.x < -2) s.x = w + 2;
        if (s.x > w + 2) s.x = -2;
        if (s.y < -2) s.y = h + 2;
        if (s.y > h + 2) s.y = -2;
        // twinkle
        s.alpha += s.twinkle;
        if (s.alpha > 1) { s.alpha = 1; s.twinkle = -Math.abs(s.twinkle); }
        if (s.alpha < 0.2) { s.alpha = 0.2; s.twinkle = Math.abs(s.twinkle); }

        // green palette: dim green -> bright green -> near white-green
        const lightness = 40 + s.shade * 50; // 40-90
        const sat = 70 + s.shade * 20;
        ctx.fillStyle = `hsla(142, ${sat}%, ${lightness}%, ${s.alpha})`;
        ctx.shadowColor = `hsla(142, 90%, 60%, ${s.alpha * 0.8})`;
        ctx.shadowBlur = s.size * 3;
        ctx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Coins: every 5–10s
  useEffect(() => {
    let id = 0;
    let timer: number;
    const spawn = () => {
      const coin: Coin = {
        id: id++,
        left: Math.random() * 95,
        top: 10 + Math.random() * 80,
        duration: 1400 + Math.random() * 800,
      };
      setCoins((prev) => [...prev.slice(-6), coin]);
      window.setTimeout(() => {
        setCoins((prev) => prev.filter((c) => c.id !== coin.id));
      }, coin.duration + 200);
      timer = window.setTimeout(spawn, 5000 + Math.random() * 5000);
    };
    timer = window.setTimeout(spawn, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Birds: random interval
  useEffect(() => {
    let id = 1000;
    let timer: number;
    const spawn = () => {
      const direction: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
      const bird: Bird = {
        id: id++,
        top: 8 + Math.random() * 35,
        duration: 7000 + Math.random() * 5000,
        direction,
      };
      setBirds((prev) => [...prev, bird]);
      window.setTimeout(() => {
        setBirds((prev) => prev.filter((b) => b.id !== bird.id));
      }, bird.duration + 200);
      timer = window.setTimeout(spawn, 8000 + Math.random() * 12000);
    };
    timer = window.setTimeout(spawn, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Rare screen glitch (~3% every 8s)
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (Math.random() < 0.12) {
        setGlitching(true);
        window.setTimeout(() => setGlitching(false), 350);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 pixel-grid-scroll opacity-20" />

        {coins.map((c) => (
          <div
            key={c.id}
            className="absolute pixel-coin"
            style={{ left: `${c.left}%`, top: `${c.top}%`, animationDuration: `${c.duration}ms` }}
          >
            <span className="pixel-coin-face" />
          </div>
        ))}

        {birds.map((b) => (
          <div
            key={b.id}
            className="pixel-bird"
            style={{
              top: `${b.top}%`,
              animationDuration: `${b.duration}ms`,
              transform: `scaleX(${b.direction})`,
              left: b.direction === 1 ? "-40px" : "auto",
              right: b.direction === -1 ? "-40px" : "auto",
              animationName: b.direction === 1 ? "bird-fly-right" : "bird-fly-left",
            }}
          >
            <span className="pixel-bird-wing" />
          </div>
        ))}
      </div>

      {glitching && (
        <div className="pointer-events-none fixed inset-0 z-[7000] pixel-screen-glitch" aria-hidden="true" />
      )}
    </>
  );
};

export default AmbientEffects;
