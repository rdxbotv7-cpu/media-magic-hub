import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Loader2,
  Search,
  Link2,
  Youtube,
  Music2,
  Instagram,
  Facebook,
  ClipboardPaste,
  X,
  Download,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { MediaResult, type ResultMedia } from "./MediaResult";
import { startYoutube, startMusicSearch, getTask, getSocialMedia } from "@/lib/rdx.functions";

const QUALITIES = ["360", "480", "720", "1080"];

type Mode = "youtube" | "search" | "tiktok" | "instagram" | "facebook";

type SongHit = {
  videoId: string;
  title: string;
  channel: string;
  duration: string;
  thumbnail: string;
  url: string;
};

const TABS: { id: Mode; label: string; icon: typeof Youtube }[] = [
  { id: "youtube", label: "YouTube", icon: Youtube },
  { id: "search", label: "Song Search", icon: Music2 },
  { id: "tiktok", label: "TikTok", icon: Music2 },
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "facebook", label: "Facebook", icon: Facebook },
];

export function DownloaderPanel() {
  const runYoutube = useServerFn(startYoutube);
  const runSearch = useServerFn(startMusicSearch);
  const runTask = useServerFn(getTask);
  const runSocial = useServerFn(getSocialMedia);

  const [mode, setMode] = useState<Mode>("youtube");
  const [value, setValue] = useState("");
  const [format, setFormat] = useState<"mp4" | "mp3">("mp4");
  const [quality, setQuality] = useState("720");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [songs, setSongs] = useState<SongHit[]>([]);
  const [results, setResults] = useState<ResultMedia[]>([]);
  const cancelled = useRef(false);

  useEffect(() => () => void (cancelled.current = true), []);

  const reset = () => {
    setValue("");
    setSongs([]);
    setResults([]);
    setProgress(0);
  };

  const paste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) throw new Error("empty");
      setValue(text.trim());
    } catch {
      toast.error("Clipboard access nahi mila — manually paste karein.");
    }
  };

  const poll = async (taskId: string) => {
    for (let i = 0; i < 60; i++) {
      if (cancelled.current) return null;
      await new Promise((r) => setTimeout(r, 3000));
      setProgress((p) => Math.min(95, p + 4));
      const state = await runTask({ data: { id: taskId } });
      if (state.status === "completed") return state;
      if (state.status === "failed") throw new Error(state.error || "Task fail ho gaya.");
    }
    throw new Error("Server ne bohot der laga di. Dobara koshish karein.");
  };

  const downloadYoutube = async (url: string, fmt: "mp3" | "mp4") => {
    const task = await runYoutube({ data: { url, format: fmt, quality } });
    const state = await poll(task.taskId);
    if (!state?.mediaUrl) throw new Error("Media link nahi mila.");
    setResults([
      {
        title: state.title ?? "Media",
        thumbnail: state.thumbnail,
        channel: state.channel,
        type: state.mediaType ?? "video",
        url: state.mediaUrl,
        label: fmt === "mp3" ? "MP3" : `MP4 ${quality}p`,
      },
    ]);
  };

  const pickSong = async (hit: SongHit, fmt: "mp3" | "mp4") => {
    setBusyId(hit.videoId + fmt);
    setResults([]);
    setProgress(10);
    try {
      await downloadYoutube(hit.url, fmt);
      setProgress(100);
      toast.success("Ready! Preview karein aur download karein.");
      document.getElementById("rdx-results")?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kuch ghalat ho gaya.");
      setProgress(0);
    } finally {
      setBusyId(null);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResults([]);
    setSongs([]);
    setProgress(8);
    setLoading(true);
    try {
      if (mode === "search") {
        const hits = (await runSearch({ data: { query: value.trim() } })) as SongHit[];
        setSongs(hits);
      } else if (mode === "youtube") {
        await downloadYoutube(value.trim(), format);
      } else {
        const items = await runSocial({ data: { platform: mode, url: value.trim() } });
        setResults(items as ResultMedia[]);
      }
      setProgress(100);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kuch ghalat ho gaya.");
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const isSearch = mode === "search";

  return (
    <section id="downloader" className="mx-auto w-full max-w-5xl px-4">
      <div className="rdx-glass overflow-hidden rounded-2xl">
        {/* platform bar */}
        <div className="flex overflow-x-auto border-b border-border">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = mode === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setMode(id);
                  reset();
                }}
                className={`relative flex min-w-[6.5rem] flex-1 flex-col items-center gap-1.5 px-4 py-3.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
                {active && (
                  <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[image:var(--gradient-flame)]" />
                )}
              </button>
            );
          })}
        </div>

        <form onSubmit={submit} className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              {isSearch ? (
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              ) : (
                <Link2 className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              )}
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={
                  isSearch ? "Song ka naam likhein, e.g. Pasoori" : `${mode} ka link paste karein`
                }
                className="h-13 rounded-xl border-border bg-background/60 pr-24 pl-12 text-base"
                required
              />
              <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
                {value && (
                  <button
                    type="button"
                    aria-label="Clear"
                    onClick={reset}
                    className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={paste}
                  className="inline-flex h-8 items-center gap-1 rounded-lg bg-secondary px-2.5 text-xs font-semibold text-secondary-foreground hover:bg-secondary/70"
                >
                  <ClipboardPaste className="h-3.5 w-3.5" /> Paste
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="h-13 px-8"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Wait…
                </>
              ) : isSearch ? (
                "Search"
              ) : (
                "Download"
              )}
            </Button>
          </div>

          {mode === "youtube" && (
            <div className="flex flex-wrap items-center gap-2">
              {(["mp4", "mp3"] as const).map((f) => (
                <Button
                  key={f}
                  type="button"
                  variant={format === f ? "hero" : "neon"}
                  size="sm"
                  onClick={() => setFormat(f)}
                >
                  {f.toUpperCase()}
                </Button>
              ))}
              {format === "mp4" &&
                QUALITIES.map((q) => (
                  <Button
                    key={q}
                    type="button"
                    variant={quality === q ? "hero" : "neon"}
                    size="sm"
                    onClick={() => setQuality(q)}
                  >
                    {q}p
                  </Button>
                ))}
            </div>
          )}

          {(loading || busyId) && (
            <div className="space-y-2">
              <Progress value={progress} className="h-1.5" />
              <p className="text-center text-xs text-muted-foreground">
                Server file tayyar kar raha hai — thoda intezaar karein.
              </p>
            </div>
          )}
        </form>
      </div>

      {songs.length > 0 && (
        <div className="mt-6 space-y-2">
          <h2 className="px-1 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Search results
          </h2>
          {songs.map((s) => (
            <div
              key={s.videoId}
              className="rdx-glass flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:border-primary/50"
            >
              <div className="relative shrink-0">
                <img
                  src={s.thumbnail}
                  alt={s.title}
                  loading="lazy"
                  className="h-16 w-28 rounded-lg object-cover"
                />
                {s.duration && (
                  <span className="absolute right-1 bottom-1 rounded bg-background/80 px-1 text-[10px]">
                    {s.duration}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold">{s.title}</p>
                <p className="truncate text-xs text-muted-foreground">{s.channel}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
                {(["mp3", "mp4"] as const).map((f) => (
                  <Button
                    key={f}
                    size="sm"
                    variant={f === "mp3" ? "hero" : "neon"}
                    disabled={busyId !== null}
                    onClick={() => pickSong(s, f)}
                  >
                    {busyId === s.videoId + f ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {f.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div id="rdx-results" className="mt-8 grid gap-5 sm:grid-cols-2">
          {results.map((m, i) => (
            <MediaResult key={`${m.url}-${i}`} media={m} />
          ))}
        </div>
      )}
    </section>
  );
}
