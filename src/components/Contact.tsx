import { useState } from "react";
import PixelButton from "./PixelButton";
import { toast } from "sonner";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill out all fields");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (form.name.length > 100 || form.message.length > 2000) {
      toast.error("Input too long");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: "9c4d6130-63ab-43e0-96d9-1505442c3e89",
          name: form.name,
          email: form.email,
          message: form.message,
          subject: `New portfolio message from ${form.name}`,
          from_name: "Portfolio Contact Form",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Message sent! I'll get back to you soon ✨");
        setForm({ name: "", email: "", message: "" });
      } else {
        toast.error(data.message || "Failed to send. Try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="relative py-24 sm:py-32 bg-surface/40">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="section-heading">{"// 04_contact"}</p>
        <h2 className="font-pixel text-xl sm:text-3xl text-foreground mb-4">
          Let's Build <span className="text-gradient">Something</span>
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg mb-10 max-w-xl mx-auto">
          Open to internships, collaborations, and ML roles. Drop a message — I reply fast.
        </p>

        <form onSubmit={submit} className="pixel-card p-6 sm:p-8 text-left space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="font-mono text-xs text-muted-foreground block mb-2">$ name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="w-full bg-background border-2 border-border rounded-md px-4 py-3 text-foreground font-mono text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="font-mono text-xs text-muted-foreground block mb-2">$ email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@domain.com"
                className="w-full bg-background border-2 border-border rounded-md px-4 py-3 text-foreground font-mono text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="font-mono text-xs text-muted-foreground block mb-2">$ message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={5}
              placeholder="Tell me about your project, idea, or role..."
              className="w-full bg-background border-2 border-border rounded-md px-4 py-3 text-foreground font-mono text-sm focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>
          <div className="flex justify-end">
            <PixelButton type="submit" disabled={sending}>{sending ? "Sending..." : "Send Message"}</PixelButton>
          </div>
        </form>

        <div className="flex justify-center gap-3 mt-10">
          {[
            { Icon: Github, href: "https://github.com/Aditya08q", label: "GitHub" },
            { Icon: Linkedin, href: "https://www.linkedin.com/in/aditya-srivastava-388953254/", label: "LinkedIn" },
            { Icon: Twitter, href: "https://x.com/srivastava03q", label: "Twitter" },
            { Icon: Mail, href: "mailto:srivastavaditya303@gmail.com", label: "Email" },
          ].map(({ Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="w-11 h-11 grid place-items-center rounded-md border-2 border-border text-muted-foreground hover:border-primary hover:text-primary hover:-translate-y-0.5 transition-all"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>

      <footer className="mt-20 pt-8 border-t border-border max-w-content mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
        <p className="font-mono text-xs text-muted-foreground">
          © 2026 Aditya Srivastava. Built with ☕ + pixels.
        </p>
        <p className="font-pixel text-[10px] text-primary">PRESS START TO CONNECT</p>
      </footer>
    </section>
  );
};

export default Contact;
