import { redirect } from "next/navigation";

import ReceiptPrintButton from "@/components/ReceiptPrintButton";
import {
  formatCurrency,
  getCashierOrders,
  getOrderDetail,
  getSessionUser,
  getTransactionRecord,
} from "@/lib/coffee-oz";

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

  if (!orderId && !transactionId) {
    const { paid } = await getCashierOrders();

    return (
      <main className="cashier-receipt-page">
        <h1>Bukti Pembayaran</h1>
        {paid.length === 0 ? (
          <p className="cashier-empty-state">Belum ada transaksi yang bisa dicetak.</p>
        ) : (
          <section aria-label="Pesanan lunas" className="cashier-receipt-list">
            {paid.map((order) => (
              <a
                className="cashier-receipt-list__row"
                href={`/dashboard/kasir/receipt?orderId=${encodeURIComponent(order.id_pesanan)}`}
                key={order.id_pesanan}
              >
                <span>
                  <strong>{order.id_pesanan}</strong>
                  <br />
                  <span>{order.tanggal
                    ? new Date(order.tanggal).toLocaleString("id-ID")
                    : "Tanggal tidak tersedia"}</span>
                </span>
                <strong>{formatCurrency(order.total ?? 0)}</strong>
              </a>
            ))}
          </section>
        )}
      </main>
    );
  }

  const order = orderId ? await getOrderDetail(orderId) : null;
  const transaction = transactionId ? await getTransactionRecord(transactionId) : null;
  const selectedRecord = order && order.pembayaran?.[0]?.status_pembayaran === "Lunas"
    ? { order, payment: order.pembayaran[0], transactionId: transactionId || "" }
    : transaction && transaction.pembayaran?.status_pembayaran === "Lunas"
      ? { order: transaction.pembayaran.pesanan, payment: transaction.pembayaran, transactionId: transaction.id_transaksi }
      : null;

  const receiptOrder = selectedRecord?.order ?? null;

  if (!selectedRecord || !receiptOrder) {
    return (
      <main className="cashier-receipt-page">
        <h1>Bukti Pembayaran</h1>
        <p className="cashier-empty-state">Transaksi lunas tidak ditemukan.</p>
      </main>
    );
  }

  const total = Number(receiptOrder.total_tagihan ?? selectedRecord.payment.jumlah_bayar ?? 0);
  const subtotal = receiptOrder.detail_pesanan.reduce(
    (sum, detail) => sum + Number(detail.subtotal ?? 0),
    0,
  );

  return (
    <main className="cashier-receipt-page">
      <h1>Bukti Pembayaran</h1>
      <article className="cashier-receipt">
        <section className="cashier-receipt__success">
          <span aria-hidden="true" className="cashier-receipt__success-mark">
            <svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7" /></svg>
          </span>
          <strong>Pembayaran Berhasil!</strong>
          <span className="cashier-receipt__label">Total pembayaran</span>
          <p className="cashier-receipt__total">{formatCurrency(total)}</p>
          <span className="cashier-receipt__paid-status">Sudah Lunas</span>
          <div className="cashier-receipt__details">
            <div><span>No. pesanan</span><strong>{receiptOrder.id_pesanan}</strong></div>
            <div><span>No. transaksi</span><strong>{selectedRecord.transactionId || selectedRecord.payment.id_pembayaran}</strong></div>
            <div><span>Tanggal</span><strong>{receiptOrder.tanggal
              ? new Date(receiptOrder.tanggal).toLocaleDateString("id-ID")
              : "Tanggal tidak tersedia"}</strong></div>
            <div><span>Waktu</span><strong>{receiptOrder.tanggal
              ? new Date(receiptOrder.tanggal).toLocaleTimeString("id-ID")
              : "Waktu tidak tersedia"}</strong></div>
            <div><span>Metode pembayaran</span><strong>{selectedRecord.payment.metode ?? "-"}</strong></div>
            <div><span>Status pembayaran</span><strong>{selectedRecord.payment.status_pembayaran}</strong></div>
          </div>
        </section>

        <section className="cashier-receipt__summary">
          <h2>Rincian pesanan</h2>
          <div className="cashier-receipt__items">
            {receiptOrder.detail_pesanan.map((detail) => (
              <div className="cashier-receipt__item" key={detail.id_detail}>
                <span>
                  <strong>{detail.menu?.nama_menu ?? "Menu"}</strong>
                  <br />
                  <span>Qty {detail.kuantitas_produk}</span>
                </span>
                <strong>{formatCurrency(detail.subtotal ?? 0)}</strong>
              </div>
            ))}
          </div>
          <div className="cashier-receipt__item">
            <span>Subtotal</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>
          <div className="cashier-receipt__item cashier-receipt__grand-total">
            <strong>Total dibayar</strong>
            <strong>{formatCurrency(total)}</strong>
          </div>
          <div className="cashier-receipt__actions print:hidden">
            <ReceiptPrintButton />
            <a className="cashier-button cashier-button--light" href="/dashboard/kasir/receipt">
              Kembali ke daftar bukti
            </a>
          </div>
        </section>
      </article>
    </main>
  );
}
