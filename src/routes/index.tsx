import { createFileRoute } from "@tanstack/react-router";
import { Clapperboard, Gauge, Headphones, MonitorPlay } from "lucide-react";

import { Backdrop } from "@/components/rdx/Backdrop";
import { Navbar } from "@/components/rdx/Navbar";
import { Hero } from "@/components/rdx/Hero";
import { DownloaderPanel } from "@/components/rdx/DownloaderPanel";

const TITLE = "RDX Downloaders — YouTube, TikTok, Instagram & FB Video Downloader";
const DESC =
  "RDX Downloaders lets you preview and free download YouTube MP3/MP4, TikTok no-watermark, Instagram and Facebook videos in HD.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const FEATURES = [
  { icon: MonitorPlay, title: "Preview First", text: "Watch the video or listen to audio before downloading." },
  { icon: Headphones, title: "MP3 + MP4", text: "Grab any song as audio or as a full video file." },
  { icon: Gauge, title: "HD Quality", text: "Pick your quality, from 360p all the way to 1080p." },
  { icon: Clapperboard, title: "No Watermark", text: "TikTok clips come out perfectly clean, no watermark." },
];

const STEPS = [
  "Choose a platform and paste the link (or type a song name).",
  "Hit Download — the server renders your file.",
  "Preview it in the player and save it with the Download button.",
];

function Index() {
  return (
    <main className="relative min-h-screen pb-24">
      <Backdrop />
      <Navbar />
      <Hero />
      <DownloaderPanel />

      <section id="features" className="mx-auto mt-24 max-w-5xl px-4">
        <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">
          Why <span className="rdx-flame-text">RDX</span>?
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rdx-glass group rounded-2xl p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-[var(--shadow-neon)]"
            >
              <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="mx-auto mt-24 max-w-4xl px-4">
        <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">How it works</h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s} className="rdx-glass rounded-2xl p-6">
              <span className="rdx-flame-text font-display text-4xl font-black">0{i + 1}</span>
              <p className="mt-2 text-sm text-muted-foreground">{s}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="mt-24 text-center text-sm text-muted-foreground">
        <p className="font-display tracking-widest">RDX DOWNLOADERS</p>
        <p className="mt-2 px-4">
          For personal use only — downloading copyrighted content is your own responsibility.
        </p>
      </footer>
    </main>
  );
}
