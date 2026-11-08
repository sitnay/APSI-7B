import { NextRequest, NextResponse } from "next/server";

import { getRoleLandingPage, loginUser, setSessionUser } from "@/lib/coffee-oz";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const selectedRole = String(formData.get("role") ?? "").trim();

  if (selectedRole === "Barista") {
    const url = new URL("/", request.url);
    url.searchParams.set("actor", "Barista");
    url.searchParams.set("error", "Fitur Barista belum tersedia pada implementasi sistem saat ini.");
    return NextResponse.redirect(url);
  }

  if (selectedRole === "Supervisor Stok") {
    const url = new URL("/", request.url);
    url.searchParams.set("actor", "Supervisor Stok");
    url.searchParams.set("error", "Fitur Supervisor Stok belum tersedia pada implementasi sistem saat ini.");
    return NextResponse.redirect(url);
  }

  const user = await loginUser(username, password, selectedRole);
  if (!user) {
    const url = new URL("/", request.url);
    url.searchParams.set("actor", selectedRole || "Pemilik");
    url.searchParams.set("error", "Username, password, atau role yang dipilih tidak sesuai.");
    return NextResponse.redirect(url);
  }

  await setSessionUser(user);

  const landingPage = getRoleLandingPage(user.role);
  return NextResponse.redirect(new URL(landingPage, request.url));
}
