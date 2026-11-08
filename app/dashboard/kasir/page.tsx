import { redirect } from "next/navigation";

import { formatCurrency, getPaymentContext, getSessionUser } from "@/lib/coffee-oz";

export const dynamic = "force-dynamic";

export default async function KasirDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ message?: string }>;
}) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/");
  }

  if (sessionUser.role !== "Kasir") {
    redirect("/");
  }

  const params = (await searchParams) ?? {};
  const paymentContext = await getPaymentContext();

  return (
    <main className="space-y-6">
      <section className="rounded-[26px] border border-white/20 bg-white/12 p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[0.72rem] uppercase tracking-[0.2em] text-white/65">Transaksi aktif</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.07em]">Pembayaran</h2>
          </div>
          <div className="rounded-full border border-white/20 bg-white/12 px-3 py-1 text-xs uppercase tracking-[0.14em] text-white/70">
            Kasir: {sessionUser.nama}
          </div>
        </div>
      </section>

      {params.message && (
        <div className="rounded-2xl border border-emerald-200/50 bg-emerald-100/90 px-4 py-3 text-sm font-medium text-emerald-900">
          {params.message}
        </div>
      )}

      {!paymentContext ? (
        <div className="rounded-[22px] border border-dashed border-white/35 bg-white/8 p-6 text-center text-white/80">
          Tidak ada pesanan yang menunggu pembayaran saat ini.
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-[26px] border border-white/15 bg-white/12 p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm md:p-6">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/70">Nomor pesanan</p>
                <h3 className="mt-2 text-2xl font-bold tracking-[-0.05em]">{paymentContext.order.id_pesanan}</h3>
              </div>
              <div className="rounded-full border border-white/20 bg-white/12 px-3 py-1 text-xs uppercase tracking-[0.14em] text-white/80">
                {paymentContext.order.status_pesanan}
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {paymentContext.order.detail_pesanan.map((detail: any) => (
                <div key={detail.id_detail} className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/4 p-4">
                  <div>
                    <p className="text-lg font-semibold text-white">{detail.menu?.nama_menu ?? "Menu"}</p>
                    <p className="text-sm text-white/70">{detail.kuantitas_produk} item</p>
                  </div>
                  <div className="text-right text-lg font-semibold text-white">
                    {formatCurrency(detail.subtotal ?? 0)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-[26px] border border-white/15 bg-white/12 p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm md:p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-white/70">Ringkasan</p>
            <div className="mt-5 space-y-4 border-b border-white/10 pb-4">
              <div className="flex items-center justify-between text-white/85">
                <span>Subtotal</span>
                <span>{formatCurrency(paymentContext.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-white/85">
                <span>Biaya layanan</span>
                <span>{formatCurrency(0)}</span>
              </div>
              <div className="flex items-center justify-between pt-3 text-2xl font-bold tracking-[-0.05em] text-white">
                <span>Total</span>
                <span>{formatCurrency(paymentContext.order.total_tagihan ?? 0)}</span>
              </div>
            </div>

            <form action="/api/payments" method="POST" className="mt-6 space-y-5">
              <input type="hidden" name="orderId" value={paymentContext.order.id_pesanan} />
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/20 bg-white/6 px-4 py-3 text-left text-sm text-white/90">
                  <div>
                    <p className="font-semibold">QRIS</p>
                    <span className="text-xs text-white/70">Scan dengan e-wallet / m-banking</span>
                  </div>
                  <input type="radio" name="paymentMethod" value="QRIS" defaultChecked className="h-4 w-4 accent-[#1b2349]" />
                </label>
                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/20 bg-white/6 px-4 py-3 text-left text-sm text-white/90">
                  <div>
                    <p className="font-semibold">Transfer Bank</p>
                    <span className="text-xs text-white/70">Virtual account BCA, BRI, Mandiri</span>
                  </div>
                  <input type="radio" name="paymentMethod" value="Transfer Bank" className="h-4 w-4 accent-[#1b2349]" />
                </label>
                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/20 bg-white/6 px-4 py-3 text-left text-sm text-white/90">
                  <div>
                    <p className="font-semibold">Kartu Debit</p>
                    <span className="text-xs text-white/70">Gesek atau tap mesin EDC</span>
                  </div>
                  <input type="radio" name="paymentMethod" value="Kartu Debit" className="h-4 w-4 accent-[#1b2349]" />
                </label>
                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/20 bg-white/6 px-4 py-3 text-left text-sm text-white/90">
                  <div>
                    <p className="font-semibold">Tunai</p>
                    <span className="text-xs text-white/70">Bayar langsung ke kasir</span>
                  </div>
                  <input type="radio" name="paymentMethod" value="Tunai" className="h-4 w-4 accent-[#1b2349]" />
                </label>
              </div>

              <button
                type="submit"
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#edf3ff] text-base font-bold tracking-[0.08em] text-[#1d2d67] transition hover:bg-white"
              >
                Bayar Sekarang
              </button>

              <a
                href="/dashboard/kasir/receipt"
                className="flex h-12 w-full items-center justify-center rounded-2xl border border-white/30 bg-white/8 text-sm font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-white/15"
              >
                Cetak Bukti Pembayaran
              </a>
            </form>
          </aside>
        </div>
      )}
    </main>
  );
}
