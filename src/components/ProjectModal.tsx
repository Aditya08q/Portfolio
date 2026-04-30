import { useEffect, useState } from "react";
import { X, Github, ExternalLink } from "lucide-react";

export interface ProjectData {
  title: string;
  tagline?: string;
  description: string;
  tags: string[];
  tech?: string[];
  links?: { label: string; href: string; icon?: "github" | "external" }[];
}

interface Props {
  project: ProjectData | null;
  onClose: () => void;
}

const STAGES = ["title", "tagline", "description", "tech", "actions"] as const;

const ProjectModal = ({ project, onClose }: Props) => {
  const [stage, setStage] = useState(0);
  const [closing, setClosing] = useState(false);

  // Reset progressive reveal when project changes
  useEffect(() => {
    if (!project) return;
    setClosing(false);
    setStage(0);
    const timers: number[] = [];
    STAGES.forEach((_, i) => {
      timers.push(window.setTimeout(() => setStage(i + 1), 250 + i * 220));
    });
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [project]);

  // ESC + focus lock
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]);

  const handleClose = () => {
    setClosing(true);
    window.setTimeout(onClose, 320);
  };

  if (!project) return null;

  return (
    <div
      className={`pixel-modal-backdrop ${closing ? "is-closing" : ""} grid place-items-center p-4`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Project: ${project.title}`}
    >
      <div
        className={`pixel-modal-panel ${closing ? "is-closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between border-b-2 border-border bg-background/60 px-4 py-2">
          <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
            <span className="w-2 h-2 bg-primary rounded-sm" />
            <span className="w-2 h-2 bg-secondary rounded-sm" />
            <span className="w-2 h-2 bg-accent rounded-sm" />
            <span className="ml-2">~/projects/{project.title.toLowerCase().replace(/\s+/g, "_")}</span>
          </div>
          <button
            onClick={handleClose}
            className="font-pixel text-[10px] text-muted-foreground hover:text-accent flex items-center gap-1 px-2 py-1 border border-border rounded hover:border-accent"
            aria-label="Close project"
          >
            <X size={12} /> ESC
          </button>
        </div>

        <div className="p-6 sm:p-10 space-y-6">
          {/* TITLE */}
          {stage >= 1 && (
            <div className="pixel-modal-line">
              <p className="section-heading">{"// project_loaded"}</p>
              <h2 className="font-pixel text-lg sm:text-2xl text-foreground leading-snug">
                <span className="pixel-typewriter">{project.title}</span>
              </h2>
            </div>
          )}

          {/* TAGLINE */}
          {stage >= 2 && project.tagline && (
            <div className="pixel-modal-line">
              <p className="font-mono text-sm text-secondary">&gt; {project.tagline}</p>
            </div>
          )}

          {/* DESCRIPTION */}
          {stage >= 3 && (
            <div className="pixel-modal-line">
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {project.description}
              </p>
            </div>
          )}

          {/* TECH STACK */}
          {stage >= 4 && (
            <div className="pixel-modal-line">
              <p className="font-pixel text-[10px] text-primary mb-3">// tech_stack</p>
              <div className="flex flex-wrap gap-2">
                {(project.tech ?? project.tags).map((t) => (
                  <span
                    key={t}
                    className="font-mono text-[11px] px-2 py-1 rounded border border-border bg-surface text-foreground"
                    style={{ boxShadow: "2px 2px 0 0 hsl(var(--secondary) / 0.5)" }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ACTIONS */}
          {stage >= 5 && (
            <div className="pixel-modal-line flex flex-wrap gap-3 pt-2">
              {(project.links ?? [
                { label: "VIEW CODE", href: "#", icon: "github" as const },
                { label: "LIVE DEMO", href: "#", icon: "external" as const },
              ]).map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 font-pixel text-[10px] px-4 py-3 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors rounded"
                  style={{ boxShadow: "4px 4px 0 0 hsl(var(--primary) / 0.5)" }}
                >
                  {l.icon === "github" ? <Github size={14} /> : <ExternalLink size={14} />}
                  {l.label}
                </a>
              ))}
              <button
                onClick={handleClose}
                className="inline-flex items-center gap-2 font-pixel text-[10px] px-4 py-3 border-2 border-border text-muted-foreground hover:border-accent hover:text-accent rounded"
              >
                CLOSE [ESC]
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
