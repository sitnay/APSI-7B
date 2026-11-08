import { redirect } from "next/navigation";

import { formatCurrency, getPaymentContext, getSessionUser } from "@/lib/coffee-oz";

export const dynamic = "force-dynamic";

export default async function ReceiptPage() {
  const sessionUser = await getSessionUser();

  if (!sessionUser || sessionUser.role !== "Kasir") {
    redirect("/");
  }

  const paymentContext = await getPaymentContext();

  if (!paymentContext) {
    return (
      <div className="rounded-2xl border border-dashed border-white/40 bg-white/8 p-6 text-center text-white/75">
        Belum ada transaksi yang bisa dicetak.
      </div>
    );
  }

  return (
    <main className="rounded-[26px] border border-white/20 bg-white/12 p-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm">
      <div className="mx-auto max-w-2xl rounded-[22px] bg-white p-6 text-[#1c214f] print:bg-white">
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Kopi OZ</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.08em]">Bukti Pembayaran</h1>
          </div>
          <div className="text-right text-sm text-slate-600">
            <p>Nomor Pesanan</p>
            <p className="font-bold text-slate-900">{paymentContext.order.id_pesanan}</p>
          </div>
        </div>

        <div className="mt-5 space-y-2 text-sm text-slate-700">
          <div className="flex items-center justify-between">
            <span>Tanggal</span>
            <strong>{new Date(paymentContext.order.tanggal ?? Date.now()).toLocaleDateString("id-ID")}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span>Metode</span>
            <strong>{paymentContext.paymentMethod}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span>Kasir</span>
            <strong>{sessionUser.nama}</strong>
          </div>
        </div>

        <div className="mt-6 space-y-3 border-y border-slate-200 py-4">
          {paymentContext.order.detail_pesanan.map((detail: any) => (
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
          <span>{formatCurrency(paymentContext.order.total_tagihan ?? 0)}</span>
        </div>

        <div className="mt-8 flex justify-center print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl bg-[#27398f] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white"
          >
            Cetak
          </button>
        </div>
      </div>
    </main>
  );
}
