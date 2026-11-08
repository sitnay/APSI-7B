import { NextRequest, NextResponse } from "next/server";

import { getRoleLandingPage, loginUser, setSessionUser } from "@/lib/coffee-oz";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const user = await loginUser(username, password);
  if (!user) {
    const url = new URL("/", request.url);
    url.searchParams.set("error", "Username atau password tidak sesuai.");
    return NextResponse.redirect(url);
  }

  await setSessionUser(user);

  const landingPage = getRoleLandingPage(user.role);
  return NextResponse.redirect(new URL(landingPage, request.url));
}
