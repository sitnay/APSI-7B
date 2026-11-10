import { NextRequest, NextResponse } from "next/server";

import { getRoleLandingPage, loginUser, setSessionUser } from "@/lib/coffee-oz";
import { verifyCsrfToken } from "@/lib/security";

function getDatabaseErrorCode(error: unknown) {
  let current: unknown = error;
  const visited = new Set<object>();

  while (current && typeof current === "object" && !visited.has(current)) {
    visited.add(current);
    const candidate = current as { code?: unknown; cause?: unknown };
    if (typeof candidate.code === "string") {
      return candidate.code;
    }
    current = candidate.cause;
  }

  return null;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  if (!verifyCsrfToken(String(formData.get("_csrf") ?? ""))) {
    const url = new URL("/", request.url);
    url.searchParams.set("actor", String(formData.get("role") ?? "Pemilik"));
    url.searchParams.set("error", "Sesi formulir kedaluwarsa. Silakan coba kembali.");
    return NextResponse.redirect(url, { status: 303 });
  }

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const selectedRole = String(formData.get("role") ?? "").trim();

  if (selectedRole === "Barista") {
    const url = new URL("/", request.url);
    url.searchParams.set("actor", "Barista");
    url.searchParams.set("error", "Fitur Barista belum tersedia pada implementasi sistem saat ini.");
    return NextResponse.redirect(url, { status: 303 });
  }

  if (selectedRole === "Supervisor Stok") {
    const url = new URL("/", request.url);
    url.searchParams.set("actor", "Supervisor Stok");
    url.searchParams.set("error", "Fitur Supervisor Stok belum tersedia pada implementasi sistem saat ini.");
    return NextResponse.redirect(url, { status: 303 });
  }

  let user: Awaited<ReturnType<typeof loginUser>>;
  try {
    user = await loginUser(username, password, selectedRole);
  } catch (error) {
    const code = getDatabaseErrorCode(error);
    if (
      !code ||
      !["ECONNREFUSED", "ECONNRESET", "ETIMEDOUT", "ENOTFOUND", "P1001", "P1002", "P1017"].includes(code)
    ) {
      throw error;
    }

    console.error("[login] Database connection failed", { code });
    const url = new URL("/", request.url);
    url.searchParams.set("actor", selectedRole || "Pemilik");
    url.searchParams.set(
      "error",
      "Layanan login sedang tidak dapat terhubung ke database. Silakan coba beberapa saat lagi.",
    );
    return NextResponse.redirect(url, { status: 303 });
  }

  if (!user) {
    const url = new URL("/", request.url);
    url.searchParams.set("actor", selectedRole || "Pemilik");
    url.searchParams.set("error", "Username, password, atau role yang dipilih tidak sesuai.");
    return NextResponse.redirect(url, { status: 303 });
  }

  await setSessionUser(user);

  const landingPage = getRoleLandingPage(user.role);
  return NextResponse.redirect(new URL(landingPage, request.url), { status: 303 });
}
