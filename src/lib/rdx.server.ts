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