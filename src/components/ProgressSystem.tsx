import { useEffect, useRef, useState, useCallback } from "react";

const XP_RULES = {
  visit_section: 5,
  scroll_depth_25: 2,
  scroll_depth_50: 3,
  scroll_depth_100: 5,
  open_project: 10,
  revisit_project: 2,
} as const;

const THRESHOLDS = [20, 50, 100, 200];
const MAX_XP = THRESHOLDS[THRESHOLDS.length - 1];

const SECTION_IDS = ["home", "about", "projects", "experience", "contact"];

interface Popup {
  id: number;
  x: number;
  y: number;
  amount: number;
  label: string;
}

const levelFromXp = (xp: number) => {
  let lvl = 1;
  for (const t of THRESHOLDS) if (xp >= t) lvl++;
  return Math.min(lvl, THRESHOLDS.length + 1);
};

const ProgressSystem = () => {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [levelFlash, setLevelFlash] = useState(false);
  const idRef = useRef(0);
  const visitedSections = useRef<Set<string>>(new Set());
  const visitedProjects = useRef<Set<number>>(new Set());
  const scrollFlags = useRef({ d25: false, d50: false, d100: false });
  const lastLevel = useRef(1);

  const spawnPopup = useCallback((amount: number, label: string, x?: number, y?: number) => {
    const id = idRef.current++;
    const px = x ?? window.innerWidth / 2 + (Math.random() * 80 - 40);
    const py = y ?? 80 + Math.random() * 40;
    setPopups((prev) => [...prev, { id, x: px, y: py, amount, label }]);
    window.setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== id));
    }, 900);
  }, []);

  const addXp = useCallback(
    (amount: number, label: string, pos?: { x: number; y: number }) => {
      setXp((prev) => {
        const next = Math.min(MAX_XP, prev + amount);
        return next;
      });
      spawnPopup(amount, label, pos?.x, pos?.y);
    },
    [spawnPopup]
  );

  // Watch level changes
  useEffect(() => {
    const newLevel = levelFromXp(xp);
    if (newLevel > lastLevel.current) {
      lastLevel.current = newLevel;
      setLevel(newLevel);
      setLevelFlash(true);
      window.setTimeout(() => setLevelFlash(false), 1200);
    } else {
      setLevel(newLevel);
    }
  }, [xp]);

  // Section visibility tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
            const id = entry.target.id;
            if (id && !visitedSections.current.has(id)) {
              visitedSections.current.add(id);
              const rect = entry.target.getBoundingClientRect();
              addXp(
                XP_RULES.visit_section,
                id.toUpperCase(),
                { x: rect.left + rect.width / 2, y: Math.max(80, rect.top + 40) }
              );
            }
          }
        }
      },
      { threshold: [0.4] }
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [addXp]);

  // Scroll depth tracking
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrolled = doc.scrollTop + window.innerHeight;
      const total = doc.scrollHeight;
      if (total <= window.innerHeight) return;
      const pct = scrolled / total;
      if (!scrollFlags.current.d25 && pct >= 0.25) {
        scrollFlags.current.d25 = true;
        addXp(XP_RULES.scroll_depth_25, "EXPLORER 25%");
      }
      if (!scrollFlags.current.d50 && pct >= 0.5) {
        scrollFlags.current.d50 = true;
        addXp(XP_RULES.scroll_depth_50, "EXPLORER 50%");
      }
      if (!scrollFlags.current.d100 && pct >= 0.98) {
        scrollFlags.current.d100 = true;
        addXp(XP_RULES.scroll_depth_100, "COMPLETIONIST!");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [addXp]);

  // Project open events (dispatched by Projects.tsx)
  useEffect(() => {
    const onOpen = (e: Event) => {
      const ev = e as CustomEvent<{ index: number; x?: number; y?: number }>;
      const idx = ev.detail?.index ?? -1;
      const isRevisit = visitedProjects.current.has(idx);
      visitedProjects.current.add(idx);
      const amount = isRevisit ? XP_RULES.revisit_project : XP_RULES.open_project;
      const label = isRevisit ? "REVISIT +" : "PROJECT OPENED!";
      addXp(amount, label, { x: ev.detail?.x ?? window.innerWidth / 2, y: ev.detail?.y ?? 120 });
    };
    window.addEventListener("xp:project_open", onOpen as EventListener);

    const onGameScore = (e: Event) => {
      const ev = e as CustomEvent<{ score: number; earned: number }>;
      const earned = Math.max(1, ev.detail?.earned ?? 0);
      addXp(earned, `DATA DEFENSE +${ev.detail?.score ?? 0}`, {
        x: window.innerWidth / 2,
        y: 140,
      });
    };
    window.addEventListener("xp:game_score", onGameScore as EventListener);

    return () => {
      window.removeEventListener("xp:project_open", onOpen as EventListener);
      window.removeEventListener("xp:game_score", onGameScore as EventListener);
    };
  }, [addXp]);

  const pct = Math.min(100, (xp / MAX_XP) * 100);

  return (
    <>
      {/* XP bar — top fixed */}
      <div className="fixed top-0 left-0 right-0 z-[7000] pointer-events-none">
        <div className="xp-bar-wrap">
          <div className="xp-bar-track">
            <div className="xp-bar-fill" style={{ width: `${pct}%` }} />
            <div className="xp-bar-shine" style={{ width: `${pct}%` }} />
          </div>
          <div className="xp-bar-meta">
            <span className="xp-bar-level">
              <span className="text-accent">LV.</span>
              <span className="text-foreground">{String(level).padStart(2, "0")}</span>
            </span>
            <span className="xp-bar-xp">
              {xp}/{MAX_XP} XP
            </span>
          </div>
        </div>
      </div>

      {/* Floating XP popups */}
      <div className="pointer-events-none fixed inset-0 z-[7100]" aria-hidden="true">
        {popups.map((p) => (
          <div
            key={p.id}
            className="xp-popup"
            style={{ left: p.x, top: p.y }}
          >
            <span className="xp-popup-amount">+{p.amount} XP</span>
            <span className="xp-popup-label">{p.label}</span>
          </div>
        ))}
      </div>

      {/* Level-up flash */}
      {levelFlash && (
        <div className="pointer-events-none fixed inset-0 z-[7200] grid place-items-center" aria-hidden="true">
          <div className="level-up-flash" />
          <div className="level-up-text font-pixel">
            <span>LEVEL UP!</span>
            <span className="block text-accent text-sm mt-2">LV.{String(level).padStart(2, "0")}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default ProgressSystem;
