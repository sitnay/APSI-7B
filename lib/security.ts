import crypto from "crypto";

const CSRF_TOKEN_MAX_AGE_MS = 2 * 60 * 60 * 1000;

export function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error("SESSION_SECRET wajib disetel di environment dan minimal 32 byte.");
  }

  return secret;
}

export function createCsrfToken() {
  const payload = `${Date.now()}.${crypto.randomBytes(24).toString("base64url")}`;
  const signature = crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyCsrfToken(token: string | null | undefined) {
  if (!token) {
    return false;
  }

  const [timestamp, nonce, signature, ...rest] = token.split(".");
  if (!timestamp || !nonce || !signature || rest.length > 0) {
    return false;
  }

  const issuedAt = Number(timestamp);
  if (!Number.isSafeInteger(issuedAt) || Date.now() - issuedAt > CSRF_TOKEN_MAX_AGE_MS || issuedAt > Date.now()) {
    return false;
  }

  const payload = `${timestamp}.${nonce}`;
  const expected = crypto.createHmac("sha256", getSessionSecret()).update(payload).digest();
  const actual = Buffer.from(signature, "base64url");

  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}
