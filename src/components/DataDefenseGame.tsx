import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Data Defense — canvas-based pixel mini-game.
 * Renders as a transparent overlay so the site stays visible behind it.
 * Custom-drawn jet (no sprite sheet) + advanced multi-color glow explosions.
 */

const GAME_W = 400;
const GAME_H = 600;
const ROUND_SECONDS = 20;
const BASE_FIRE_RATE = 280;
const FAST_FIRE_RATE = 110;

type Bullet = { x: number; y: number };
type Enemy = { x: number; y: number; speed: number; size: number; kind: "noise" | "data" };
type Particle = {
  type: "core" | "ring" | "spark" | "shock";
  x: number;
  y: number;
  dx?: number;
  dy?: number;
  radius: number;
  life: number;
  maxLife: number;
  color: string;
  glow: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
}

// Multi-color palette per explosion kind for varied glow
const EXPLOSION_PALETTE: Record<"noise" | "data", { core: string; ring: string; spark: string[]; glow: string }> = {
  noise: {
    core: "#FFFFFF",
    ring: "#F97316",
    spark: ["#EF4444", "#F97316", "#FACC15", "#FB7185"],
    glow: "#EF4444",
  },
  data: {
    core: "#FFFFFF",
    ring: "#22C55E",
    spark: ["#22C55E", "#34D399", "#A7F3D0", "#FACC15"],
    glow: "#22C55E",
  },
};

