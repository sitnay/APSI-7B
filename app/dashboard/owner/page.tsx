import { redirect } from "next/navigation";

import { formatCurrency, getDefaultSalesDateRange, getSalesReport, getSessionUser } from "@/lib/coffee-oz";

export const dynamic = "force-dynamic";

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function OwnerDashboardPage() {
  const sessionUser = await getSessionUser();

  if (!sessionUser || sessionUser.role !== "Pemilik") {
    redirect("/");
  }

  const defaultRange = getDefaultSalesDateRange();
  const report = await getSalesReport(defaultRange.from, defaultRange.to);
  const todayKey = localDateKey(new Date());
  const todayRevenue = report.transactions.reduce<number>((total, transaction) => {
    if (!transaction.tanggal_transaksi) {
      return total;
    }

    const transactionDate = new Date(transaction.tanggal_transaksi);
    return localDateKey(transactionDate) === todayKey
      ? total + Number(transaction.total_transaksi ?? 0)
      : total;
  }, 0);

  const chartDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = localDateKey(date);
    const value = report.transactions.reduce<number>((total, transaction) => {
      return transaction.tanggal_transaksi && localDateKey(new Date(transaction.tanggal_transaksi)) === key
        ? total + Number(transaction.total_transaksi ?? 0)
        : total;
    }, 0);

    return {
      key,
      label: new Intl.DateTimeFormat("id-ID", { weekday: "short" }).format(date),
      value,
    };
  });
  const chartMaximum = Math.max(...chartDays.map((day) => day.value), 1);
  const topProducts = [...report.productSales]
    .sort((left, right) => right.qty - left.qty)
    .slice(0, 4);
  const productMaximum = Math.max(...topProducts.map((item) => item.qty), 1);

  return (
    <main className="owner-dashboard-page">
      <header className="owner-page-heading">
        <div>
          <h2>Performa Bisnis</h2>
          <p>Ringkasan performa Kopi OZ untuk {new Intl.DateTimeFormat("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(new Date())}</p>
        </div>
        <a className="owner-primary-link" href="/dashboard/owner/reports">
          Lihat Laporan Lengkap
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>
        </a>
      </header>

      <section aria-label="Ringkasan penjualan" className="owner-kpi-grid">
        <article className="owner-kpi-card">
          <span aria-hidden="true" className="owner-kpi-icon"><svg viewBox="0 0 24 24"><path d="M4 19V9m5 10V5m5 14v-7m5 7V8M2 19h20" /></svg></span>
          <div>
            <p>Penjualan Hari Ini</p>
            <strong>{formatCurrency(todayRevenue)}</strong>
          </div>
          <span aria-hidden="true" className="owner-kpi-chevron"><svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" /></svg></span>
        </article>
        <article className="owner-kpi-card">
          <span aria-hidden="true" className="owner-kpi-icon"><svg viewBox="0 0 24 24"><path d="M7 3h10v18l-5-3-5 3V3Z" /><path d="M10 8h4m-4 4h4" /></svg></span>
          <div>
            <p>Total Pesanan</p>
            <strong>{report.totalTransactions}</strong>
          </div>
          <span aria-hidden="true" className="owner-kpi-chevron"><svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" /></svg></span>
        </article>
        <article className="owner-kpi-card">
          <span aria-hidden="true" className="owner-kpi-icon"><svg viewBox="0 0 24 24"><rect height="14" rx="2" width="19" x="2.5" y="5" /><path d="M3 10h18M7 15h3" /></svg></span>
          <div>
            <p>Rata-rata Penjualan</p>
            <strong>{formatCurrency(report.averageTicket)}</strong>
          </div>
          <span aria-hidden="true" className="owner-kpi-chevron"><svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" /></svg></span>
        </article>
      </section>

      <div className="owner-analytics-grid">
        <section aria-labelledby="owner-trend-title" className="owner-panel">
          <div className="owner-panel__heading">
            <div>
              <h3 id="owner-trend-title">Tren Penjualan</h3>
              <p>Penjualan 7 hari terakhir</p>
            </div>
            <span className="owner-chart-period">7 hari terakhir⌄</span>
          </div>
          <div aria-label="Grafik penjualan 7 hari terakhir" className="owner-chart" role="img">
            <div aria-hidden="true" className="owner-chart__axis">
              <span>{formatCurrency(chartMaximum)}</span>
              <span>{formatCurrency(chartMaximum * 0.66)}</span>
              <span>{formatCurrency(chartMaximum * 0.33)}</span>
              <span>Rp 0</span>
            </div>
            <div className="owner-chart__plot">
              {chartDays.map((day, index) => (
                <div className="owner-chart__column" key={day.key}>
                  <span
                    className={`owner-chart__bar${index === chartDays.length - 1 ? " owner-chart__bar--today" : ""}`}
                    style={{ height: `${Math.max((day.value / chartMaximum) * 100, 1)}%` }}
                    title={formatCurrency(day.value)}
                  />
                  <span className="owner-chart__label">{day.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="owner-products-title" className="owner-panel">
          <div className="owner-panel__heading">
            <div>
              <h3 id="owner-products-title">Menu Terlaris</h3>
              <p>Berdasarkan jumlah terjual</p>
            </div>
          </div>
          {topProducts.length === 0 ? (
            <p className="owner-empty-state">Belum ada data menu terjual.</p>
          ) : (
            <div className="owner-product-list">
              {topProducts.map((item, index) => (
                <div className="owner-product" key={item.name}>
                  <span className="owner-product__rank">{index + 1}</span>
                  <span className="owner-product__name">{item.name}</span>
                  <span className="owner-product__qty">{item.qty} terjual</span>
                  <span aria-hidden="true" className="owner-product__bar">
                    <span style={{ width: `${(item.qty / productMaximum) * 100}%` }} />
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
