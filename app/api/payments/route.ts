import { NextRequest, NextResponse } from "next/server";

import { getSessionUser, normalizePaymentMethod, processPayment } from "@/lib/coffee-oz";

export async function POST(request: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "Kasir") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const formData = await request.formData();
  const orderId = String(formData.get("orderId") ?? "").trim();
  const paymentMethod = String(formData.get("paymentMethod") ?? "QRIS").trim();

  if (!orderId) {
    const destination = new URL("/dashboard/kasir", request.url);
    destination.searchParams.set("message", "Pesanan tidak valid.");
    return NextResponse.redirect(destination);
  }

  try {
    const normalizedMethod = normalizePaymentMethod(paymentMethod);
    await processPayment(orderId, normalizedMethod, sessionUser.id_pengguna);
    const destination = new URL("/dashboard/kasir", request.url);
    destination.searchParams.set("message", "Pembayaran berhasil dilaksanakan.");
    destination.searchParams.set("orderId", orderId);
    return NextResponse.redirect(destination);
  } catch (error) {
    const destination = new URL("/dashboard/kasir", request.url);
    destination.searchParams.set("message", error instanceof Error ? error.message : "Pembayaran gagal.");
    return NextResponse.redirect(destination);
  }
}
