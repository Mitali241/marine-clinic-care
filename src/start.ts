import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { getSession, handleAuthRequest } from "./lib/clinic-auth.server";

const errorMiddleware = createMiddleware().server(async ({ next, request }) => {
  try {
    return await next();
  } catch (error) {
    // If this is a server function RPC request, rethrow so TanStack Start
    // returns a proper JSON/Seroval RPC error instead of an HTML page.
    const url = new URL(request.url);
    const isRpcRequest =
      url.pathname.includes("/_server") ||
      request.headers.get("accept")?.includes("application/json") ||
      request.headers.has("x-tanstack-start-rpc");

    if (isRpcRequest) {
      throw error;
    }

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

const authMiddleware = createMiddleware({ type: "request" }).server(
  async ({ request, pathname, handlerType, next }) => {
    const authResponse = await handleAuthRequest(request, pathname);
    if (authResponse) return authResponse;

    // Direct public submission endpoint for candidate feedback portal
    if (pathname === "/api/feedback/submit" && request.method === "POST") {
      try {
        const body = (await request.json()) as any;
        const { submitFeedbackServer } = await import("./lib/clinic.server");
        const res = await submitFeedbackServer({ data: body });
        return Response.json(res, { status: res.success ? 200 : 400 });
      } catch (err) {
        console.error("Direct feedback endpoint error:", err);
        return Response.json({ success: false, message: "Submission failed." }, { status: 500 });
      }
    }

    const authUser = await getSession(request);

    // Public server functions: called from pages that don't require a login.
    // submitFeedbackServer is used by the public candidate grievance portal (/feedback).
    const PUBLIC_SERVER_FN_PATTERNS = ["submitFeedbackServer", "submitFeedback"];

    let decodedServerFn = "";
    if (pathname.includes("/_serverFn/")) {
      const rawSegment = pathname.split("/_serverFn/")[1]?.split("/")[0]?.split("?")[0] || "";
      try {
        decodedServerFn = Buffer.from(rawSegment, "base64url").toString("utf8");
      } catch {
        decodedServerFn = "";
      }
    }

    const isPublicServerFn =
      handlerType === "serverFn" &&
      PUBLIC_SERVER_FN_PATTERNS.some(
        (name) => pathname.includes(name) || decodedServerFn.includes(name),
      );

    if (handlerType === "serverFn" && !authUser && !isPublicServerFn) {
      return new Response(JSON.stringify({ message: "Authentication required." }), {
        status: 401,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }

    return next({ context: { authUser } });
  },
);

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => {
    if (ctx.handlerType !== "serverFn") return false;
    let decoded = "";
    if (ctx.pathname.includes("/_serverFn/")) {
      const rawSegment = ctx.pathname.split("/_serverFn/")[1]?.split("/")[0]?.split("?")[0] || "";
      try {
        decoded = Buffer.from(rawSegment, "base64url").toString("utf8");
      } catch {}
    }
    if (ctx.pathname.includes("submitFeedback") || decoded.includes("submitFeedback")) {
      return false;
    }
    return true;
  },
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware, authMiddleware, csrfMiddleware],
}));
