import { NextRequest, NextResponse } from "next/server";

import { getSessionUser, normalizePaymentMethod, processPayment } from "@/lib/coffee-oz";
import { verifyCsrfToken } from "@/lib/security";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  if (!verifyCsrfToken(String(formData.get("_csrf") ?? ""))) {
    return NextResponse.json({ error: "Token CSRF tidak valid." }, { status: 403 });
  }

  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "Kasir") {
    return NextResponse.redirect(new URL("/", request.url), { status: 303 });
  }

  const orderId = String(formData.get("orderId") ?? "").trim();
  const paymentMethod = String(formData.get("paymentMethod") ?? "QRIS").trim();

  if (!orderId) {
    const destination = new URL("/dashboard/kasir/pembayaran", request.url);
    destination.searchParams.set("status", "unpaid");
    destination.searchParams.set("message", "Pesanan tidak valid.");
    return NextResponse.redirect(destination, { status: 303 });
  }

  try {
    const normalizedMethod = normalizePaymentMethod(paymentMethod);
    await processPayment(orderId, normalizedMethod, sessionUser.id_pengguna);
    const destination = new URL("/dashboard/kasir/pembayaran", request.url);
    destination.searchParams.set("status", "paid");
    destination.searchParams.set("message", "Pembayaran berhasil dilaksanakan.");
    destination.searchParams.set("orderId", orderId);
    return NextResponse.redirect(destination, { status: 303 });
  } catch (error) {
    const destination = new URL("/dashboard/kasir/pembayaran", request.url);
    destination.searchParams.set("status", "unpaid");
    destination.searchParams.set("message", error instanceof Error ? error.message : "Pembayaran gagal.");
    return NextResponse.redirect(destination, { status: 303 });
  }
}
