import crypto from "node:crypto";
import { getDatabase } from "./mongodb.server";

export type ClinicUser = {
  id: string;
  phone?: string;
  designation?: string;
  regNo?: string;
  department?: string;
  email: string;
  name: string;
  role: "admin" | "staff";
};

type ClinicUserRecord = {
  _id?: unknown;
  email: string;
  name?: string;
  role?: "admin" | "staff";
  phone?: string;
  designation?: string;
  regNo?: string;
  department?: string;
  active?: boolean;
  passwordHash?: string;
};

const secureCookies = process.env.NODE_ENV === "production";

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is required in production.");
  }
  return secret || "local-development-only-change-this-secret-before-production";
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string | undefined) {
  if (!stored) return false;
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const expected = Buffer.from(parts[2], "hex");
  const actual = crypto.scryptSync(password, parts[1], 64);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function cookieValue(request: Request, name: string) {
  const cookie = request.headers.get("cookie") ?? "";
  for (const item of cookie.split(";")) {
    const [key, ...value] = item.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return undefined;
}

function signPayload(payload: string) {
  return crypto.createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export async function createSessionCookie(user: ClinicUser) {
  const payload = Buffer.from(JSON.stringify({
    ...user,
    expiresAt: Date.now() + 8 * 60 * 60 * 1000,
  })).toString("base64url");
  const token = `${payload}.${signPayload(payload)}`;
  return `clinic_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800${secureCookies ? "; Secure" : ""}`;
}

export async function getSession(request: Request): Promise<ClinicUser | null> {
  const token = cookieValue(request, "clinic_session");
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = signPayload(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as ClinicUser & { expiresAt: number };
    if (!parsed.expiresAt || parsed.expiresAt < Date.now()) return null;
    if (!parsed.id || !parsed.email || (parsed.role !== "admin" && parsed.role !== "staff")) return null;
    return { id: parsed.id, email: parsed.email, name: parsed.name, role: parsed.role };
  } catch {
    return null;
  }
}

async function bootstrapUsers(users: any) {
  const adminEmail = (process.env.CLINIC_ADMIN_EMAIL || "medical@sailorsmedical.com").toLowerCase().trim();
  const adminPassword = process.env.CLINIC_ADMIN_PASSWORD || "Admin@123";
  const staffEmail = (process.env.CLINIC_STAFF_EMAIL || "info@sailorsmedical.com").toLowerCase().trim();
  const staffPassword = process.env.CLINIC_STAFF_PASSWORD || "Staff@1";

  const accounts: Array<{ email: string; password: string; name: string; role: "admin" | "staff" }> = [
    { email: adminEmail, password: adminPassword, name: "Dr. Mitali Gadge", role: "admin" },
    { email: staffEmail, password: staffPassword, name: "Rachel Adams", role: "staff" },
  ];
  for (const account of accounts) {
    const email = account.email.toLowerCase();
    const existing = await users.findOne({ email });
    if (!existing) {
      await users.insertOne({
        email,
        name: account.name,
        role: account.role,
        active: true,
        passwordHash: hashPassword(account.password),
        createdAt: new Date(),
      });
    } else {
      await users.updateOne(
        { email },
        { $set: { email, role: account.role, active: true, passwordHash: hashPassword(account.password) } },
      );
    }
  }
}

export async function handleAuthRequest(request: Request, pathname: string): Promise<Response | null> {
  if (!pathname.startsWith("/api/auth/")) return null;

  if (pathname === "/api/auth/login" && request.method === "POST") {
    try {
      const body = await request.json() as { email?: unknown; password?: unknown };
      if (typeof body.email !== "string" || typeof body.password !== "string") {
        return Response.json({ message: "Enter an email address and password." }, { status: 400 });
      }
      const email = body.email.trim().toLowerCase();
      const db = await getDatabase();
      const users = db.collection<ClinicUserRecord>("clinic_users");
      await bootstrapUsers(users);
      const record = await users.findOne({ email, active: { $ne: false } });
      if (!record || !verifyPassword(body.password, record.passwordHash)) {
        return Response.json({ message: "Invalid email or password." }, { status: 401 });
      }
      const id = record._id?.toString() || email;
      const user: ClinicUser = {
        id,
        email,
        name: record.name || (record.role === "admin" ? "Mitali Gadge" : "Rachel Adams"),
        phone: record.phone,
        designation: record.designation,
        regNo: record.regNo,
        department: record.department,
        role: record.role === "admin" ? "admin" : "staff",
      };
      await users.updateOne({ _id: record._id }, { $set: { lastLoginAt: new Date() } }).catch(() => undefined);
      return Response.json(user, { status: 200, headers: { "Set-Cookie": await createSessionCookie(user), "Cache-Control": "no-store" } });
    } catch (error) {
      console.error("Clinic login failed:", error);
      return Response.json({ message: "Unable to sign in. Check the clinic configuration." }, { status: 500 });
    }
  }

  if (pathname === "/api/auth/profile" && request.method === "POST") {
    const session = await getSession(request);
    if (!session) {
      return Response.json({ message: "Authentication required." }, { status: 401 });
    }
    try {
      const body = (await request.json()) as {
        name?: string;
        phone?: string;
        designation?: string;
        regNo?: string;
        department?: string;
      };
      const db = await getDatabase();
      const users = db.collection<ClinicUserRecord>("clinic_users");
      const updateData: Partial<ClinicUserRecord> = {};
      if (typeof body.name === "string" && body.name.trim()) {
        updateData.name = body.name.trim();
      }
      if (typeof body.phone === "string") {
        updateData.phone = body.phone.trim();
      }
      if (typeof body.designation === "string") {
        updateData.designation = body.designation.trim();
      }
      if (typeof body.regNo === "string") {
        updateData.regNo = body.regNo.trim();
      }
      if (typeof body.department === "string") {
        updateData.department = body.department.trim();
      }

      await users.updateOne(
        { email: session.email.toLowerCase() },
        { $set: updateData },
        { upsert: true }
      );

      const updatedUser: ClinicUser = {
        ...session,
        name: updateData.name || session.name,
        phone: updateData.phone,
        designation: updateData.designation,
        regNo: updateData.regNo,
        department: updateData.department,
      };

      try {
        await db.collection("activity_logs").insertOne({
          id: `ACT-${Date.now()}`,
          user: updatedUser.name,
          action: "Updated administrator profile credentials",
          subject: `${updatedUser.name} (${updatedUser.role})`,
          time: "Just now",
          kind: "Profile",
        });
      } catch {
        // Activity log non-fatal
      }

      return Response.json(
        {
          success: true,
          user: updatedUser,
        },
        {
          status: 200,
          headers: {
            "Set-Cookie": await createSessionCookie(updatedUser),
            "Cache-Control": "no-store",
          },
        }
      );
    } catch (error) {
      console.error("Profile update failed:", error);
      return Response.json({ message: "Failed to update profile." }, { status: 500 });
    }
  }

  if (pathname === "/api/auth/me") {
    const user = await getSession(request);
    if (!user) {
      return Response.json(null, { status: 401, headers: { "Cache-Control": "no-store" } });
    }
    try {
      const db = await getDatabase();
      const record = await db.collection<ClinicUserRecord>("clinic_users").findOne({ email: user.email.toLowerCase() });
      const enrichedUser: ClinicUser = {
        ...user,
        name: record?.name || user.name || (user.role === "admin" ? "Mitali Gadge" : "Rachel Adams"),
        phone: record?.phone ?? (user.role === "admin" ? "+91 95614 50104" : "+91 98201 11223"),
        designation: record?.designation ?? (user.role === "admin" ? "Chief Medical Administrator & Director" : "Clinical Coordinator"),
        regNo: record?.regNo ?? (user.role === "admin" ? "MMC-2015-84920 / DG-SMC-04" : "NUR-2019-3381"),
        department: record?.department ?? "Marine Medical Examination & DG Shipping Care",
      };
      return Response.json(enrichedUser, { status: 200, headers: { "Cache-Control": "no-store" } });
    } catch {
      return Response.json(user, { status: 200, headers: { "Cache-Control": "no-store" } });
    }
  }

  if (pathname === "/api/auth/logout" && request.method === "POST") {
    return Response.json({ success: true }, {
      headers: { "Set-Cookie": "clinic_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0", "Cache-Control": "no-store" },
    });
  }

  return Response.json({ message: "Auth endpoint not found." }, { status: 404 });
}
