import { Sparkles, Zap, ShieldCheck } from "lucide-react";

export function Hero() {
  return (
    <header className="relative mx-auto max-w-4xl px-4 pt-12 pb-8 text-center sm:pt-16">
      <div className="rdx-rise mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.25em] text-primary uppercase">
        <Sparkles className="h-3.5 w-3.5" />
        Fast • Free • No login
      </div>

      <h1 className="rdx-rise font-display text-4xl leading-tight font-black sm:text-6xl">
        <span className="rdx-3d-text rdx-flame-text">All-in-One</span>{" "}
        <span className="rdx-3d-text text-foreground">Video Downloader</span>
      </h1>

      <p className="rdx-rise mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
        YouTube, TikTok, Instagram aur Facebook — link paste karein ya song ka naam search karein,
        preview dekhein aur HD me download karein.
      </p>

      <div className="rdx-rise mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground sm:text-sm">
        <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
          <Zap className="h-4 w-4 text-accent" /> Turbo servers
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
          <ShieldCheck className="h-4 w-4 text-accent" /> Watermark free
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
          <Sparkles className="h-4 w-4 text-accent" /> MP3 + MP4
        </span>
      </div>
    </header>
  );
}
