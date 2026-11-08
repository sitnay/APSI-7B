import { NextRequest, NextResponse } from "next/server";

import { deleteOwnerOrderDetail, deleteOwnerTransaction, getSessionUser, updateOwnerTransaction } from "@/lib/coffee-oz";

export async function POST(request: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "Pemilik") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const formData = await request.formData();
  const action = String(formData.get("action") ?? "update");
  const transactionId = String(formData.get("transactionId") ?? "").trim();
  const detailId = String(formData.get("detailId") ?? "").trim();
  const totalTransaksi = Number(formData.get("totalTransaksi") ?? 0);
  const paymentMethod = String(formData.get("paymentMethod") ?? "QRIS").trim();

  try {
    if (action === "delete-detail" && detailId) {
      await deleteOwnerOrderDetail(detailId);
    } else if (action === "delete" && transactionId) {
      await deleteOwnerTransaction(transactionId);
    } else if (transactionId) {
      await updateOwnerTransaction(transactionId, totalTransaksi, paymentMethod);
    } else {
      throw new Error("Data transaksi tidak valid.");
    }

    const destination = new URL("/dashboard/owner", request.url);
    destination.searchParams.set("message", "Perubahan transaksi berhasil disimpan.");
    return NextResponse.redirect(destination);
  } catch (error) {
    const destination = new URL("/dashboard/owner", request.url);
    destination.searchParams.set("message", error instanceof Error ? error.message : "Perubahan transaksi gagal.");
    return NextResponse.redirect(destination);
  }
}
