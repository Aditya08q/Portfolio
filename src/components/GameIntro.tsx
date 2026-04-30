import { useEffect, useState } from "react";

const STORAGE_KEY = "pixel-portfolio-started";

const GameIntro = () => {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;

    const start = () => {
      if (exiting) return;
      setExiting(true);
      setFlash(true);
      // play a small synth tick using WebAudio
      try {
        const Ctx =
          (window.AudioContext as typeof AudioContext) ||
          (window as any).webkitAudioContext;
        const ctx = new Ctx();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "square";
        o.frequency.setValueAtTime(660, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.18);
        g.gain.setValueAtTime(0.06, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
        o.connect(g).connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + 0.3);
      } catch {}

      window.setTimeout(() => setFlash(false), 260);
      window.setTimeout(() => {
        sessionStorage.setItem(STORAGE_KEY, "1");
        setVisible(false);
      }, 700);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        start();
      }
    };
    const onClick = () => start();

    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, [visible, exiting]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9000] flex items-center justify-center bg-background ${
        exiting ? "game-intro-glitch" : ""
      }`}
      role="dialog"
      aria-label="Press Enter to start"
    >
      {/* Animated background */}
      <div className="absolute inset-0 pixel-stars opacity-80" />
      <div className="absolute inset-0 grid-bg opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="absolute inset-0 pixel-scanlines pointer-events-none" />

      {flash && <div className="absolute inset-0 bg-foreground animate-pixel-flash" />}

      <div className="relative text-center px-6">
        <p className="font-pixel text-[10px] sm:text-xs text-secondary mb-6 tracking-[0.3em]">
          /// SYSTEM BOOT v1.0 ///
        </p>
        <h1 className="font-pixel text-2xl sm:text-5xl text-gradient mb-4 leading-tight">
          ADITYA.exe
        </h1>
        <p className="font-mono text-xs sm:text-sm text-muted-foreground mb-12">
          A pixel portfolio experience
        </p>

        <div className="font-pixel text-[10px] sm:text-sm text-accent animate-pixel-blink">
          ▶ PRESS ENTER TO START
        </div>
        <p className="mt-4 font-mono text-[10px] text-muted-foreground/70">
          (or click anywhere)
        </p>
      </div>
    </div>
  );
};

export default GameIntro;
