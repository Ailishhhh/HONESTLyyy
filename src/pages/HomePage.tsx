import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  Shield, Type, Eye, Gem, MousePointerClick, Zap, TrendingUp,
  ArrowRight, Check, ChevronRight, Star, Sparkles, Globe,
  BarChart3, Brain, Layers,
  Activity, Target, Telescope, FlaskConical, Cpu,
  MoveRight, X
} from "lucide-react";

// ─── Utility ──────────────────────────────────────────────────────────────────

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── Noise Texture SVG overlay ────────────────────────────────────────────────

const NoiseOverlay = () => (
  <div
    className="pointer-events-none fixed inset-0 z-50 opacity-[0.025]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      backgroundRepeat: "repeat",
      backgroundSize: "128px 128px",
    }}
  />
);

// ─── Animated gradient orb ────────────────────────────────────────────────────

const GlowOrb = ({
  className,
  color = "violet",
}: {
  className?: string;
  color?: string;
}) => {
  const colors: Record<string, string> = {
    violet: "radial-gradient(ellipse, rgba(139,92,246,0.15) 0%, transparent 70%)",
    blue: "radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)",
    cyan: "radial-gradient(ellipse, rgba(34,211,238,0.1) 0%, transparent 70%)",
    white: "radial-gradient(ellipse, rgba(255,255,255,0.06) 0%, transparent 70%)",
  };
  return (
    <div
      className={cn("pointer-events-none absolute", className)}
      style={{ background: colors[color] ?? colors.violet }}
    />
  );
};

// ─── Section wrapper with fade-in ─────────────────────────────────────────────

const Section = ({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

// ─── Label chip ───────────────────────────────────────────────────────────────

const Chip = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-[11px] text-zinc-400 font-medium tracking-widest uppercase">
    {children}
  </div>
);

// ─── Score ring ───────────────────────────────────────────────────────────────

const ScoreRing = ({
  score,
  label,
  color,
}: {
  score: number;
  label: string;
  color: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div ref={ref} className="flex flex-col items-center gap-3">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
          <motion.circle
            cx="32" cy="32" r="28"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={inView ? { strokeDashoffset: offset } : {}}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-bold text-white">{score}</span>
        </div>
      </div>
      <span className="text-[11px] text-zinc-500 font-medium tracking-wide">{label}</span>
    </div>
  );
};

// ─── Feature card ─────────────────────────────────────────────────────────────

const FeatureCard = ({
  icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="group relative p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.04] transition-all duration-500 cursor-default"
    >
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.07) 0%, transparent 60%)" }} />
      <div className="relative">
        <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center mb-4 text-zinc-300 group-hover:text-white transition-colors duration-300">
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-white mb-2 tracking-tight">{title}</h3>
        <p className="text-[13px] text-zinc-500 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

// ─── Pricing card ─────────────────────────────────────────────────────────────

const PricingCard = ({
  plan,
  price,
  description,
  features,
  cta,
  highlighted,
  delay = 0,
}: {
  plan: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  delay?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={cn(
        "relative p-8 rounded-2xl border flex flex-col gap-6 transition-all duration-300",
        highlighted
          ? "border-white/20 bg-white/[0.06]"
          : "border-white/[0.07] bg-white/[0.02]"
      )}
    >
      {highlighted && (
        <>
          <div className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% -20%, rgba(139,92,246,0.12) 0%, transparent 60%)" }} />
          <div className="absolute -top-px left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />
          <div className="absolute top-4 right-4">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-widest uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Popular
            </span>
          </div>
        </>
      )}
      <div className="relative">
        <p className="text-xs font-semibold text-zinc-400 tracking-widest uppercase mb-3">{plan}</p>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-4xl font-bold text-white tracking-tight">{price}</span>
          {price !== "Free" && price !== "Custom" && (
            <span className="text-sm text-zinc-500">/mo</span>
          )}
        </div>
        <p className="text-[13px] text-zinc-500 leading-relaxed">{description}</p>
      </div>
      <div className="flex-1 space-y-3">
        {features.map((f) => (
          <div key={f} className="flex items-start gap-2.5">
            <div className={cn(
              "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
              highlighted ? "bg-violet-500/20 text-violet-400" : "bg-white/[0.06] text-zinc-400"
            )}>
              <Check className="w-2.5 h-2.5" />
            </div>
            <span className="text-[13px] text-zinc-400 leading-snug">{f}</span>
          </div>
        ))}
      </div>
      <button className={cn(
        "w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200",
        highlighted
          ? "bg-white text-black hover:bg-zinc-100"
          : "border border-white/10 text-zinc-300 hover:border-white/20 hover:text-white bg-white/[0.03]"
      )}>
        {cta}
      </button>
    </motion.div>
  );
};

