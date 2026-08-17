import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  startTask,
  readTask,
  searchYoutube,
  fetchTiktok,
  fetchInstagram,
  fetchFacebook,
} from "./rdx.server";

export const startYoutube = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        url: z.string().url(),
        format: z.enum(["mp3", "mp4"]),
        quality: z.string().default("720"),
      })
      .parse(d),
  )
  .handler(async ({ data }) =>
    data.format === "mp3"
      ? startTask("ytmp3", { url: data.url })
      : startTask("ytmp4", { url: data.url, quality: data.quality }),
  );

export const startMusicSearch = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ query: z.string().min(2) }).parse(d))
  .handler(async ({ data }) => searchYoutube(data.query));

export const getTask = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().min(4) }).parse(d))
  .handler(async ({ data }) => readTask(data.id));

export const getSocialMedia = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        platform: z.enum(["tiktok", "instagram", "facebook"]),
        url: z.string().url(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    if (data.platform === "tiktok") return fetchTiktok(data.url);
    if (data.platform === "instagram") return fetchInstagram(data.url);
    return fetchFacebook(data.url);
  });