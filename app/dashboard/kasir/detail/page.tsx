import { redirect } from "next/navigation";

import CashierOrderDetail from "@/components/CashierOrderDetail";
import { getOrderDetail, getSessionUser } from "@/lib/coffee-oz";
import { createCsrfToken } from "@/lib/security";

export const dynamic = "force-dynamic";

export default async function KasirOrderDetailPage({
  searchParams,
}: {
  searchParams?: Promise<{ orderId?: string }>;
}) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/");
  }

  if (sessionUser.role !== "Kasir") {
    redirect("/");
  }

  const params = (await searchParams) ?? {};
  const orderId = params.orderId ?? "";

  if (!orderId) {
    redirect("/dashboard/kasir/pembayaran");
  }

  const order = await getOrderDetail(orderId);

  if (!order) {
    return (
      <main className="cashier-detail-page">
        <p className="cashier-empty-state">Pesanan yang dipilih tidak ditemukan.</p>
      </main>
    );
  }

  const serializableOrder = {
    id_pesanan: order.id_pesanan,
    status_pesanan: order.status_pesanan,
    tanggal: order.tanggal,
    total_tagihan: Number(order.total_tagihan ?? 0),
    detail_pesanan: order.detail_pesanan.map((detail) => ({
      id_detail: detail.id_detail,
      kuantitas_produk: Number(detail.kuantitas_produk ?? 0),
      subtotal: Number(detail.subtotal ?? 0),
      menu: detail.menu
        ? {
            nama_menu: detail.menu.nama_menu,
            harga: Number(detail.menu.harga ?? 0),
          }
        : null,
    })),
    pembayaran: order.pembayaran.map((payment) => ({
      status_pembayaran: payment.status_pembayaran,
      metode: payment.metode,
    })),
  };

  return <CashierOrderDetail csrfToken={createCsrfToken()} order={serializableOrder} />;
}
