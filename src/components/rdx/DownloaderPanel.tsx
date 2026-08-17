import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Search, Link2, Youtube, Music2, Instagram, Facebook } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { MediaResult, type ResultMedia } from "./MediaResult";
import {
  startYoutube,
  startMusicSearch,
  getTask,
  getSocialMedia,
} from "@/lib/rdx.functions";

const QUALITIES = ["360", "480", "720", "1080"];

type Mode = "youtube" | "search" | "tiktok" | "instagram" | "facebook";

export function DownloaderPanel() {
  const runYoutube = useServerFn(startYoutube);
  const runSearch = useServerFn(startMusicSearch);
  const runTask = useServerFn(getTask);
  const runSocial = useServerFn(getSocialMedia);

  const [mode, setMode] = useState<Mode>("youtube");
  const [url, setUrl] = useState("");
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState<"mp4" | "mp3">("mp4");
  const [quality, setQuality] = useState("720");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ResultMedia[]>([]);
  const cancelled = useRef(false);

  useEffect(() => () => void (cancelled.current = true), []);

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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResults([]);
    setProgress(8);
    setLoading(true);
    try {
      if (mode === "youtube" || mode === "search") {
        const task =
          mode === "youtube"
            ? await runYoutube({ data: { url: url.trim(), format, quality } })
            : await runSearch({ data: { query: query.trim() } });
        const state = await poll(task.taskId);
        if (!state?.mediaUrl) throw new Error("Media link nahi mila.");
        setResults([
          {
            title: state.title ?? "Media",
            thumbnail: state.thumbnail,
            channel: state.channel,
            type: state.mediaType ?? "video",
            url: state.mediaUrl,
            label: state.mediaType === "audio" ? "MP3" : `MP4 ${quality}p`,
          },
        ]);
      } else {
        const items = await runSocial({ data: { platform: mode, url: url.trim() } });
        setResults(items as ResultMedia[]);
      }
      setProgress(100);
      toast.success("Ready! Ab sun ya dekh kar download karein.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kuch ghalat ho gaya.");
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: Mode; label: string; icon: typeof Youtube }[] = [
    { id: "youtube", label: "YouTube", icon: Youtube },
    { id: "search", label: "Song Search", icon: Music2 },
    { id: "tiktok", label: "TikTok", icon: Music2 },
    { id: "instagram", label: "Instagram", icon: Instagram },
    { id: "facebook", label: "Facebook", icon: Facebook },
  ];

  return (
    <section id="downloader" className="mx-auto w-full max-w-4xl px-4">
      <div className="rdx-glass rdx-rise rounded-3xl p-5 sm:p-8">
        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
          <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 sm:grid-cols-5">
            {tabs.map(({ id, label, icon: Icon }) => (
              <TabsTrigger
                key={id}
                value={id}
                className="flex-col gap-1 rounded-xl border border-border bg-background/40 py-3 text-xs data-[state=active]:bg-[image:var(--gradient-flame)] data-[state=active]:text-primary-foreground data-[state=active]:shadow-[var(--shadow-neon)]"
              >
                <Icon className="h-4 w-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "search" ? (
              <div className="relative">
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Song ka naam likhein, e.g. Pasoori"
                  className="h-14 rounded-2xl border-border bg-background/50 pl-12 text-base"
                  required
                />
              </div>
            ) : (
              <div className="relative">
                <Link2 className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={`Yahan ${mode} ka link paste karein`}
                  className="h-14 rounded-2xl border-border bg-background/50 pl-12 text-base"
                  required
                />
              </div>
            )}

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

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing…
                </>
              ) : (
                "Get Media"
              )}
            </Button>

            {loading && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-center text-xs text-muted-foreground">
                  Server media tayyar kar raha hai — thoda intezaar karein.
                </p>
              </div>
            )}
          </form>
        </Tabs>
      </div>

      {results.length > 0 && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {results.map((m, i) => (
            <MediaResult key={`${m.url}-${i}`} media={m} />
          ))}
        </div>
      )}
    </section>
  );
}