import { Sparkles, Zap, ShieldCheck } from "lucide-react";

const letters = "RDX".split("");

export function Hero() {
  return (
    <header className="relative mx-auto max-w-5xl px-4 pt-20 pb-10 text-center">
      <div className="rdx-rise mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-primary">
        <Sparkles className="h-3.5 w-3.5" />
        Fast • Free • No login
      </div>

      <h1 className="rdx-tilt font-display text-6xl leading-none font-black sm:text-8xl">
        <span className="inline-flex">
          {letters.map((l, i) => (
            <span
              key={l}
              className="rdx-3d-text rdx-flame-text inline-block"
              style={{ animationDelay: `${i * 0.18}s` }}
            >
              {l}
            </span>
          ))}
        </span>
        <span className="ml-4 inline-block rdx-3d-text text-foreground">DOWNLOADERS</span>
      </h1>

      <p className="rdx-rise mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
        YouTube, TikTok, Instagram aur Facebook ki video ya audio — pehle sunein/dekhein, phir
        ek click par HD download karein.
      </p>

      <div className="rdx-rise mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2">
          <Zap className="h-4 w-4 text-accent" /> Turbo servers
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2">
          <ShieldCheck className="h-4 w-4 text-accent" /> Watermark free
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2">
          <Sparkles className="h-4 w-4 text-accent" /> MP3 + MP4
        </span>
      </div>
    </header>
  );
}