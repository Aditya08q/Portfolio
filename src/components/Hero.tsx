import { useEffect, useState } from "react";
import PixelButton from "./PixelButton";
import { Github, ArrowDown, Gamepad2 } from "lucide-react";
import DataDefenseGame from "./DataDefenseGame";

const MESSAGES = [
  "Hello 👋",
  "I build AI systems",
  "Transformers, CNNs & Real-world ML",
  "Scroll to explore →",
];

const FIRST = "Aditya";
const LAST = "Srivastava";

const Hero = () => {
  const [lines, setLines] = useState<string[]>([""]);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [nameCaret, setNameCaret] = useState<"first" | "last" | "done">("first");
  const [gameOpen, setGameOpen] = useState(false);

  useEffect(() => {
    let mIdx = 0;
    let cIdx = 0;
    let buffer: string[] = [""];
    let timer: number;
    setLines([""]);

    const tick = () => {
      if (mIdx >= MESSAGES.length) {
        // Pause 5s, then reset and loop
        timer = window.setTimeout(() => {
          mIdx = 0;
          cIdx = 0;
          buffer = [""];
          setLines([""]);
          tick();
        }, 5000);
        return;
      }
      const msg = MESSAGES[mIdx];
      if (cIdx <= msg.length) {
        buffer[mIdx] = msg.slice(0, cIdx);
        setLines([...buffer]);
        cIdx++;
        timer = window.setTimeout(tick, 40);
      } else {
        mIdx++;
        cIdx = 0;
        buffer.push("");
        timer = window.setTimeout(tick, 500);
      }
    };
    timer = window.setTimeout(tick, 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let timer: number;
    let phase: "typeFirst" | "typeLast" | "hold" | "erase" = "typeFirst";
    let i = 0;

    const run = () => {
      if (phase === "typeFirst") {
        setNameCaret("first");
        if (i <= FIRST.length) {
          setFirst(FIRST.slice(0, i));
          i++;
          timer = window.setTimeout(run, 120);
        } else {
          phase = "typeLast";
          i = 0;
          timer = window.setTimeout(run, 200);
        }
      } else if (phase === "typeLast") {
        setNameCaret("last");
        if (i <= LAST.length) {
          setLast(LAST.slice(0, i));
          i++;
          timer = window.setTimeout(run, 120);
        } else {
          phase = "hold";
          timer = window.setTimeout(run, 5000);
        }
      } else if (phase === "hold") {
        setNameCaret("done");
        phase = "erase";
        timer = window.setTimeout(run, 100);
      } else {
        // erase both quickly
        setFirst("");
        setLast("");
        phase = "typeFirst";
        i = 0;
        timer = window.setTimeout(run, 400);
      }
    };
    timer = window.setTimeout(run, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-24 overflow-hidden"
      style={{ background: "var(--gradient-hero)" }}
    >
      {/* Animated star + grid background */}
      <div className="absolute inset-0 star-field pointer-events-none" />
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      <div className="relative max-w-content mx-auto w-full px-6 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/5 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-glow-pulse" />
            <span className="font-mono text-xs text-primary">available for opportunities</span>
          </div>

          <p className="section-heading">{"// machine_learning_engineer"}</p>

          <h1 className="font-pixel text-2xl sm:text-4xl lg:text-5xl leading-tight text-foreground mb-4 min-h-[2.5em]">
            {first}
            {nameCaret === "first" && <span className="blink-caret" />}
            <br />
            <span className="text-gradient">{last}</span>
            {nameCaret !== "first" && <span className="blink-caret" />}
          </h1>

          <h2 className="text-lg sm:text-xl text-secondary font-mono mb-5">
            &gt; Machine Learning Engineer
          </h2>

          <p className="text-muted-foreground max-w-xl text-base sm:text-lg mb-8 leading-relaxed">
            Building intelligent systems, transformers, and real-world AI applications.
          </p>

          <div className="flex flex-wrap gap-4">
            <PixelButton variant="primary" onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}>
              View Projects
            </PixelButton>
            <PixelButton variant="secondary" onClick={() => window.open("https://github.com", "_blank")}>
              <Github size={14} /> GitHub
            </PixelButton>
            <PixelButton variant="secondary" onClick={() => setGameOpen(true)}>
              <Gamepad2 size={14} /> PLAY DATA DEFENSE
            </PixelButton>
          </div>

          <DataDefenseGame open={gameOpen} onClose={() => setGameOpen(false)} />
        </div>

        {/* Chat intro panel */}
        <div className="lg:col-span-5 animate-scale-in">
          <div className="pixel-card p-5 sm:p-6 bg-surface/80 backdrop-blur">
            <div className="flex items-center gap-2 pb-3 border-b border-border mb-4">
              <span className="w-3 h-3 rounded-full bg-destructive" />
              <span className="w-3 h-3 rounded-full bg-accent" />
              <span className="w-3 h-3 rounded-full bg-primary" />
              <span className="ml-2 font-mono text-xs text-muted-foreground">~/ai-bot.sh</span>
            </div>

            <div className="space-y-3 font-mono text-sm min-h-[180px]">
              {lines.map((line, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-primary">$</span>
                  <span className="text-foreground">
                    {line}
                    {i === lines.length - 1 && <span className="blink-caret" />}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span>uptime: ∞</span>
              <span className="text-primary">● online</span>
            </div>
          </div>
        </div>
      </div>

      <a
        href="#about"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-primary transition-colors animate-float"
        aria-label="Scroll down"
      >
        <ArrowDown size={20} />
      </a>
    </section>
  );
};

export default Hero;
