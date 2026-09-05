import "server-only";
import { cookies } from "next/headers";
import crypto from "crypto";
import { connectToDatabase, hasDatabase } from "@/lib/mongodb";
import UserModel from "@/lib/models/User";
import type { AdminUser } from "@/types";

const SESSION_COOKIE = "admin_session";
const SECRET_KEY = process.env.JWT_SECRET || "vinfast-danang-crm-secret-key-2026";

export function hashPassword(password: string): string {
  return crypto
    .createHmac("sha256", SECRET_KEY)
    .update(password)
    .digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function createToken(payload: { id: string; email: string; name: string; role: string }): string {
  const data = JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  const signature = crypto.createHmac("sha256", SECRET_KEY).update(data).digest("hex");
  return Buffer.from(`${data}.${signature}`).toString("base64url");
}

export function verifyToken(token: string): { id: string; email: string; name: string; role: string } | null {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf-8");
    const lastDot = raw.lastIndexOf(".");
    if (lastDot === -1) return null;

    const dataStr = raw.substring(0, lastDot);
    const sig = raw.substring(lastDot + 1);

    const expectedSig = crypto.createHmac("sha256", SECRET_KEY).update(dataStr).digest("hex");
    if (sig !== expectedSig) return null;

    const parsed = JSON.parse(dataStr);
    if (parsed.exp < Date.now()) return null;

    return {
      id: parsed.id,
      email: parsed.email,
      name: parsed.name,
      role: parsed.role,
    };
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  return {
    _id: payload.id,
    email: payload.email,
    name: payload.name,
    role: payload.role as "admin" | "sales",
  };
}

export async function setSessionCookie(user: { id: string; email: string; name: string; role: string }) {
  const token = createToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function removeSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