// ─── Marquee row ──────────────────────────────────────────────────────────────

const logos = [
  "Stripe", "Vercel", "Linear", "Notion", "Loom", "Figma",
  "Resend", "Supabase", "Raycast", "Arc Browser", "Framer", "Anthropic"
];

const MarqueeRow = ({ reverse = false }: { reverse?: boolean }) => (
  <div className={cn("flex gap-8 items-center", reverse ? "animate-marquee-reverse" : "animate-marquee")}
    style={{ width: "max-content" }}>
    {[...logos, ...logos].map((logo, i) => (
      <div
        key={`${logo}-${i}`}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] whitespace-nowrap"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
        <span className="text-[12px] font-medium text-zinc-500 tracking-wide">{logo}</span>
      </div>
    ))}
  </div>
);

// ─── URL Input (hero form) ────────────────────────────────────────────────────

const HeroInput = () => {
  const [url, setUrl] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    // Preserves existing analyze functionality hook-point
    window.dispatchEvent(new CustomEvent("honestly:analyze", { detail: { url } }));
  };

  return (
    <form onSubmit={handleSubmit} className="relative group">
      <div className={cn(
        "relative flex items-center rounded-2xl border transition-all duration-300",
        focused
          ? "border-white/20 shadow-[0_0_0_4px_rgba(139,92,246,0.1)]"
          : "border-white/[0.09]"
      )}
        style={{
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <div className="pl-5 pr-3 flex-shrink-0">
          <Globe className="w-4 h-4 text-zinc-500" />
        </div>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="https://yourwebsite.com"
          className="flex-1 py-4 bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none font-mono"
        />
        <div className="p-2 pr-2 flex-shrink-0">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-100 transition-all duration-200 flex items-center gap-2 group/btn"
          >
            Analyze
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
          </button>
        </div>
      </div>
      <p className="text-center text-[11px] text-zinc-600 mt-3 tracking-wide">
        No signup required for your first report
      </p>
    </form>
  );
};

// ─── Mock Report Card ─────────────────────────────────────────────────────────

const mockIssues = [
  { severity: "critical", label: "Trust signals absent above the fold", icon: <Shield className="w-3.5 h-3.5" /> },
  { severity: "high", label: "Primary CTA competes with secondary actions", icon: <MousePointerClick className="w-3.5 h-3.5" /> },
  { severity: "high", label: "Typography hierarchy inconsistent at H2 level", icon: <Type className="w-3.5 h-3.5" /> },
  { severity: "medium", label: "Social proof not visible without scrolling", icon: <Eye className="w-3.5 h-3.5" /> },
  { severity: "medium", label: "Cognitive load elevated on pricing page", icon: <Brain className="w-3.5 h-3.5" /> },
];

const severityConfig: Record<string, { color: string; bg: string; label: string }> = {
  critical: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", label: "Critical" },
  high: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", label: "High" },
  medium: { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", label: "Medium" },
};

const MockReportCard = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="relative rounded-2xl border border-white/[0.08] bg-[#0d0d0d] overflow-hidden"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-3 py-1 rounded-md border border-white/[0.06] bg-white/[0.03] text-[11px] text-zinc-600 font-mono">
            honestly.report/r/stripe.com
          </div>
        </div>
      </div>

      {/* Report header */}
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] text-zinc-600 font-mono mb-1">stripe.com · analyzed just now</p>
            <h3 className="text-base font-semibold text-white tracking-tight">Interface Intelligence Report</h3>
          </div>
          <div className="flex gap-3">
            <ScoreRing score={74} label="Trust" color="#a78bfa" />
            <ScoreRing score={61} label="Clarity" color="#60a5fa" />
            <ScoreRing score={88} label="Premium" color="#34d399" />
          </div>
        </div>
      </div>

      {/* Issues */}
      <div className="px-6 py-4 space-y-2">
        <p className="text-[10px] font-semibold text-zinc-600 tracking-widest uppercase mb-3">Detected Issues</p>
        {mockIssues.map((issue, i) => {
          const cfg = severityConfig[issue.severity];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.07 }}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg border text-[12px]",
                cfg.bg
              )}
            >
              <span className={cfg.color}>{issue.icon}</span>
              <span className="flex-1 text-zinc-300">{issue.label}</span>
              <span className={cn("text-[10px] font-semibold tracking-wide uppercase", cfg.color)}>
                {cfg.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom bar */}
      <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-between">
        <span className="text-[11px] text-zinc-600">5 issues found · Gemini Vision Analysis</span>
        <button className="flex items-center gap-1.5 text-[11px] text-violet-400 font-medium hover:text-violet-300 transition-colors">
          View full report <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
};

