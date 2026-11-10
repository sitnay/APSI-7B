import { redirect } from "next/navigation";

import { formatCurrency, getCashierOrders, getSessionUser } from "@/lib/coffee-oz";

export const dynamic = "force-dynamic";

type CashierOrderView = {
  id_pesanan: string;
  tanggal: Date | string | null;
  total: number;
  detail_pesanan: {
    id_detail: string;
    kuantitas_produk: number | null;
    subtotal: unknown;
    menu: { nama_menu: string | null } | null;
  }[];
};

export default async function CashierPaymentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; orderId?: string; message?: string }>;
}) {
  const sessionUser = await getSessionUser();

  if (!sessionUser || sessionUser.role !== "Kasir") {
    redirect("/");
  }

  const params = (await searchParams) ?? {};
  const { unpaid, paid } = await getCashierOrders();
  const status = params.status === "paid" ? "paid" : "unpaid";
  const orders: CashierOrderView[] = status === "paid" ? paid : unpaid;
  const selectedOrder = orders.find((order: CashierOrderView) => order.id_pesanan === params.orderId) ?? orders[0] ?? null;
  const itemSummary = (order: CashierOrderView) => order.detail_pesanan
    .map((detail) => `${detail.menu?.nama_menu ?? "Menu"} ×${detail.kuantitas_produk}`)
    .join(", ");

  return (
    <main className="cashier-payments-page">
      <header className="cashier-page-heading">
        <div>
          <h1>Pesanan {status === "paid" ? "Sudah Lunas" : "Belum Lunas"}</h1>
          <p>Pesanan pelanggan yang {status === "paid" ? "telah dibayar" : "belum membayar"}</p>
        </div>
        <span className="cashier-order-count">{orders.length} pesanan</span>
      </header>

      {params.message ? <p className="cashier-notice" role="status">{params.message}</p> : null}

      <nav aria-label="Status pembayaran" className="cashier-status-tabs">
        <a
          aria-current={status === "unpaid" ? "page" : undefined}
          className={`cashier-status-tab${status === "unpaid" ? " cashier-status-tab--active" : ""}`}
          href="/dashboard/kasir/pembayaran"
        >
          Belum Lunas ({unpaid.length})
        </a>
        <a
          aria-current={status === "paid" ? "page" : undefined}
          className={`cashier-status-tab${status === "paid" ? " cashier-status-tab--active" : ""}`}
          href="/dashboard/kasir/pembayaran?status=paid"
        >
          Sudah Lunas ({paid.length})
        </a>
      </nav>

      <div className="cashier-payment-layout">
        <section aria-label={`Daftar pesanan ${status}`} className="cashier-order-list">
          {orders.length === 0 ? (
            <p className="cashier-empty-state">
              {status === "paid" ? "Belum ada pesanan yang dibayar." : "Tidak ada pesanan menunggu pembayaran."}
            </p>
          ) : orders.map((order: CashierOrderView) => {
            const isSelected = selectedOrder?.id_pesanan === order.id_pesanan;
            const query = `status=${status}&orderId=${encodeURIComponent(order.id_pesanan)}`;

            return (
              <a
                aria-current={isSelected ? "true" : undefined}
                className={`cashier-order-card${isSelected ? " cashier-order-card--selected" : ""}`}
                href={`/dashboard/kasir/pembayaran?${query}`}
                key={order.id_pesanan}
              >
                <span aria-hidden="true" className="cashier-order-card__check">
                  {isSelected ? <svg viewBox="0 0 24 24"><path d="m6 12 4 4 8-8" /></svg> : null}
                </span>
                <span>
                  <strong className="cashier-order-card__id">{order.id_pesanan}</strong>
                  <span className="cashier-order-card__items">{itemSummary(order)}</span>
                  <span className="cashier-order-card__date">
                    {order.tanggal
                      ? new Date(order.tanggal).toLocaleString("id-ID")
                      : "Tanggal tidak tersedia"}
                  </span>
                </span>
                <span className="cashier-order-card__total">
                  <strong>{formatCurrency(order.total ?? 0)}</strong>
                  <span className="cashier-order-card__status">{status === "paid" ? "Lunas" : "Belum lunas"}</span>
                </span>
              </a>
            );
          })}
        </section>

        <aside aria-label="Pesanan dipilih" className="cashier-order-summary">
          {selectedOrder ? (
            <>
              <h2>Pesanan dipilih</h2>
              <div className="cashier-order-summary__id">
                <span>Nomor pesanan</span>
                <strong>{selectedOrder.id_pesanan}</strong>
              </div>
              <div className="cashier-order-summary__items">
                {selectedOrder.detail_pesanan.map((detail) => (
                  <div className="cashier-order-summary__item" key={detail.id_detail}>
                    <span>
                      <strong>{detail.menu?.nama_menu ?? "Menu"}</strong>
                      <br />
                      <span className="cashier-order-card__items">Qty {detail.kuantitas_produk}</span>
                    </span>
                    <strong>{formatCurrency(detail.subtotal ?? 0)}</strong>
                  </div>
                ))}
              </div>
              <div className="cashier-order-summary__total">
                <span>Total pembayaran</span>
                <strong>{formatCurrency(selectedOrder.total ?? 0)}</strong>
              </div>
              <a
                className="cashier-button"
                href={status === "paid"
                  ? `/dashboard/kasir/receipt?orderId=${encodeURIComponent(selectedOrder.id_pesanan)}`
                  : `/dashboard/kasir/detail?orderId=${encodeURIComponent(selectedOrder.id_pesanan)}`}
              >
                {status === "paid" ? "Lihat Bukti Pembayaran" : "Rincian Pesanan"}
              </a>
            </>
          ) : (
            <p className="cashier-empty-state">Pilih pesanan untuk melihat rinciannya.</p>
          )}
        </aside>
      </div>
    </main>
  );
}
