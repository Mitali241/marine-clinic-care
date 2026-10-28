import { createRemoteJWKSet, jwtVerify, SignJWT } from "jose";
import { getDatabase } from "./mongodb.server";

export type ClinicUser = {
  oid: string;
  email: string;
  name: string;
  role: "admin" | "staff";
};

const encoder = new TextEncoder();
const secureCookies = process.env.NODE_ENV === "production";

function config() {
  const tenantId = process.env.ENTRA_TENANT_ID;
  const clientId = process.env.ENTRA_CLIENT_ID;
  const clientSecret = process.env.ENTRA_CLIENT_SECRET;
  const redirectUri = process.env.ENTRA_REDIRECT_URI;
  if (!tenantId || !clientId || !clientSecret || !redirectUri) {
    throw new Error("Microsoft Entra authentication is not configured.");
  }
  return { tenantId, clientId, clientSecret, redirectUri };
}

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters.");
  }
  return encoder.encode(secret);
}

function cookieValue(request: Request, name: string) {
  const cookie = request.headers.get("cookie") ?? "";
  for (const item of cookie.split(";")) {
    const [key, ...valueParts] = item.trim().split("=");
    if (key === name) return decodeURIComponent(valueParts.join("="));
  }
  return undefined;
}

export async function createSessionCookie(user: ClinicUser): Promise<string> {
  const token = await new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.oid)
    .setAudience("marine-clinic-care")
    .setIssuer("marine-clinic-care")
    .setIssuedAt()
    .setExpirationTime("8h")
    .setPayload({
      oid: user.oid,
      email: user.email,
      name: user.name,
      role: user.role,
    })
    .sign(sessionSecret());

  return `clinic_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800${secureCookies ? "; Secure" : ""}`;
}

export async function getSession(request: Request): Promise<ClinicUser | null> {
  const token = cookieValue(request, "clinic_session");
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionSecret(), {
      issuer: "marine-clinic-care",
      audience: "marine-clinic-care",
    });
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") return null;
    return {
      oid: payload.sub,
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : payload.email,
      role: payload.role === "admin" ? "admin" : "staff",
    };
  } catch {
    return null;
  }
}

async function findOrCreateUser(email: string, oid: string, name: string): Promise<ClinicUser> {
  const db = await getDatabase();
  const users = db.collection("clinic_users");
  let user = await users.findOne<{ role?: "admin" | "staff"; active?: boolean }>({ oid });

  if (!user) {
    user = await users.findOne<{ role?: "admin" | "staff"; active?: boolean }>({ email: email.toLowerCase() });
  }

  if (!user || user.active === false) {
    throw new Error("This account is not authorized for the clinic workspace.");
  }

  await users.updateOne(
    { _id: user._id },
    { $set: { oid, email: email.toLowerCase(), name, lastLoginAt: new Date() }, $setOnInsert: { active: true } },
  );

  return { oid, email: email.toLowerCase(), name, role: user.role === "admin" ? "admin" : "staff" };
}

function randomValue() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), (value) => value.toString(16).padStart(2, "0")).join("");
}

export async function handleAuthRequest(request: Request, pathname: string): Promise<Response | null> {
  if (!pathname.startsWith("/api/auth/")) return null;

  try {
    const { tenantId, clientId, clientSecret, redirectUri } = config();
    const authority = `https://login.microsoftonline.com/${tenantId}`;

    if (pathname === "/api/auth/login") {
      const state = randomValue();
      const nonce = randomValue();
      const url = new URL(`${authority}/oauth2/v2.0/authorize`);
      url.searchParams.set("client_id", clientId);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("redirect_uri", redirectUri);
      url.searchParams.set("response_mode", "query");
      url.searchParams.set("scope", "openid profile email");
      url.searchParams.set("state", state);
      url.searchParams.set("nonce", nonce);
      url.searchParams.set("prompt", "select_account");
      const cookie = `auth_state=${encodeURIComponent(`${state}.${nonce}`)}; Path=/api/auth/callback; HttpOnly; SameSite=Lax; Max-Age=600${secureCookies ? "; Secure" : ""}`;
      return new Response(null, { status: 302, headers: { Location: url.toString(), "Set-Cookie": cookie } });
    }

    if (pathname === "/api/auth/logout") {
      return new Response(null, {
        status: 302,
        headers: { Location: "/", "Set-Cookie": "clinic_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0" },
      });
    }

    if (pathname === "/api/auth/me") {
      const user = await getSession(request);
      return Response.json(user, { status: user ? 200 : 401, headers: { "Cache-Control": "no-store" } });
    }

    if (pathname === "/api/auth/callback") {
      const url = new URL(request.url);
      const error = url.searchParams.get("error_description") ?? url.searchParams.get("error");
      if (error) return new Response(`Microsoft sign-in failed: ${error}`, { status: 400 });

      const code = url.searchParams.get("code");
      const returnedState = url.searchParams.get("state");
      const stateCookie = cookieValue(request, "auth_state");
      if (!code || !returnedState || !stateCookie || !stateCookie.startsWith(`${returnedState}.`)) {
        return new Response("Invalid Microsoft sign-in state.", { status: 400 });
      }

      const nonce = stateCookie.split(".")[1];
      const tokenResponse = await fetch(`${authority}/oauth2/v2.0/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          scope: "openid profile email",
        }),
      });
      if (!tokenResponse.ok) return new Response("Microsoft sign-in token exchange failed.", { status: 401 });
      const tokens = await tokenResponse.json() as { id_token?: string };
      if (!tokens.id_token) return new Response("Microsoft did not return an identity token.", { status: 401 });

      const jwks = createRemoteJWKSet(new URL(`https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`));
      const { payload } = await jwtVerify(tokens.id_token, jwks, {
        issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
        audience: clientId,
      });
      if (typeof payload.nonce === "string" && payload.nonce !== nonce) {
        return new Response("Invalid Microsoft sign-in nonce.", { status: 400 });
      }
      if (typeof payload.tid !== "string" || payload.tid !== tenantId) {
        return new Response("Sign-in account belongs to an unauthorized tenant.", { status: 403 });
      }

      const oid = typeof payload.oid === "string" ? payload.oid : typeof payload.sub === "string" ? payload.sub : "";
      const email = typeof payload.email === "string" ? payload.email : typeof payload.preferred_username === "string" ? payload.preferred_username : "";
      const name = typeof payload.name === "string" ? payload.name : email;
      if (!oid || !email) return new Response("Microsoft account is missing required identity claims.", { status: 400 });

      const user = await findOrCreateUser(email, oid, name);
      const sessionCookie = await createSessionCookie(user);
      const clearState = "auth_state=; Path=/api/auth/callback; HttpOnly; SameSite=Lax; Max-Age=0";
      const headers = new Headers({ Location: "/" });
      headers.append("Set-Cookie", sessionCookie);
      headers.append("Set-Cookie", clearState);
      return new Response(null, { status: 302, headers });
    }

    return null;
  } catch (error) {
    console.error("Entra authentication failed:", error);
    return new Response("Clinic authentication is unavailable. Contact an administrator.", { status: 500 });
  }
}
