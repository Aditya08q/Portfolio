import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-pixel uppercase tracking-wider rounded-md border-2 transition-all duration-300 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

    const sizes = {
      sm: "text-[10px] px-3 py-2",
      md: "text-[11px] px-5 py-3",
      lg: "text-xs px-6 py-3.5",
    };

    const variants = {
      primary:
        "bg-primary text-primary-foreground border-primary shadow-[4px_4px_0_0_hsl(var(--primary-glow)/0.6)] hover:shadow-[6px_6px_0_0_hsl(var(--primary-glow)/0.8)] hover:-translate-x-0.5 hover:-translate-y-0.5",
      secondary:
        "bg-transparent text-secondary border-secondary shadow-[4px_4px_0_0_hsl(var(--secondary)/0.5)] hover:bg-secondary/10 hover:shadow-[6px_6px_0_0_hsl(var(--secondary)/0.7)] hover:-translate-x-0.5 hover:-translate-y-0.5",
      ghost:
        "bg-transparent text-foreground border-border hover:border-primary hover:text-primary",
    };

    return (
      <button ref={ref} className={cn(base, sizes[size], variants[variant], className)} {...props}>
        {children}
      </button>
    );
  }
);
PixelButton.displayName = "PixelButton";

export default PixelButton;
