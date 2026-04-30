import { useEffect, useRef, useState } from "react";

interface Trail {
  id: number;
  x: number;
  y: number;
}
interface Burst {
  id: number;
  x: number;
  y: number;
  particles: { dx: number; dy: number; color: string }[];
}

type CursorState = "default" | "link" | "project" | "click";

const COLORS = ["primary", "secondary", "accent"];

const PixelCursor = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [state, setState] = useState<CursorState>("default");
  const [clicking, setClicking] = useState(false);
  const [trail, setTrail] = useState<Trail[]>([]);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const idRef = useRef(0);
  const lastTrail = useRef(0);
  const clickTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    document.documentElement.classList.add("pixel-cursor-active");

    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      const now = performance.now();
      if (now - lastTrail.current > 55) {
        lastTrail.current = now;
        const id = idRef.current++;
        setTrail((prev) => [
          ...prev.slice(-8),
          { id, x: e.clientX + (Math.random() * 6 - 3), y: e.clientY + (Math.random() * 6 - 3) },
        ]);
        window.setTimeout(() => {
          setTrail((prev) => prev.filter((t) => t.id !== id));
        }, 500);
      }

      const target = e.target as HTMLElement | null;
      const projectEl = target?.closest("[data-cursor='project'], .pixel-tile");
      const linkEl = target?.closest("a, button, [role='button'], input, textarea, select, label");
      if (projectEl) setState("project");
      else if (linkEl) setState("link");
      else setState("default");
    };

    const onDown = (e: MouseEvent) => {
      setClicking(true);
      if (clickTimeoutRef.current) window.clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = window.setTimeout(() => setClicking(false), 200);

      const id = idRef.current++;
      const particles = Array.from({ length: 12 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.4;
        const dist = 30 + Math.random() * 20;
        return {
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist,
          color: COLORS[i % COLORS.length],
        };
      });
      setBursts((prev) => [...prev, { id, x: e.clientX, y: e.clientY, particles }]);
      window.setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id));
      }, 700);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      document.documentElement.classList.remove("pixel-cursor-active");
    };
  }, []);

  const stateClass =
    state === "project"
      ? "pixel-pointer-target"
      : state === "link"
      ? "pixel-pointer-hand"
      : "pixel-pointer-dot";

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden="true">
      {trail.map((t) => (
        <span key={t.id} className="pixel-trail-dot" style={{ left: t.x, top: t.y }} />
      ))}

      {bursts.map((b) => (
        <div key={b.id} className="absolute" style={{ left: b.x, top: b.y }}>
          {b.particles.map((p, idx) => (
            <span
              key={idx}
              className="pixel-burst-particle"
              style={{
                ["--dx" as any]: `${p.dx}px`,
                ["--dy" as any]: `${p.dy}px`,
                background: `hsl(var(--${p.color}))`,
              }}
            />
          ))}
        </div>
      ))}

      <div
        className={`pixel-pointer-dynamic ${stateClass} ${clicking ? "pixel-pointer-clicking" : ""}`}
        style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
      />
    </div>
  );
};

export default PixelCursor;
