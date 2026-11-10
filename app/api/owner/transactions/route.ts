import { NextRequest, NextResponse } from "next/server";

import { deleteOwnerOrderDetail, deleteOwnerTransaction, getSessionUser, updateOwnerTransaction } from "@/lib/coffee-oz";
import { verifyCsrfToken } from "@/lib/security";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  if (!verifyCsrfToken(String(formData.get("_csrf") ?? ""))) {
    return NextResponse.json({ error: "Token CSRF tidak valid." }, { status: 403 });
  }

  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "Pemilik") {
    return NextResponse.redirect(new URL("/", request.url), { status: 303 });
  }

  const action = String(formData.get("action") ?? "update");
  const transactionId = String(formData.get("transactionId") ?? "").trim();
  const detailId = String(formData.get("detailId") ?? "").trim();
  const totalTransaksi = Number(formData.get("totalTransaksi") ?? 0);
  const transactionDate = String(formData.get("transactionDate") ?? "").trim();

  try {
    if (action === "delete-detail" && detailId) {
      await deleteOwnerOrderDetail(detailId);
    } else if (action === "delete" && transactionId) {
      await deleteOwnerTransaction(transactionId);
    } else if (action === "update" && transactionId) {
      await updateOwnerTransaction(transactionId, totalTransaksi, transactionDate);
    } else {
      throw new Error("Aksi atau data transaksi tidak valid.");
    }

    const destination = new URL("/dashboard/owner/reports", request.url);
    setReportRange(destination, formData);
    destination.searchParams.set(
      "result",
      action === "delete" || action === "delete-detail" ? "deleted" : "updated",
    );
    return NextResponse.redirect(destination, { status: 303 });
  } catch (error) {
    const destination = new URL("/dashboard/owner/reports", request.url);
    setReportRange(destination, formData);
    destination.searchParams.set("result", "error");
    const safeMessages = new Set([
      "Aksi atau data transaksi tidak valid.",
      "Detail pesanan tidak ditemukan.",
      "Transaksi tidak ditemukan.",
      "Jumlah transaksi harus antara Rp1 dan Rp99.999.999.",
      "Tanggal transaksi tidak valid.",
      "Transaksi yang dibatalkan atau gagal tidak dapat diubah.",
      "Transaksi yang dibatalkan atau gagal tidak dapat dihapus.",
    ]);
    if (error instanceof Error && safeMessages.has(error.message)) {
      destination.searchParams.set("message", error.message);
    } else {
      console.error("Owner transaction mutation failed.");
      destination.searchParams.set(
        "message",
        "Perubahan transaksi gagal. Silakan coba lagi.",
      );
    }
    return NextResponse.redirect(destination, { status: 303 });
  }
}

function setReportRange(destination: URL, formData: FormData) {
  const from = String(formData.get("from") ?? "");
  const to = String(formData.get("to") ?? "");
  if (isDateInput(from) && isDateInput(to) && from <= to) {
    destination.searchParams.set("from", from);
    destination.searchParams.set("to", to);
  }
}

function isDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
