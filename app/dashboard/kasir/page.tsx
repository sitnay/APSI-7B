import { redirect } from "next/navigation";

import { formatCurrency, getCashierOrders, getSessionUser } from "@/lib/coffee-oz";

export const dynamic = "force-dynamic";

export default async function KasirDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ message?: string; orderId?: string }>;
}) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/");
  }

  if (sessionUser.role !== "Kasir") {
    redirect("/");
  }

  const params = (await searchParams) ?? {};
  const { unpaid, paid } = await getCashierOrders();
  const selectedOrderId = params.orderId ?? unpaid[0]?.id_pesanan ?? paid[0]?.id_pesanan ?? null;
  const selectedOrder = [...unpaid, ...paid].find((order: any) => order.id_pesanan === selectedOrderId) ?? unpaid[0] ?? paid[0] ?? null;

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

      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <div className="space-y-6">
          <section className="rounded-[26px] border border-white/15 bg-white/12 p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm md:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Pesanan belum dibayar</h3>
              <span className="rounded-full border border-white/20 bg-white/10 px-2 py-1 text-[0.62rem] uppercase tracking-[0.12em] text-white/80">
                {unpaid.length} data
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {unpaid.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/30 bg-white/5 p-4 text-sm text-white/75">
                  Tidak ada pesanan menunggu pembayaran.
                </div>
              ) : (
                unpaid.map((order: any) => (
                  <div
                    key={order.id_pesanan}
                    className={`rounded-2xl border p-4 transition ${
                      selectedOrder?.id_pesanan === order.id_pesanan
                        ? "border-white/60 bg-white/18"
                        : "border-white/10 bg-white/6"
                    }`}
                  >
                    <a href={`?orderId=${order.id_pesanan}`} className="block">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold">{order.id_pesanan}</span>
                        <span className="rounded-full border border-amber-200/50 bg-amber-100/20 px-2 py-1 text-[0.6rem] uppercase tracking-[0.12em] text-amber-50">
                          {order.status_pesanan}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-white/75">
                        {new Date(order.tanggal ?? Date.now()).toLocaleString("id-ID")}
                      </p>
                      <p className="mt-2 text-lg font-bold text-white">{formatCurrency(order.total ?? 0)}</p>
                    </a>
                    <div className="mt-4 flex items-center justify-end">
                      <a
                        href={`/dashboard/kasir/detail?orderId=${order.id_pesanan}`}
                        className="rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-white/90 transition hover:bg-white/15"
                      >
                        Rincian Pesanan
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[26px] border border-white/15 bg-white/12 p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm md:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Pesanan sudah dibayar</h3>
              <span className="rounded-full border border-white/20 bg-white/10 px-2 py-1 text-[0.62rem] uppercase tracking-[0.12em] text-white/80">
                {paid.length} data
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {paid.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/30 bg-white/5 p-4 text-sm text-white/75">
                  Belum ada pesanan yang dibayar.
                </div>
              ) : (
                paid.map((order: any) => (
                  <div
                    key={order.id_pesanan}
                    className={`rounded-2xl border p-4 transition ${
                      selectedOrder?.id_pesanan === order.id_pesanan
                        ? "border-emerald-200/60 bg-emerald-100/10"
                        : "border-white/10 bg-white/6"
                    }`}
                  >
                    <a href={`?orderId=${order.id_pesanan}`} className="block">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold">{order.id_pesanan}</span>
                        <span className="rounded-full border border-emerald-200/50 bg-emerald-100/15 px-2 py-1 text-[0.6rem] uppercase tracking-[0.12em] text-emerald-50">
                          Lunas
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-white/75">
                        {new Date(order.tanggal ?? Date.now()).toLocaleString("id-ID")}
                      </p>
                      <p className="mt-2 text-lg font-bold text-white">{formatCurrency(order.total ?? 0)}</p>
                    </a>
                    <div className="mt-4 flex items-center justify-end">
                      <a
                        href={`/dashboard/kasir/receipt?orderId=${order.id_pesanan}`}
                        className="rounded-xl border border-emerald-200/40 bg-emerald-100/10 px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-emerald-50 transition hover:bg-emerald-100/15"
                      >
                        Lihat Bukti
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <section className="rounded-[26px] border border-white/15 bg-white/12 p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm md:p-6">
          {!selectedOrder ? (
            <div className="rounded-2xl border border-dashed border-white/30 bg-white/5 p-6 text-center text-white/75">
              Pilih pesanan untuk melihat detail transaksi.
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/70">Nomor pesanan</p>
                    <h3 className="mt-2 text-2xl font-bold tracking-[-0.05em]">{selectedOrder.id_pesanan}</h3>
                  </div>
                  <div className="rounded-full border border-white/20 bg-white/12 px-3 py-1 text-xs uppercase tracking-[0.14em] text-white/80">
                    {selectedOrder.status_pesanan}
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {(selectedOrder.detail_pesanan ?? []).map((detail: any) => (
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
              </div>

              <aside className="rounded-[22px] border border-white/15 bg-white/8 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-white/70">Ringkasan</p>
                <div className="mt-5 space-y-4 border-b border-white/10 pb-4">
                  <div className="flex items-center justify-between text-white/85">
                    <span>Subtotal</span>
                    <span>{formatCurrency(selectedOrder.total ?? 0)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 text-2xl font-bold tracking-[-0.05em] text-white">
                    <span>Total</span>
                    <span>{formatCurrency(selectedOrder.total ?? 0)}</span>
                  </div>
                </div>

                {selectedOrder.pembayaran?.some((payment: any) => payment.status_pembayaran === "Lunas") ? (
                  <div className="mt-6 space-y-3">
                    <div className="rounded-2xl border border-emerald-200/40 bg-emerald-50/10 px-4 py-3 text-sm text-emerald-50">
                      Pembayaran berhasil dilaksanakan.
                    </div>
                    <a
                      href={`/dashboard/kasir/receipt?orderId=${selectedOrder.id_pesanan}`}
                      className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#edf3ff] text-sm font-bold uppercase tracking-[0.08em] text-[#1d2d67]"
                    >
                      Lihat Bukti Pembayaran
                    </a>
                  </div>
                ) : (
                  <form action="/api/payments" method="POST" className="mt-6 space-y-5">
                    <input type="hidden" name="orderId" value={selectedOrder.id_pesanan} />
                    <div className="space-y-3">
                      <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/20 bg-white/6 px-4 py-3 text-left text-sm text-white/90">
                        <div>
                          <p className="font-semibold">QRIS</p>
                          <span className="text-xs text-white/70">Scan QR</span>
                        </div>
                        <input type="radio" name="paymentMethod" value="QRIS" defaultChecked className="h-4 w-4 accent-[#1b2349]" />
                      </label>
                      <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/20 bg-white/6 px-4 py-3 text-left text-sm text-white/90">
                        <div>
                          <p className="font-semibold">Transfer Bank</p>
                          <span className="text-xs text-white/70">Rekening resmi toko</span>
                        </div>
                        <input type="radio" name="paymentMethod" value="Transfer Bank" className="h-4 w-4 accent-[#1b2349]" />
                      </label>
                      <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/20 bg-white/6 px-4 py-3 text-left text-sm text-white/90">
                        <div>
                          <p className="font-semibold">Kartu Debit</p>
                          <span className="text-xs text-white/70">EDC / kartu debit</span>
                        </div>
                        <input type="radio" name="paymentMethod" value="Kartu Debit" className="h-4 w-4 accent-[#1b2349]" />
                      </label>
                      <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/20 bg-white/6 px-4 py-3 text-left text-sm text-white/90">
                        <div>
                          <p className="font-semibold">Tunai di Kasir</p>
                          <span className="text-xs text-white/70">Bayar langsung</span>
                        </div>
                        <input type="radio" name="paymentMethod" value="Tunai di Kasir" className="h-4 w-4 accent-[#1b2349]" />
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#edf3ff] text-base font-bold tracking-[0.08em] text-[#1d2d67] transition hover:bg-white"
                    >
                      Konfirmasi Pembayaran
                    </button>
                  </form>
                )}
              </aside>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