// ─── Before/After comparison ──────────────────────────────────────────────────

const BeforeAfterCard = ({
  type,
  title,
  items,
  delay = 0,
}: {
  type: "before" | "after";
  title: string;
  items: string[];
  delay?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const isBefore = type === "before";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={cn(
        "rounded-2xl border p-6 space-y-4",
        isBefore
          ? "border-red-500/20 bg-red-500/[0.04]"
          : "border-emerald-500/20 bg-emerald-500/[0.04]"
      )}
    >
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-5 h-5 rounded-full flex items-center justify-center",
          isBefore ? "bg-red-500/20" : "bg-emerald-500/20"
        )}>
          {isBefore
            ? <X className="w-3 h-3 text-red-400" />
            : <Check className="w-3 h-3 text-emerald-400" />}
        </div>
        <span className={cn(
          "text-xs font-semibold tracking-widest uppercase",
          isBefore ? "text-red-400" : "text-emerald-400"
        )}>
          {title}
        </span>
      </div>
      <div className="space-y-2.5">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: isBefore ? -6 : 6 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: delay + 0.1 + i * 0.07 }}
            className="flex items-start gap-2.5"
          >
            <div className={cn(
              "w-1 h-1 rounded-full flex-shrink-0 mt-2",
              isBefore ? "bg-red-500/50" : "bg-emerald-500/50"
            )} />
            <span className="text-[13px] text-zinc-400 leading-relaxed">{item}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ─── Stat counter ─────────────────────────────────────────────────────────────

const StatCounter = ({
  value,
  suffix,
  label,
  delay = 0,
}: {
  value: number;
  suffix: string;
  label: string;
  delay?: number;
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 1600;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * value));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className="text-center space-y-1"
    >
      <div className="text-4xl font-bold text-white tracking-tight tabular-nums">
        {count}{suffix}
      </div>
      <div className="text-[12px] text-zinc-500 font-medium tracking-wide">{label}</div>
    </motion.div>
  );
};

// ─── Intelligence step ────────────────────────────────────────────────────────

