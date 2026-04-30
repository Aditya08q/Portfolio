import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import PixelButton from "./PixelButton";
import { Menu, X } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

const NAV = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const sections = ["home", "about", "projects", "experience", "contact"];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom >= 120) {
          setActive(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "glass-pixel" : "bg-transparent"
      )}
      style={{ height: 72 }}
    >
      <div className="max-w-content mx-auto h-full px-6 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-md bg-primary/10 border-2 border-primary grid place-items-center font-pixel text-primary text-xs group-hover:animate-glow-pulse">
            AS
          </div>
          <span className="font-pixel text-[10px] text-foreground hidden sm:inline">aditya.dev</span>
        </a>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((item) => {
            const id = item.href.slice(1);
            const isActive = active === id;
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all relative",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 bg-primary" />
                )}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <PixelButton size="sm" className="hidden sm:inline-flex" onClick={async () => {
            try {
              const snap = await getDoc(doc(db, "site", "resume"));
              const url = snap.exists() ? (snap.data() as any).url : null;
              if (url) window.open(url, "_blank");
              else toast.error("Resume not available yet");
            } catch {
              toast.error("Could not load resume");
            }
          }}>
            Resume
          </PixelButton>
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden glass-pixel border-t border-border animate-fade-in">
          <nav className="flex flex-col p-4 gap-2 max-w-content mx-auto">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-md text-sm hover:bg-surface text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
