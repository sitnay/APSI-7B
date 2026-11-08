import { NextRequest, NextResponse } from "next/server";

import { clearSessionUser } from "@/lib/coffee-oz";

export async function POST(request: NextRequest) {
  await clearSessionUser();
  return NextResponse.redirect(new URL("/", request.url));
}
