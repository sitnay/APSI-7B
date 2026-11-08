import { redirect } from "next/navigation";

import ReceiptPrintButton from "@/components/ReceiptPrintButton";
import { formatCurrency, getSessionUser, getOrderDetail, getTransactionRecord } from "@/lib/coffee-oz";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({
  searchParams,
}: {
  searchParams?: Promise<{ orderId?: string; transactionId?: string }>;
}) {
  const sessionUser = await getSessionUser();

  if (!sessionUser || sessionUser.role !== "Kasir") {
    redirect("/");
  }

  const params = (await searchParams) ?? {};
  const orderId = params.orderId ?? "";
  const transactionId = params.transactionId ?? "";

  const order = orderId ? await getOrderDetail(orderId) : null;
  const transaction = transactionId ? await getTransactionRecord(transactionId) : null;
  const selectedRecord = order && order.pembayaran?.[0]?.status_pembayaran === "Lunas"
    ? { order, payment: order.pembayaran[0], transactionId: transactionId || "" }
    : transaction && transaction.pembayaran?.status_pembayaran === "Lunas"
      ? { order: transaction.pembayaran.pesanan, payment: transaction.pembayaran, transactionId: transaction.id_transaksi }
      : null;

  if (!selectedRecord) {
    return (
      <main className="rounded-[26px] border border-white/20 bg-white/12 p-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm">
        <div className="rounded-2xl border border-dashed border-white/40 bg-white/8 p-6 text-center text-white/75">
          Belum ada transaksi yang bisa dicetak.
        </div>
      </main>
    );
  }

  const receiptOrder: any = selectedRecord.order;
  const total = Number(receiptOrder?.total_tagihan ?? selectedRecord.payment?.jumlah_bayar ?? 0);

  return (
    <main className="rounded-[26px] border border-white/20 bg-white/12 p-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm">
      <div className="mx-auto max-w-2xl rounded-[22px] bg-white p-6 text-[#1c214f] shadow-[0_15px_40px_rgba(23,27,59,0.08)] print:shadow-none receipt-shell">
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Kopi OZ</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.08em]">Bukti Pembayaran</h1>
          </div>
          <div className="text-right text-sm text-slate-600">
            <p>Nomor Pesanan</p>
            <p className="font-bold text-slate-900">{receiptOrder.id_pesanan}</p>
          </div>
        </div>

        <div className="mt-5 space-y-2 text-sm text-slate-700">
          <div className="flex items-center justify-between">
            <span>Nomor Transaksi</span>
            <strong>{selectedRecord.transactionId || selectedRecord.payment.id_pembayaran}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span>Tanggal</span>
            <strong>{new Date(receiptOrder.tanggal ?? Date.now()).toLocaleDateString("id-ID")}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span>Metode</span>
            <strong>{selectedRecord.payment.metode ?? "QRIS"}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span>Status</span>
            <strong>{selectedRecord.payment.status_pembayaran ?? "Lunas"}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span>Kasir</span>
            <strong>{sessionUser.nama}</strong>
          </div>
        </div>

        <div className="mt-6 space-y-3 border-y border-slate-200 py-4">
          {(receiptOrder.detail_pesanan ?? []).map((detail: any) => (
            <div key={detail.id_detail} className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">{detail.menu?.nama_menu ?? "Menu"}</p>
                <p className="text-xs text-slate-500">Qty {detail.kuantitas_produk}</p>
              </div>
              <div className="font-semibold text-slate-900">{formatCurrency(detail.subtotal ?? 0)}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between text-xl font-black text-slate-900">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>

        <div className="mt-8 flex justify-center gap-3 print:hidden">
          <ReceiptPrintButton />
          <a href="/dashboard/kasir" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-slate-700">
            Kembali
          </a>
        </div>
      </div>
    </main>
  );
}
