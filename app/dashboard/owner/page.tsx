import { redirect } from "next/navigation";

import { formatCurrency, getSalesReport, getSessionUser } from "@/lib/coffee-oz";

export const dynamic = "force-dynamic";

export default async function OwnerDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string; to?: string }>;
}) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/");
  }

  if (sessionUser.role !== "Pemilik") {
    redirect("/");
  }

  const params = (await searchParams) ?? {};
  const report = await getSalesReport(params.from, params.to);

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

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
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
                      <td className="py-3 pr-4 font-semibold">{transaction.id_transaksi}</td>
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
              {report.productSales.map((item) => (
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
    </main>
  );
}
