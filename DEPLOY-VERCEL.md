# Deploy RDX Downloaders on Vercel

The app is a TanStack Start (SSR) app. Nitro auto-detects Vercel during the
build and emits the Build Output API v3 folder (`.vercel/output`), so Vercel
serves both the static assets and the server functions.

## Steps

1. Push this repo to GitHub / GitLab / Bitbucket.
2. Vercel dashboard -> **Add New... -> Project** -> import the repo.
3. Framework preset: **Other** (leave as detected, `vercel.json` handles it).
4. Build settings (already set by `vercel.json`, do not change):
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Output Directory: leave **empty** (Nitro writes `.vercel/output`)
5. Node.js version: **22.x** (Project Settings -> General).
6. Click **Deploy**.

## Environment variables

None required — all downloader APIs are free and called server-side.

## Local production check

```bash
npm install
npm run build
```

## Notes

- Do not set `NITRO_PRESET` manually; Vercel is detected automatically.
- Downloads run through server functions, so they work on Vercel's Node runtime
  without any extra proxy.
