import * as ReactStart from "@tanstack/react-start";
import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
// Some bundled builds (e.g. Vercel's Node SSR output) may not expose this helper.
// Guard it so a missing export can never crash the whole server entry.
const createCsrf = (
  ReactStart as unknown as {
    createCsrfMiddleware?: (opts: unknown) => unknown;
  }
).createCsrfMiddleware;

const csrfMiddleware =
  typeof createCsrf === "function"
    ? createCsrf({ filter: (ctx: { handlerType: string }) => ctx.handlerType === "serverFn" })
    : undefined;

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware, ...(csrfMiddleware ? [csrfMiddleware] : [])] as never,
}));