const DataDefenseGame = ({ open, onClose }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [over, setOver] = useState(false);
  const [powered, setPowered] = useState(false);

  const player = useRef({ x: GAME_W / 2, y: GAME_H - 80, tilt: 0 });
  const keys = useRef({ left: false, right: false, fire: false });
  const bullets = useRef<Bullet[]>([]);
  const enemies = useRef<Enemy[]>([]);
  const particles = useRef<Particle[]>([]);
  const lastShot = useRef(0);
  const lastSpawn = useRef(0);
  const powerUntil = useRef(0);
  const startTime = useRef(0);
  const rafRef = useRef(0);
  const scoreRef = useRef(0);
  const overRef = useRef(false);

  const spawnExplosion = useCallback((x: number, y: number, kind: "noise" | "data") => {
    const pal = EXPLOSION_PALETTE[kind];
    // Bright core flash
    particles.current.push({
      type: "core", x, y, radius: 10, life: 12, maxLife: 12,
      color: pal.core, glow: pal.glow,
    });
    // Expanding shock ring
    particles.current.push({
      type: "shock", x, y, radius: 6, life: 22, maxLife: 22,
      color: pal.ring, glow: pal.glow,
    });
    // Secondary inner ring
    particles.current.push({
      type: "ring", x, y, radius: 4, life: 18, maxLife: 18,
      color: pal.core, glow: pal.glow,
    });
    // Colorful pixel sparks
    const count = 16;
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const speed = 1.5 + Math.random() * 3.5;
      particles.current.push({
        type: "spark", x, y,
        dx: Math.cos(ang) * speed,
        dy: Math.sin(ang) * speed,
        radius: 2 + Math.random() * 2,
        life: 22 + Math.floor(Math.random() * 12),
        maxLife: 30,
        color: pal.spark[i % pal.spark.length],
        glow: pal.spark[i % pal.spark.length],
      });
    }
  }, []);

  const reset = useCallback(() => {
    setScore(0); scoreRef.current = 0;
    setTimeLeft(ROUND_SECONDS);
    setOver(false); overRef.current = false;
    setPowered(false);
    player.current = { x: GAME_W / 2, y: GAME_H - 80, tilt: 0 };
    bullets.current = []; enemies.current = []; particles.current = [];
    lastShot.current = 0; lastSpawn.current = 0; powerUntil.current = 0;
    startTime.current = performance.now();
  }, []);

  useEffect(() => {
    if (!open) return;
    reset();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.current.left = true;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.current.right = true;
      if (e.key === " ") { keys.current.fire = true; e.preventDefault(); }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.current.left = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.current.right = false;
      if (e.key === " ") keys.current.fire = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const drawJet = (x: number, y: number, tilt: number, turbo: boolean) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(tilt * 0.05);
      ctx.shadowColor = turbo ? "#FACC15" : "#22C55E";
      ctx.shadowBlur = turbo ? 24 : 18;
      // Body
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(-10, 10);
      ctx.lineTo(10, 10);
      ctx.closePath();
      ctx.fillStyle = "#38BDF8";
      ctx.fill();
      // Inner detail
      ctx.fillStyle = "#0EA5E9";
      ctx.fillRect(-4, -5, 8, 10);
      // Wings
      ctx.fillStyle = "#22C55E";
      ctx.fillRect(-14, 2, 28, 4);
      // Cockpit
      ctx.fillStyle = "#FACC15";
      ctx.fillRect(-2, -8, 4, 4);
      // Flame
      ctx.shadowBlur = 0;
      ctx.fillStyle = Math.random() > 0.5 ? "#F97316" : "#FB923C";
      ctx.beginPath();
      ctx.moveTo(-4, 10);
      ctx.lineTo(4, 10);
      ctx.lineTo(0, 22 + Math.random() * 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const loop = (now: number) => {
      if (overRef.current) return;
      const elapsed = (now - startTime.current) / 1000;
      const remaining = Math.max(0, ROUND_SECONDS - elapsed);
      setTimeLeft(Math.ceil(remaining));
      if (remaining <= 0) {
        overRef.current = true;
        setOver(true);
        const earned = Math.max(1, Math.round(scoreRef.current / 5));
        window.dispatchEvent(new CustomEvent("xp:game_score", { detail: { score: scoreRef.current, earned } }));
        return;
      }

      // Movement
      if (keys.current.left) { player.current.x -= 6; player.current.tilt = -3; }
      else if (keys.current.right) { player.current.x += 6; player.current.tilt = 3; }
      else player.current.tilt *= 0.85;
      player.current.x = Math.max(20, Math.min(GAME_W - 20, player.current.x));

      // Shoot
      const turbo = now < powerUntil.current;
      setPowered(turbo);
      const fireRate = turbo ? FAST_FIRE_RATE : BASE_FIRE_RATE;
      if (keys.current.fire && now - lastShot.current > fireRate) {
        lastShot.current = now;
        bullets.current.push({ x: player.current.x, y: player.current.y - 18 });
      }

      // Bullets move
      for (const b of bullets.current) b.y -= 10;
      bullets.current = bullets.current.filter((b) => b.y > -10);

      // Spawn
      const spawnInterval = Math.max(380, 850 - elapsed * 22);
      if (now - lastSpawn.current > spawnInterval) {
        lastSpawn.current = now;
        const isData = Math.random() < 0.22;
        const size = isData ? 16 : 18;
        enemies.current.push({
          x: 20 + Math.random() * (GAME_W - 40),
          y: -size,
          speed: isData ? 2.4 : 2 + Math.random() * 2.2,
          size, kind: isData ? "data" : "noise",
        });
      }

      // Enemies update + collisions
      const survivors: Enemy[] = [];
      for (const e of enemies.current) {
        e.y += e.speed;
        let hit = false;
        for (const b of bullets.current) {
          if (Math.abs(b.x - e.x) < e.size && Math.abs(b.y - e.y) < e.size) {
            hit = true;
            b.y = -999;
            if (e.kind === "noise") {
              scoreRef.current += 10; setScore(scoreRef.current);
              spawnExplosion(e.x, e.y, "noise");
            } else {
              scoreRef.current += 25; setScore(scoreRef.current);
              powerUntil.current = now + 5000;
              spawnExplosion(e.x, e.y, "data");
            }
            break;
          }
        }
        // Player collect / collide
        if (!hit && Math.abs(player.current.x - e.x) < 18 && Math.abs(player.current.y - e.y) < 18) {
          if (e.kind === "data") {
            scoreRef.current += 20; setScore(scoreRef.current);
            powerUntil.current = now + 5000;
            spawnExplosion(e.x, e.y, "data");
          } else {
            scoreRef.current = Math.max(0, scoreRef.current - 5); setScore(scoreRef.current);
            spawnExplosion(player.current.x, player.current.y, "noise");
          }
          hit = true;
        }
        if (!hit && e.y > GAME_H + 20) continue;
        if (!hit) survivors.push(e);
      }
      enemies.current = survivors;
      bullets.current = bullets.current.filter((b) => b.y > -10);

      // Particles
      for (const p of particles.current) {
        if (p.type === "spark") { p.x += p.dx!; p.y += p.dy!; p.dy! += 0.05; }
        else if (p.type === "shock") { p.radius += 2.2; }
        else if (p.type === "ring") { p.radius += 1.2; }
        else if (p.type === "core") { p.radius *= 0.85; }
        p.life--;
      }
      particles.current = particles.current.filter((p) => p.life > 0);

      // ===== DRAW =====
      ctx.clearRect(0, 0, GAME_W, GAME_H);

      // Bullets (glowing)
      ctx.save();
      ctx.shadowColor = "#FACC15";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#FACC15";
      for (const b of bullets.current) ctx.fillRect(b.x - 2, b.y, 4, 10);
      ctx.restore();

      // Enemies (glowing pixel blocks)
      for (const e of enemies.current) {
        ctx.save();
        const isNoise = e.kind === "noise";
        ctx.shadowColor = isNoise ? "#EF4444" : "#22C55E";
        ctx.shadowBlur = 14;
        ctx.fillStyle = isNoise ? "#EF4444" : "#22C55E";
        ctx.fillRect(e.x - e.size / 2, e.y - e.size / 2, e.size, e.size);
        ctx.fillStyle = isNoise ? "#7f1d1d" : "#14532d";
        ctx.fillRect(e.x - e.size / 2 + 3, e.y - e.size / 2 + 3, e.size - 6, e.size - 6);
        ctx.restore();
      }

      // Particles (advanced glow)
      for (const p of particles.current) {
        const alpha = Math.max(0, p.life / p.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowColor = p.glow;
        ctx.shadowBlur = 16;
        if (p.type === "spark") {
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x - p.radius / 2, p.y - p.radius / 2, p.radius, p.radius);
        } else if (p.type === "core") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.5, p.radius), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        } else if (p.type === "ring") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (p.type === "shock") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 3;
          ctx.globalAlpha = alpha * 0.7;
          ctx.stroke();
        }
        ctx.restore();
      }

      // Player jet
      drawJet(player.current.x, player.current.y, player.current.tilt, turbo);

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Pointer / touch controls on the canvas
  const onPointerMove = (e: React.PointerEvent) => {
    const rect = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect();
    const ratio = GAME_W / rect.width;
    const localX = (e.clientX - rect.left) * ratio;
    const prev = player.current.x;
    player.current.x = Math.max(20, Math.min(GAME_W - 20, localX));
    player.current.tilt = Math.max(-6, Math.min(6, (player.current.x - prev) * 0.6));
  };
  const onPointerDown = () => (keys.current.fire = true);
  const onPointerUp = () => (keys.current.fire = false);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9500] flex items-center justify-center pointer-events-none animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Data Defense mini-game"
    >
      {/* HUD top bar */}
      <div className="pointer-events-auto absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-6 font-pixel text-xs px-4 py-2 rounded border border-primary/40 bg-background/70 backdrop-blur">
        <span className="text-primary">SCORE {String(score).padStart(4, "0")}</span>
        {powered && <span className="text-accent animate-pulse">⚡ TURBO</span>}
        <span className={timeLeft <= 5 ? "text-destructive animate-pulse" : "text-foreground"}>
          ⏱ {String(timeLeft).padStart(2, "0")}s
        </span>
        <button
          onClick={onClose}
          className="font-mono text-[10px] text-muted-foreground hover:text-primary border border-border px-2 py-0.5 rounded"
          aria-label="Close mini-game"
        >
          ESC ✕
        </button>
      </div>

      {/* Transparent canvas overlay (site visible behind) */}
      <canvas
        ref={canvasRef}
        width={GAME_W}
        height={GAME_H}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className="pointer-events-auto"
        style={{
          width: "min(92vw, 400px)",
          aspectRatio: `${GAME_W} / ${GAME_H}`,
          touchAction: "none",
          imageRendering: "pixelated",
          background: "transparent",
        }}
      />

      {/* Controls hint */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] text-muted-foreground/80 bg-background/50 px-3 py-1 rounded">
        ◀▶ / A D move • SPACE fire • drag &amp; tap on mobile
      </div>

      {/* Game over panel */}
      {over && (
        <div className="pointer-events-auto absolute inset-0 grid place-items-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="pixel-card p-6 text-center max-w-[80%] bg-surface/90">
            <p className="font-pixel text-primary text-sm mb-2">MODEL PERFORMANCE COMPLETE</p>
            <p className="font-mono text-xs text-muted-foreground mb-4">
              Final Score: <span className="text-accent">{score}</span>
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  onClose();
                  document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="font-pixel text-xs bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90"
              >
                VIEW PROJECTS
              </button>
              <button
                onClick={reset}
                className="font-mono text-xs text-muted-foreground hover:text-foreground"
              >
                play again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataDefenseGame;
