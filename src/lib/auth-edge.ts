/**
 * Xác thực session token bằng Web Crypto API.
 *
 * Middleware của Next.js chạy trên Edge runtime nên không dùng được `node:crypto`.
 * Module này lặp lại đúng thuật toán ký của `src/lib/auth.ts` (HMAC-SHA256 trên
 * chuỗi JSON payload) nhưng bằng `crypto.subtle` để chạy được ở cả hai runtime.
 */

export interface SessionPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  exp: number;
}

const encoder = new TextEncoder();

function getSecret(): string {
  return process.env.JWT_SECRET || "vinfast-danang-crm-secret-key-2026";
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** So sánh chuỗi hex theo thời gian hằng số để không lộ thông tin qua timing. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function base64urlDecode(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "="));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export async function verifyTokenEdge(token: string): Promise<SessionPayload | null> {
  try {
    const raw = base64urlDecode(token);
    const lastDot = raw.lastIndexOf(".");
    if (lastDot === -1) return null;

    const dataStr = raw.substring(0, lastDot);
    const signature = raw.substring(lastDot + 1);

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(getSecret()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const expected = toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(dataStr)));

    if (!timingSafeEqual(signature, expected)) return null;

    const parsed = JSON.parse(dataStr) as SessionPayload;
    if (typeof parsed.exp !== "number" || parsed.exp < Date.now()) return null;
    if (!parsed.id || !parsed.email) return null;

    return parsed;
  } catch {
    return null;
  }
}
