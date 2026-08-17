const BASE = "https://anabot.my.id/api/download";
const APIKEY = "freeApikey";

export type TaskStart = { taskId: string };

async function post(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${BASE}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, apikey: APIKEY }),
  });
  const text = await res.text();
  if (!text) throw new Error("Service ne khali jawab diya. Thodi der baad koshish karein.");
  try {
    return JSON.parse(text) as any;
  } catch {
    throw new Error("Service abhi unavailable hai. Baad me try karein.");
  }
}

export async function startTask(
  kind: "ytmp4" | "ytmp3" | "playmusic",
  payload: Record<string, unknown>,
): Promise<TaskStart> {
  const json = await post(kind, payload);
  const taskId = json?.data?.taskId;
  if (!taskId) throw new Error(json?.error?.message ?? "Request accept nahi hui.");
  return { taskId };
}

export type TaskState = {
  status: "processing" | "completed" | "failed";
  title?: string;
  thumbnail?: string;
  duration?: number;
  channel?: string;
  mediaUrl?: string;
  mediaType?: "audio" | "video";
  error?: string;
};

export async function readTask(id: string): Promise<TaskState> {
  const res = await fetch(
    `${BASE}/status?id=${encodeURIComponent(id)}&apikey=${APIKEY}`,
  );
  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    return { status: "processing" };
  }
  if (json?.status === "failed" || json?.success === false) {
    return { status: "failed", error: json?.error?.message ?? json?.error ?? "Task fail ho gaya." };
  }
  if (json?.status !== "completed") return { status: "processing" };
  const d = json.data ?? {};
  const m = d.metadata ?? {};
  const url = typeof d.urls === "string" ? d.urls : (d.urls?.[0] ?? "");
  return {
    status: "completed",
    title: m.title,
    thumbnail: m.thumbnail,
    duration: m.duration,
    channel: m.channel ?? m.uploader,
    mediaUrl: url,
    mediaType: String(d.type).toUpperCase() === "AUDIO" ? "audio" : "video",
  };
}

export type MediaItem = {
  title: string;
  thumbnail?: string;
  type: "audio" | "video" | "image";
  url: string;
  label: string;
  size?: string;
};

export type SongHit = {
  videoId: string;
  title: string;
  channel: string;
  duration: string;
  thumbnail: string;
  url: string;
};

function sliceJson(src: string, start: number): string | null {
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < src.length; i++) {
    const c = src[i]!;
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  return null;
}

export async function searchYoutube(query: string): Promise<SongHit[]> {
  const res = await fetch(
    `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    },
  );
  const html = await res.text();
  const hits: SongHit[] = [];
  const seen = new Set<string>();
  const marker = '"videoRenderer":';
  let idx = html.indexOf(marker);
  while (idx !== -1 && hits.length < 18) {
    const raw = sliceJson(html, idx + marker.length);
    idx = html.indexOf(marker, idx + marker.length);
    if (!raw) continue;
    let v: any;
    try {
      v = JSON.parse(raw);
    } catch {
      continue;
    }
    const id = v?.videoId;
    if (!id || seen.has(id)) continue;
    const title = v?.title?.runs?.[0]?.text ?? v?.title?.simpleText;
    if (!title) continue;
    seen.add(id);
    hits.push({
      videoId: id,
      title,
      channel: v?.ownerText?.runs?.[0]?.text ?? v?.longBylineText?.runs?.[0]?.text ?? "YouTube",
      duration: v?.lengthText?.simpleText ?? "",
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      url: `https://www.youtube.com/watch?v=${id}`,
    });
  }
  if (!hits.length) throw new Error("Koi song nahi mila. Naam thoda change kar ke try karein.");
  return hits;
}

type _Unused = {
  title: string;
  thumbnail?: string;
  type: "audio" | "video" | "image";
  url: string;
  label: string;
  size?: string;
};

export async function fetchTiktok(url: string): Promise<MediaItem[]> {
  const json = await post("tiktok", { url });
  const r = json?.data?.result;
  if (!r) throw new Error(json?.error?.message ?? "TikTok link process nahi hua.");
  const title = r.description || r.username || "TikTok media";
  const items: MediaItem[] = [];
  if (r.nowatermark)
    items.push({ title, thumbnail: r.thumbnail, type: "video", url: r.nowatermark, label: "Video (No Watermark)" });
  if (r.video)
    items.push({ title, thumbnail: r.thumbnail, type: "video", url: r.video, label: "Video (HD)" });
  if (r.audio)
    items.push({ title, thumbnail: r.thumbnail, type: "audio", url: r.audio, label: "Audio MP3" });
  for (const img of r.image ?? [])
    items.push({ title, thumbnail: img, type: "image", url: img, label: "Image" });
  if (!items.length) throw new Error("Is link par koi media nahi mila.");
  return items;
}

export async function fetchInstagram(url: string): Promise<MediaItem[]> {
  const json = await post("instagram", { url });
  const arr = json?.data?.result;
  if (!Array.isArray(arr) || !arr.length)
    throw new Error(json?.error?.message ?? "Instagram media nahi mila.");
  return arr.map((it: any, i: number) => ({
    title: `Instagram media #${i + 1}`,
    thumbnail: it.thumbnail,
    type: "video",
    url: it.url,
    label: `Media #${i + 1}`,
  }));
}

export async function fetchFacebook(url: string): Promise<MediaItem[]> {
  const json = await post("facebook", { url });
  const r = json?.data?.result;
  const media = r?.mediaItems;
  if (!Array.isArray(media) || !media.length)
    throw new Error(json?.error?.message ?? "Facebook media nahi mila.");
  return media
    .filter((m: any) => m?.downloadInfo?.fileUrl || m?.mediaPreviewUrl)
    .map((m: any) => ({
      title: r.description || r.title || "Facebook media",
      thumbnail: m.mediaThumbnail,
      type: String(m.type).toLowerCase() === "audio" ? "audio" : "video",
      url: m.downloadInfo?.fileUrl || m.mediaPreviewUrl,
      label: `${m.mediaQuality ?? ""} ${m.mediaExtension ?? ""}`.trim() || m.name,
      size: m.downloadInfo?.fileSize ?? m.mediaFileSize,
    }));
}