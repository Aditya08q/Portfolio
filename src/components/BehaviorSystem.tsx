import { useEffect, useRef, useState } from "react";

type HintKind = "idle" | "inactive" | "repeat";

interface Hint {
  id: number;
  kind: HintKind;
  text: string;
}

const BehaviorSystem = () => {
  const [hints, setHints] = useState<Hint[]>([]);
  const [glitch, setGlitch] = useState(false);
  const idRef = useRef(0);

  // Activity timers
  const idleTimer = useRef<number | null>(null);
  const inactiveTimer = useRef<number | null>(null);
  const idleShown = useRef(false);
  const inactiveShown = useRef(false);

  // Scroll velocity
  const lastScrollY = useRef(0);
  const lastScrollT = useRef(0);
  const lastGlitch = useRef(0);

  // Project hover repetition
  const projectHovers = useRef(0);
  const lastHoveredTile = useRef<Element | null>(null);
  const repeatHintShown = useRef(false);

  // Section entry emphasis
  const emphasizedSections = useRef<Set<string>>(new Set());

  const pushHint = (kind: HintKind, text: string, ttl = 3500) => {
    const id = idRef.current++;
    setHints((prev) => [...prev.filter((h) => h.kind !== kind), { id, kind, text }]);
    window.setTimeout(() => {
      setHints((prev) => prev.filter((h) => h.id !== id));
    }, ttl);
  };

  // ============ Idle / inactivity ============
  useEffect(() => {
    const reset = () => {
      // Clear hints when user comes back
      if (idleShown.current || inactiveShown.current) {
        setHints((prev) => prev.filter((h) => h.kind === "repeat"));
      }
      idleShown.current = false;
      inactiveShown.current = false;

      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      if (inactiveTimer.current) window.clearTimeout(inactiveTimer.current);

      idleTimer.current = window.setTimeout(() => {
        idleShown.current = true;
        pushHint("idle", "TRY EXPLORING PROJECTS ▾", 6000);
      }, 5000);

      inactiveTimer.current = window.setTimeout(() => {
        inactiveShown.current = true;
        pushHint("inactive", "STILL THERE?", 5000);
      }, 10000);
    };

    const events: (keyof WindowEventMap)[] = ["mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      if (inactiveTimer.current) window.clearTimeout(inactiveTimer.current);
    };
  }, []);

  // ============ Fast scroll glitch ============
  useEffect(() => {
    const onScroll = () => {
      const now = performance.now();
      const y = window.scrollY;
      const dt = now - lastScrollT.current;
      const dy = Math.abs(y - lastScrollY.current);
      lastScrollY.current = y;
      lastScrollT.current = now;
      if (dt > 0 && dt < 80) {
        const velocity = dy / dt; // px per ms
        if (velocity > 3 && now - lastGlitch.current > 400) {
          lastGlitch.current = now;
          setGlitch(true);
          window.setTimeout(() => setGlitch(false), 150);
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ============ Repeat hover on projects ============
  useEffect(() => {
    const onOver = (e: MouseEvent) => {
      const tile = (e.target as HTMLElement)?.closest("[data-cursor='project'], .pixel-tile");
      if (!tile) return;
      if (lastHoveredTile.current === tile) return;
      lastHoveredTile.current = tile;
      projectHovers.current += 1;
      if (projectHovers.current >= 3 && !repeatHintShown.current) {
        repeatHintShown.current = true;
        pushHint("repeat", "CLICK TO OPEN ➜", 4500);
      }
    };
    const onClick = (e: MouseEvent) => {
      const tile = (e.target as HTMLElement)?.closest("[data-cursor='project'], .pixel-tile");
      if (tile) {
        // Dismiss repeat hint once user clicks
        setHints((prev) => prev.filter((h) => h.kind !== "repeat"));
      }
    };
    document.addEventListener("mouseover", onOver);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("click", onClick);
    };
  }, []);

  // ============ Section entry emphasis ============
  useEffect(() => {
    const projects = document.getElementById("projects");
    const contact = document.getElementById("contact");
    if (!projects && !contact) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.35) continue;
          const id = entry.target.id;
          if (emphasizedSections.current.has(id)) continue;
          emphasizedSections.current.add(id);

          if (id === "projects") {
            const map = entry.target.querySelector(".pixel-map-bg");
            if (map) {
              map.classList.add("emphasize-zoom");
              window.setTimeout(() => map.classList.remove("emphasize-zoom"), 1400);
            }
          } else if (id === "contact") {
            const cta = entry.target.querySelector("button[type='submit'], .pixel-cta, [data-cta='primary']");
            if (cta) {
              cta.classList.add("emphasize-pulse");
              window.setTimeout(() => cta.classList.remove("emphasize-pulse"), 2400);
            }
          }
        }
      },
      { threshold: [0.35] }
    );

    if (projects) observer.observe(projects);
    if (contact) observer.observe(contact);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Fast scroll glitch overlay */}
      {glitch && (
        <div
          className="fixed inset-0 z-[6800] pointer-events-none behavior-glitch-flash"
          aria-hidden="true"
        />
      )}

      {/* Hint stack — bottom-center */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[6900] pointer-events-none flex flex-col items-center gap-2"
        aria-live="polite"
      >
        {hints.map((h) => (
          <div
            key={h.id}
            className={`behavior-hint behavior-hint-${h.kind}`}
            data-kind={h.kind}
          >
            <span className="behavior-hint-dot" />
            {h.text}
          </div>
        ))}
      </div>
    </>
  );
};

export default BehaviorSystem;
