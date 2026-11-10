import { redirect } from "next/navigation";

import { getCashierOrders, getSessionUser } from "@/lib/coffee-oz";

export const dynamic = "force-dynamic";

export default async function KasirDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ message?: string }>;
}) {
  const sessionUser = await getSessionUser();

  if (!sessionUser || sessionUser.role !== "Kasir") {
    redirect("/");
  }

  const [orders, params] = await Promise.all([
    getCashierOrders(),
    searchParams ? searchParams : Promise.resolve({ message: undefined }),
  ]);
  const { unpaid, paid } = orders;

  return (
    <main className="cashier-dashboard-page">
      <h1>Dashboard Kasir Oz</h1>
      <p>Semangat menjalani hari harimu</p>

      {params.message ? <p className="cashier-notice" role="status">{params.message}</p> : null}

      <section aria-label="Status pesanan" className="cashier-stat-grid">
        <article className="cashier-stat-card">
          <div className="cashier-stat-card__title">
            <span aria-hidden="true" className="cashier-stat-card__icon">
              <svg viewBox="0 0 24 24"><path d="M5 8h12v5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5V8Z" /><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 4c0 1 1 1.2 1 2.2M12 4c0 1 1 1.2 1 2.2" /></svg>
            </span>
            <span>Total Pesanan Yang<br />Belum Lunas</span>
          </div>
          <strong>{unpaid.length}</strong>
        </article>
        <article className="cashier-stat-card">
          <div className="cashier-stat-card__title">
            <span aria-hidden="true" className="cashier-stat-card__icon">
              <svg viewBox="0 0 24 24"><path d="M5 8h12v5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5V8Z" /><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 4c0 1 1 1.2 1 2.2M12 4c0 1 1 1.2 1 2.2" /></svg>
            </span>
            <span>Total Pesanan Yang<br />Sudah Lunas</span>
          </div>
          <strong>{paid.length}</strong>
        </article>
      </section>

      <nav aria-label="Aksi kasir" className="cashier-dashboard-actions">
        <a className="cashier-dashboard-action" href="/dashboard/kasir/pembayaran">
          PEMBAYARAN
        </a>
        <a className="cashier-dashboard-action" href="/dashboard/kasir/receipt">
          BUKTI PEMBAYARAN
        </a>
      </nav>
    </main>
  );
}
