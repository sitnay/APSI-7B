import { NextRequest, NextResponse } from "next/server";

import { clearSessionUser } from "@/lib/coffee-oz";
import { verifyCsrfToken } from "@/lib/security";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  if (!verifyCsrfToken(String(formData.get("_csrf") ?? ""))) {
    return NextResponse.json({ error: "Token CSRF tidak valid." }, { status: 403 });
  }

  await clearSessionUser();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
