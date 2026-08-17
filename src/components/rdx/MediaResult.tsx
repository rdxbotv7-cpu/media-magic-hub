import { Download, Music4, Video, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ResultMedia = {
  title: string;
  thumbnail?: string;
  type: "audio" | "video" | "image";
  url: string;
  label: string;
  size?: string;
  channel?: string;
};

function Bars() {
  return (
    <div className="flex h-6 items-end gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="w-1.5 origin-bottom rounded-full bg-primary"
          style={{ height: "100%", animation: `rdx-bars 1s ${i * 0.12}s ease-in-out infinite` }}
        />
      ))}
    </div>
  );
}

export function MediaResult({ media }: { media: ResultMedia }) {
  const Icon = media.type === "audio" ? Music4 : media.type === "image" ? ImageIcon : Video;

  return (
    <article className="rdx-glass rdx-rise overflow-hidden rounded-2xl p-4 transition-transform duration-300 hover:-translate-y-1">
      <div className="flex items-center gap-3 pb-3">
        <span className="rdx-pulse-ring grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold">{media.title}</h3>
          <p className="truncate text-xs text-muted-foreground">
            {[media.channel, media.label, media.size].filter(Boolean).join(" • ")}
          </p>
        </div>
        {media.type === "audio" && <Bars />}
      </div>

      {media.type === "video" && (
        <video
          src={media.url}
          poster={media.thumbnail}
          controls
          playsInline
          preload="metadata"
          className="aspect-video w-full rounded-xl bg-black object-contain"
        />
      )}
      {media.type === "audio" && (
        <div className="rounded-xl bg-background/50 p-3">
          {media.thumbnail && (
            <img
              src={media.thumbnail}
              alt={media.title}
              loading="lazy"
              className="mb-3 aspect-video w-full rounded-lg object-cover"
            />
          )}
          <audio src={media.url} controls preload="metadata" className="w-full" />
        </div>
      )}
      {media.type === "image" && (
        <img
          src={media.url}
          alt={media.title}
          loading="lazy"
          className="w-full rounded-xl object-cover"
        />
      )}

      <Button asChild variant="hero" size="lg" className="mt-4 w-full">
        <a href={media.url} target="_blank" rel="noreferrer" download>
          <Download className="mr-2 h-4 w-4" /> Download {media.label}
        </a>
      </Button>
    </article>
  );
}