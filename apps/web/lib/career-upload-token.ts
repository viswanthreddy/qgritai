import { createHmac, timingSafeEqual } from "node:crypto";

type UploadTokenPayload = { path: string; expiresAt: number };

function signature(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function createCareerUploadToken(path: string, secret: string, now = Date.now()) {
  const encoded = Buffer.from(JSON.stringify({ path, expiresAt: now + 15 * 60_000 } satisfies UploadTokenPayload)).toString("base64url");
  return `${encoded}.${signature(encoded, secret)}`;
}

export function verifyCareerUploadToken(token: string, expectedPath: string, secret: string, now = Date.now()) {
  const [encoded, suppliedSignature] = token.split(".");
  if (!encoded || !suppliedSignature) return false;
  const expectedSignature = signature(encoded, secret);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return false;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as UploadTokenPayload;
    return payload.path === expectedPath && payload.expiresAt >= now;
  } catch {
    return false;
  }
}