const IntelligenceStep = ({
  step,
  icon,
  title,
  description,
  delay = 0,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="flex gap-5"
    >
      <div className="flex flex-col items-center gap-2 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center text-zinc-300">
          {icon}
        </div>
        <div className="w-px flex-1 bg-gradient-to-b from-white/[0.08] to-transparent min-h-[32px]" />
      </div>
      <div className="pb-8">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-bold text-zinc-600 tracking-widest uppercase">{step}</span>
        </div>
        <h3 className="text-sm font-semibold text-white mb-1.5 tracking-tight">{title}</h3>
        <p className="text-[13px] text-zinc-500 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────

export function HomePage() {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);
  const heroY = useTransform(scrollY, [0, 400], [0, -40]);

  return (
    <div className="min-h-screen bg-[#080808] text-white font-['Inter',sans-serif] overflow-x-hidden">
      <NoiseOverlay />

      {/* ── Navbar ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#080808]/80 backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
              <span className="text-[10px] font-black text-black tracking-tighter">H?</span>
            </div>
            <span className="font-bold text-[13px] tracking-tight text-white">
              HONESTLY<span className="text-zinc-600">?</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {["Features", "How it Works", "Pricing"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                className="px-3.5 py-1.5 rounded-lg text-[13px] text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-all duration-200 font-medium"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a href="/login" className="px-3.5 py-1.5 rounded-lg text-[13px] text-zinc-500 hover:text-white transition-colors font-medium">
              Sign in
            </a>
            <a href="/signup" className="px-4 py-1.5 rounded-lg text-[13px] font-semibold bg-white text-black hover:bg-zinc-100 transition-all duration-200">
              Get started
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Ambient glows */}
        <GlowOrb className="w-[900px] h-[600px] -top-60 left-1/2 -translate-x-1/2" color="violet" />
        <GlowOrb className="w-[600px] h-[400px] top-40 -left-32" color="blue" />
        <GlowOrb className="w-[600px] h-[400px] top-40 -right-32" color="cyan" />

        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)"
          }}
        />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative max-w-4xl mx-auto px-6 pt-28 pb-20 text-center"
        >
          {/* Status pill */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/[0.09] bg-white/[0.04] text-[12px] text-zinc-400 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Powered by Gemini Vision · Live Analysis
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-[52px] sm:text-[72px] font-bold tracking-[-0.04em] leading-[1.0] mb-6"
          >
            <span className="text-white">Your website</span>
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #c4b5fd 0%, #818cf8 40%, #60a5fa 100%)" }}
            >
              isn&apos;t honest
            </span>
            <br />
            <span className="text-zinc-500">with you.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-[17px] text-zinc-500 max-w-2xl mx-auto leading-relaxed mb-10 font-light"
          >
            Paste any URL. HONESTLY? captures a screenshot, deploys Gemini Vision intelligence,
            and returns a structured analysis of{" "}
            <span className="text-zinc-300 font-medium">trust signals</span>,{" "}
            <span className="text-zinc-300 font-medium">visual hierarchy</span>, and{" "}
            <span className="text-zinc-300 font-medium">conversion confidence</span>.
          </motion.p>

          {/* Input */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="max-w-xl mx-auto mb-10"
          >
            <HeroInput />
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {[
              { icon: <Shield className="w-3.5 h-3.5" />, label: "Trust Architecture" },
              { icon: <Type className="w-3.5 h-3.5" />, label: "Typography" },
              { icon: <Eye className="w-3.5 h-3.5" />, label: "Visual Hierarchy" },
              { icon: <Gem className="w-3.5 h-3.5" />, label: "Premium Perception" },
              { icon: <MousePointerClick className="w-3.5 h-3.5" />, label: "CTA Clarity" },
              { icon: <Zap className="w-3.5 h-3.5" />, label: "Cognitive Friction" },
              { icon: <TrendingUp className="w-3.5 h-3.5" />, label: "Conversion Signal" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.38 + i * 0.04 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.07] bg-white/[0.02] text-[11px] text-zinc-500 font-medium"
              >
                <span className="text-zinc-600">{item.icon}</span>
                {item.label}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* ── Social Proof Marquee ──────────────────────────────────────── */}
      <Section className="py-14 border-t border-white/[0.05] overflow-hidden">
        <div className="text-center mb-8">
          <p className="text-[11px] font-semibold text-zinc-600 tracking-widest uppercase">
            Trusted by teams shipping at
          </p>
        </div>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
            style={{ background: "linear-gradient(90deg, #080808, transparent)" }} />
          <div className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
            style={{ background: "linear-gradient(-90deg, #080808, transparent)" }} />
          <div className="overflow-hidden">
            <div className="flex gap-4" style={{ animation: "marquee 32s linear infinite" }}>
              <MarqueeRow />
            </div>
          </div>
        </div>
      </Section>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <Section className="py-20 border-t border-white/[0.05]" id="features">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCounter value={12400} suffix="+" label="Reports Generated" delay={0} />
            <StatCounter value={94} suffix="%" label="Issues Detected" delay={0.1} />
            <StatCounter value={3.2} suffix="s" label="Avg. Analysis Time" delay={0.2} />
            <StatCounter value={7} suffix="" label="Scoring Dimensions" delay={0.3} />
          </div>
        </div>
      </Section>

      {/* ── Feature Architecture ──────────────────────────────────────── */}
      <Section className="py-24 border-t border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Chip>
              <Layers className="w-3 h-3" />
              Feature Architecture
            </Chip>
            <h2 className="mt-5 text-[36px] sm:text-[44px] font-bold tracking-[-0.03em] text-white leading-tight">
              Seven dimensions.
              <br />
              <span className="text-zinc-500">One verdict.</span>
            </h2>
            <p className="mt-4 text-[15px] text-zinc-500 leading-relaxed">
              Every analysis decomposes your interface into its core perceptual signals — the ones that determine whether a visitor trusts, converts, or leaves.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: <Shield className="w-4 h-4" />,
                title: "Trust Architecture",
                description: "Social proof placement, credential display, security signals, and brand legitimacy assessment.",
              },
              {
                icon: <Type className="w-4 h-4" />,
                title: "Typography Quality",
                description: "Font pairing, hierarchy consistency, weight distribution, and readability scoring.",
              },
              {
                icon: <Eye className="w-4 h-4" />,
                title: "Visual Hierarchy",
                description: "Attention flow analysis, focal point clarity, and information density mapping.",
              },
              {
                icon: <Gem className="w-4 h-4" />,
                title: "Premium Perception",
                description: "Whitespace usage, polish signals, color sophistication, and luxury brand alignment.",
              },
              {
                icon: <MousePointerClick className="w-4 h-4" />,
                title: "CTA Clarity",
                description: "Call-to-action prominence, friction points, button copy analysis, and conversion path mapping.",
              },
              {
                icon: <Zap className="w-4 h-4" />,
                title: "Cognitive Friction",
                description: "Cognitive load measurement, decision paralysis detection, and UX complexity scoring.",
              },
              {
                icon: <TrendingUp className="w-4 h-4" />,
                title: "Conversion Confidence",
                description: "An aggregated signal score predicting the likelihood of visitor action and revenue impact.",
              },
            ].map((feat, i) => (
              <FeatureCard key={feat.title} {...feat} delay={i * 0.06} />
            ))}
          </div>
        </div>
      </Section>

      {/* ── Interactive Report Showcase ───────────────────────────────── */}
      <Section className="py-24 border-t border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Chip>
                <BarChart3 className="w-3 h-3" />
                Report Preview
              </Chip>
              <h2 className="mt-5 text-[36px] sm:text-[42px] font-bold tracking-[-0.03em] text-white leading-tight mb-5">
                Intelligence at
                <br />
                <span className="text-zinc-500">first glance.</span>
              </h2>
              <p className="text-[15px] text-zinc-500 leading-relaxed mb-8">
                Every report surfaces the critical issues your team has been ignoring. Scored, ranked by severity, and mapped to conversion impact — not buried in paragraphs of generic advice.
              </p>
              <div className="space-y-3">
                {[
                  "Severity-ranked issue detection",
                  "7 scored dimensions per report",
                  "Actionable per-issue recommendations",
                  "Shareable permalink for every report",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 text-violet-400" />
                    </div>
                    <span className="text-[13px] text-zinc-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <MockReportCard />
          </div>
        </div>
      </Section>

      {/* ── AI Intelligence Explanation ───────────────────────────────── */}
      <Section className="py-24 border-t border-white/[0.05]" id="how-it-works">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="lg:sticky lg:top-24">
              <Chip>
                <Brain className="w-3 h-3" />
                How it Works
              </Chip>
              <h2 className="mt-5 text-[36px] sm:text-[42px] font-bold tracking-[-0.03em] text-white leading-tight mb-5">
                Vision AI meets
                <br />
                <span className="text-zinc-500">design theory.</span>
              </h2>
              <p className="text-[15px] text-zinc-500 leading-relaxed mb-6">
                HONESTLY? doesn't crawl your HTML. It sees your site the way your users do — as a visual composition — then applies structured UX intelligence on top.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-[12px] text-zinc-400">
                <Cpu className="w-3.5 h-3.5 text-violet-400" />
                Gemini Vision 1.5 Pro · Real-time Analysis
              </div>
            </div>

            <div className="pt-2">
              {[
                {
                  step: "Step 01",
                  icon: <Globe className="w-4.5 h-4.5" />,
                  title: "URL Capture & Rendering",
                  description: "We spin up a headless browser, navigate to your URL, and capture a full-resolution screenshot of your page as it actually renders in real browsers — not your source code.",
                },
                {
                  step: "Step 02",
                  icon: <FlaskConical className="w-4.5 h-4.5" />,
                  title: "Gemini Vision Analysis",
                  description: "Your screenshot is sent to Gemini Vision 1.5 Pro with a precision-crafted UX analysis prompt. The model evaluates the image across trust, hierarchy, typography, and conversion dimensions.",
                },
                {
                  step: "Step 03",
                  icon: <Activity className="w-4.5 h-4.5" />,
                  title: "Structured Intelligence Extraction",
                  description: "Raw AI output is parsed into a strict schema — scored dimensions, severity-ranked issues, and actionable recommendations — with no hallucinated filler.",
                },
                {
                  step: "Step 04",
                  icon: <Target className="w-4.5 h-4.5" />,
                  title: "Report Generation",
                  description: "Your report is assembled, assigned a permalink, and stored in your history. Share it with your team or revisit it after implementing changes.",
                },
              ].map((step, i) => (
                <IntelligenceStep key={step.step} {...step} delay={i * 0.08} />
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Before / After ────────────────────────────────────────────── */}
      <Section className="py-24 border-t border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Chip>
              <Telescope className="w-3 h-3" />
              Before & After
            </Chip>
            <h2 className="mt-5 text-[36px] sm:text-[44px] font-bold tracking-[-0.03em] text-white leading-tight">
              What your team
              <br />
              <span className="text-zinc-500">was missing.</span>
            </h2>
            <p className="mt-4 text-[15px] text-zinc-500 leading-relaxed">
              Most landing pages look fine. The issues that kill conversions are invisible to the team that built them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <BeforeAfterCard
              type="before"
              title="Without HONESTLY?"
              items={[
                "Trust signals buried below the fold",
                "Primary CTA competing with navigation",
                "Inconsistent typography undermines credibility",
                "Social proof not visible on mobile",
                "Pricing page creates decision paralysis",
                "No clear visual hierarchy for the eye to follow",
              ]}
              delay={0}
            />
            <BeforeAfterCard
              type="after"
              title="After HONESTLY?"
              items={[
                "Trust signals surfaced above the fold",
                "Single dominant conversion action per section",
                "Typography scaled to a strict hierarchy",
                "Social proof pinned at optimal scroll depth",
                "Pricing restructured to reduce cognitive load",
                "Clear visual flow guides users to action",
              ]}
              delay={0.1}
            />
          </div>
        </div>
      </Section>

      {/* ── Pricing ───────────────────────────────────────────────────── */}
      <Section className="py-24 border-t border-white/[0.05]" id="pricing">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Chip>
              <Star className="w-3 h-3" />
              Pricing
            </Chip>
            <h2 className="mt-5 text-[36px] sm:text-[44px] font-bold tracking-[-0.03em] text-white leading-tight">
              Pay for insight,
              <br />
              <span className="text-zinc-500">not seat licenses.</span>
            </h2>
            <p className="mt-4 text-[15px] text-zinc-500 leading-relaxed">
              Every tier gets the full analysis engine. No watered-down free plan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            <PricingCard
              plan="Starter"
              price="Free"
              description="For founders validating their landing page before launch."
              features={[
                "3 reports per month",
                "All 7 scoring dimensions",
                "Issue detection & ranking",
                "Shareable report link",
              ]}
              cta="Start free"
              delay={0}
            />
            <PricingCard
              plan="Pro"
              price="$29"
              description="For teams iterating fast and measuring conversion lift."
              features={[
                "Unlimited reports",
                "Full history & versioning",
                "Team sharing & comments",
                "Priority analysis queue",
                "Export to PDF / Notion",
              ]}
              cta="Get Pro"
              highlighted
              delay={0.08}
            />
            <PricingCard
              plan="Agency"
              price="Custom"
              description="For agencies running conversion audits at scale."
              features={[
                "White-label reports",
                "Client workspace management",
                "API access",
                "Custom scoring weights",
                "Dedicated support",
              ]}
              cta="Talk to us"
              delay={0.16}
            />
          </div>
        </div>
      </Section>

      {/* ── Final CTA ─────────────────────────────────────────────────── */}
      <Section className="py-32 border-t border-white/[0.05]">
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <GlowOrb className="w-[800px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" color="violet" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-[11px] text-zinc-400 font-medium tracking-widest uppercase mb-8">
              <Sparkles className="w-3 h-3" />
              Your first report is free
            </div>
            <h2 className="text-[44px] sm:text-[64px] font-bold tracking-[-0.04em] leading-[1.0] mb-6">
              <span className="text-white">Stop guessing.</span>
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, #c4b5fd 0%, #818cf8 40%, #60a5fa 100%)" }}
              >
                Start knowing.
              </span>
            </h2>
            <p className="text-[17px] text-zinc-500 max-w-xl mx-auto leading-relaxed mb-10 font-light">
              The gap between a site that looks good and a site that converts is exactly what HONESTLY? measures.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/signup"
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-white text-black text-[14px] font-semibold hover:bg-zinc-100 transition-all duration-200 group"
              >
                Analyze your site
                <MoveRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="#features"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/10 text-[14px] font-medium text-zinc-400 hover:text-white hover:border-white/20 transition-all duration-200"
              >
                See how it works
              </a>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.05] py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center">
              <span className="text-[9px] font-black text-black">H?</span>
            </div>
            <span className="text-[13px] font-bold text-zinc-500 tracking-tight">
              HONESTLY<span className="text-zinc-700">?</span>
            </span>
          </div>
          <p className="text-[12px] text-zinc-700">
            © {new Date().getFullYear()} HONESTLY? · AI Interface Intelligence
          </p>
          <div className="flex items-center gap-4">
            {["Privacy", "Terms", "Contact"].map((link) => (
              <a key={link} href="#" className="text-[12px] text-zinc-700 hover:text-zinc-400 transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 32s linear infinite;
        }
      `}</style>
    </div>
  );
}
