import { redirect } from "next/navigation";

import { formatCurrency, getSalesReport, getSessionUser, getTransactionRecord } from "@/lib/coffee-oz";

export const dynamic = "force-dynamic";

export default async function OwnerDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string; to?: string; selectedTransactionId?: string; message?: string }>;
}) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/");
  }

  if (sessionUser.role !== "Pemilik") {
    redirect("/");
  }

  const params = (await searchParams) ?? {};
  const report: any = await getSalesReport(params.from, params.to);
  const selectedTransaction: any = params.selectedTransactionId
    ? await getTransactionRecord(params.selectedTransactionId)
    : (report.transactions?.[0] ?? null);

  return (
    <main className="space-y-6">
      <section className="rounded-[26px] border border-white/20 bg-white/12 p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[0.72rem] uppercase tracking-[0.2em] text-white/65">Laporan penjualan</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.07em]">Ringkasan penjualan</h2>
          </div>

          <form method="GET" className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-white/80">
              <span className="mr-2">Dari</span>
              <input
                type="date"
                name="from"
                defaultValue={params.from ?? "2026-10-01"}
                className="rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-white placeholder:text-white/60"
              />
            </label>
            <label className="text-sm text-white/80">
              <span className="mr-2">Sampai</span>
              <input
                type="date"
                name="to"
                defaultValue={params.to ?? "2026-10-31"}
                className="rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-white placeholder:text-white/60"
              />
            </label>
            <button type="submit" className="rounded-xl bg-[#eff4ff] px-4 py-2 text-sm font-bold text-[#1c2f6d]">
              Filter
            </button>
          </form>
        </div>
      </section>

      {params.message && (
        <div className="rounded-2xl border border-amber-200/50 bg-amber-100/90 px-4 py-3 text-sm font-medium text-amber-900">
          {params.message}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[22px] border border-white/15 bg-white/12 p-5 text-white backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-white/70">Total pendapatan</p>
          <h3 className="mt-3 text-3xl font-black tracking-[-0.05em]">{formatCurrency(report.totalRevenue)}</h3>
        </div>
        <div className="rounded-[22px] border border-white/15 bg-white/12 p-5 text-white backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-white/70">Jumlah transaksi</p>
          <h3 className="mt-3 text-3xl font-black tracking-[-0.05em]">{report.totalTransactions}</h3>
        </div>
        <div className="rounded-[22px] border border-white/15 bg-white/12 p-5 text-white backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-white/70">Rata-rata transaksi</p>
          <h3 className="mt-3 text-3xl font-black tracking-[-0.05em]">{formatCurrency(report.averageTicket)}</h3>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[26px] border border-white/15 bg-white/12 p-5 text-white backdrop-blur-sm md:p-6">
          <h3 className="text-xl font-bold">Riwayat transaksi</h3>

          {report.transactions.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-white/40 bg-white/6 p-6 text-center text-white/80">
              Belum terdapat transaksi pada periode yang dipilih.
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-white/70">
                  <tr>
                    <th className="pb-3 pr-4">No. Transaksi</th>
                    <th className="pb-3 pr-4">Tanggal</th>
                    <th className="pb-3 pr-4">Metode</th>
                    <th className="pb-3 pr-4 text-right">Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {report.transactions.map((transaction: any) => (
                    <tr key={transaction.id_transaksi} className="border-t border-white/10 text-white/90">
                      <td className="py-3 pr-4 font-semibold">
                        <a href={`?from=${params.from ?? ""}&to=${params.to ?? ""}&selectedTransactionId=${transaction.id_transaksi}`} className="underline decoration-white/50 underline-offset-4">
                          {transaction.id_transaksi}
                        </a>
                      </td>
                      <td className="py-3 pr-4">{new Date(transaction.tanggal_transaksi ?? Date.now()).toLocaleDateString("id-ID")}</td>
                      <td className="py-3 pr-4">{transaction.pembayaran?.metode ?? "-"}</td>
                      <td className="py-3 pr-4 text-right font-semibold">{formatCurrency(transaction.total_transaksi ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-[26px] border border-white/15 bg-white/12 p-5 text-white backdrop-blur-sm md:p-6">
          <h3 className="text-xl font-bold">Menu terlaris</h3>
          {report.productSales.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-white/40 bg-white/6 p-6 text-center text-white/80">
              Belum ada data menu terjual.
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {report.productSales.map((item: any) => (
                <div key={item.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-3 py-3">
                  <span className="font-medium text-white/90">{item.name}</span>
                  <span className="rounded-full bg-white/15 px-2 py-1 text-xs uppercase tracking-[0.12em] text-white/80">
                    {item.qty} pcs
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedTransaction && (
        <section className="rounded-[26px] border border-white/15 bg-white/12 p-5 text-white backdrop-blur-sm md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.2em] text-white/65">Detail transaksi</p>
              <h3 className="mt-2 text-2xl font-bold tracking-[-0.06em]">{selectedTransaction.id_transaksi}</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              <form action="/api/owner/transactions" method="POST">
                <input type="hidden" name="action" value="delete" />
                <input type="hidden" name="transactionId" value={selectedTransaction.id_transaksi} />
                <button type="submit" className="rounded-xl border border-red-200/40 bg-red-500/15 px-4 py-2 text-sm font-bold text-red-100">
                  Hapus Transaksi
                </button>
              </form>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/60">Informasi</p>
                <div className="mt-3 space-y-2 text-sm text-white/85">
                  <div className="flex items-center justify-between"><span>Pesanan</span><strong>{selectedTransaction.pembayaran?.pesanan?.id_pesanan ?? "-"}</strong></div>
                  <div className="flex items-center justify-between"><span>Tanggal</span><strong>{new Date(selectedTransaction.tanggal_transaksi ?? Date.now()).toLocaleDateString("id-ID")}</strong></div>
                  <div className="flex items-center justify-between"><span>Metode</span><strong>{selectedTransaction.pembayaran?.metode ?? "-"}</strong></div>
                  <div className="flex items-center justify-between"><span>Status</span><strong>{selectedTransaction.pembayaran?.status_pembayaran ?? "Lunas"}</strong></div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/60">Detail menu</p>
                <div className="mt-3 space-y-3">
                  {(selectedTransaction.pembayaran?.pesanan?.detail_pesanan ?? []).map((detail: any) => (
                    <div key={detail.id_detail} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                      <div>
                        <p className="font-semibold text-white">{detail.menu?.nama_menu ?? "Menu"}</p>
                        <p className="text-xs text-white/70">Qty {detail.kuantitas_produk}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-white">{formatCurrency(detail.subtotal ?? 0)}</span>
                        <form action="/api/owner/transactions" method="POST">
                          <input type="hidden" name="action" value="delete-detail" />
                          <input type="hidden" name="detailId" value={detail.id_detail} />
                          <button type="submit" className="rounded-lg border border-white/25 bg-white/8 px-2 py-1 text-[0.62rem] uppercase tracking-[0.12em] text-white/80">
                            Hapus
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">Edit transaksi</p>
              <form action="/api/owner/transactions" method="POST" className="mt-4 space-y-4">
                <input type="hidden" name="action" value="update" />
                <input type="hidden" name="transactionId" value={selectedTransaction.id_transaksi} />
                <label className="block text-sm text-white/80">
                  <span className="mb-2 block">Total transaksi</span>
                  <input
                    type="number"
                    name="totalTransaksi"
                    defaultValue={Number(selectedTransaction.total_transaksi ?? selectedTransaction.pembayaran?.jumlah_bayar ?? 0)}
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white"
                    required
                  />
                </label>
                <label className="block text-sm text-white/80">
                  <span className="mb-2 block">Metode pembayaran</span>
                  <select name="paymentMethod" defaultValue={selectedTransaction.pembayaran?.metode ?? "QRIS"} className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white">
                    <option value="QRIS" className="text-slate-900">QRIS</option>
                    <option value="Transfer Bank" className="text-slate-900">Transfer Bank</option>
                    <option value="Tunai" className="text-slate-900">Tunai</option>
                    <option value="Kartu Debit" className="text-slate-900">Kartu Debit</option>
                  </select>
                </label>
                <button type="submit" className="w-full rounded-xl bg-[#eff4ff] px-4 py-3 text-sm font-bold text-[#1c2f6d]">
                  Simpan Perubahan
                </button>
              </form>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
