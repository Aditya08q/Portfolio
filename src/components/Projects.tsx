import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Sparkles, Lock } from "lucide-react";
import ProjectModal, { ProjectData } from "./ProjectModal";

const PROJECTS: (ProjectData & { highlight?: boolean; accent: "primary" | "secondary" | "accent" })[] = [
  {
    title: "MiniGPT Transformer on tiny story dataset",
    tagline: "GPT-style language model — built from scratch",
    description:
      "An end-to-end transformer language model implemented from first principles. Includes byte-pair tokenization, multi-head self-attention, positional encodings, and a streaming inference pipeline. Trained on a curated corpus and evaluated on perplexity benchmarks.",
    tags: ["Deep Learning", "Transformer"],
    tech: ["PyTorch", "Python", "CUDA", "BPE Tokenizer", "Weights & Biases"],
    highlight: true,
    accent: "primary",
    links: [
      { label: "VIEW CODE", href: "https://github.com/Aditya08q/minigpt_transformer", icon: "github" },
      { label: "READ PAPER", href: "#", icon: "external" },
    ],
  },
  {
    title: "Fake News Detection",
    tagline: "NLP classifier for misinformation at scale",
    description:
      "A robust NLP pipeline that classifies news articles as real or fake using TF-IDF features and a fine-tuned transformer ensemble. Includes a streamlit dashboard for interactive exploration and per-token attention visualization.",
    tags: ["NLP", "ML"],
    tech: ["scikit-learn", "Streamlit", "Pandas"],
    accent: "secondary",
    links: [
      { label: "VIEW CODE", href: "https://github.com/Aditya08q/Fake_news_detection", icon: "github" },
      { label: "LIVE DEMO", href: "#", icon: "external" },
    ],
  },
  {
    title: "AI Avatar",
    tagline: "Browser-based AI avatar with voice, memory, and agent intelligence",
    description:
      "A browser-based AI avatar that simulates human-like conversation, remembers previous interactions, and can act as a personal assistant with integrated agent intelligence.",
    tags: ["GenAI", "LLM"],
    tech: ["TensorFlow", "Three.js", "Keras", "NumPy","Python","VRM","FastAPI"],
    accent: "accent",
    links: [
      { label: "VIEW CODE", href: "https://github.com/Aditya08q/Ar_avatar_fullstack", icon: "github" },
      { label: "LIVE DEMO", href: "https://ar-avatar-fullstack.vercel.app/", icon: "external" },
    ],
  },
];

const accentClass = (a: "primary" | "secondary" | "accent") =>
  a === "primary"
    ? "border-primary text-primary bg-primary/10"
    : a === "secondary"
    ? "border-secondary text-secondary bg-secondary/10"
    : "border-accent text-accent bg-accent/10";

const Projects = () => {
  const [active, setActive] = useState(0);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const tilesRef = useRef<(HTMLButtonElement | null)[]>([]);

  // Keyboard navigation between tiles
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (openIdx !== null) return; // modal handles its own keys
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const section = document.getElementById("projects");
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.6 && rect.bottom > window.innerHeight * 0.2;
      if (!inView) return;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(PROJECTS.length - 1, i + 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        tilesRef.current[active]?.click();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, openIdx]);

  const openPortal = (i: number) => {
    setActive(i);
    const el = document.createElement("div");
    el.className = "fixed inset-0 z-[7500] pixel-portal-flash pointer-events-none";
    document.body.appendChild(el);
    window.setTimeout(() => el.remove(), 600);
    // Notify XP system
    const tile = tilesRef.current[i];
    const rect = tile?.getBoundingClientRect();
    window.dispatchEvent(
      new CustomEvent("xp:project_open", {
        detail: {
          index: i,
          x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
          y: rect ? rect.top : 120,
        },
      })
    );
    window.setTimeout(() => setOpenIdx(i), 180);
  };

  return (
    <section id="projects" className="relative py-24 sm:py-32 bg-surface/40">
      <div className="max-w-content mx-auto px-6">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
          <div>
            <p className="section-heading">{"// 02_world_map"}</p>
            <h2 className="font-pixel text-xl sm:text-3xl text-foreground">Select Level</h2>
          </div>
          <p className="text-muted-foreground max-w-md font-mono text-sm">
            ◀ ▶ navigate · ENTER open · or click a tile
          </p>
        </div>

        {/* Level map */}
        <div className="relative pixel-map-bg rounded-xl border-2 border-border p-6 sm:p-10">
          {/* Path connecting tiles */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <path
              d="M 12 80 Q 30 30 50 60 T 88 25"
              fill="none"
              stroke="hsl(var(--primary) / 0.4)"
              strokeWidth="0.6"
              strokeDasharray="2 2"
              className="pixel-path"
            />
          </svg>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 min-h-[420px] items-center">
            {PROJECTS.map((p, i) => {
              const isActive = active === i;
              return (
                <div
                  key={p.title}
                  className="relative flex flex-col items-center"
                  style={{
                    transform: `translateY(${i === 1 ? "-30px" : i === 0 ? "30px" : "-10px"})`,
                  }}
                >
                  <button
                    ref={(el) => (tilesRef.current[i] = el)}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => openPortal(i)}
                    data-cursor="project"
                    className={`relative pixel-tile group w-full max-w-xs ${
                      isActive ? "pixel-tile-active" : ""
                    }`}
                    aria-label={`Open project: ${p.title}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-10 h-10 rounded-md grid place-items-center border-2 ${accentClass(
                          p.accent
                        )}`}
                      >
                        <span className="font-pixel text-[10px]">0{i + 1}</span>
                      </div>
                      {p.highlight ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-pixel text-accent">
                          <Sparkles size={12} /> BOSS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-pixel text-muted-foreground">
                          <Lock size={10} /> LV.0{i + 1}
                        </span>
                      )}
                    </div>

                    <h3 className="font-pixel text-xs sm:text-sm text-foreground mb-3 leading-snug text-left">
                      {p.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed text-left mb-4">
                      {p.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {p.tags.map((t) => (
                        <span
                          key={t}
                          className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-surface border border-border text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-mono text-primary">
                      ENTER PORTAL <ArrowUpRight size={12} />
                    </span>
                  </button>

                  {/* Tile shadow / base */}
                  <div className="pixel-tile-base mt-1" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ProjectModal
        project={openIdx !== null ? PROJECTS[openIdx] : null}
        onClose={() => setOpenIdx(null)}
      />
    </section>
  );
};

export default Projects;
