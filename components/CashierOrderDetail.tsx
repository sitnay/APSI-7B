"use client";

import Image from "next/image";
import { useState } from "react";

type OrderLine = {
  id_detail: string;
  kuantitas_produk: number | null;
  subtotal: number | string | null;
  menu: { nama_menu: string | null; harga: number | string | null } | null;
};

type OrderPayment = {
  status_pembayaran: string | null;
  metode: string | null;
};

type CashierOrder = {
  id_pesanan: string;
  status_pesanan: string | null;
  tanggal: Date | string | null;
  total_tagihan: number | string | null;
  detail_pesanan: OrderLine[];
  pembayaran: OrderPayment[];
};

function formatCurrency(value: number | string | null | undefined) {
  const numericValue = typeof value === "number" ? value : Number.parseFloat(String(value ?? "0"));
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numericValue) ? numericValue : 0);
}

const paymentOptions = [
  {
    value: "QRIS",
    summary: "Pembayaran QRIS dikonfirmasi manual oleh kasir.",
    icon: "/figma-icons/payment-qris-symbol.svg",
    iconWidth: 19.75,
    iconHeight: 19.75,
  },
  {
    value: "Transfer Bank",
    summary: "Transfer ke rekening resmi toko yang sudah dikonfigurasi.",
    icon: "/figma-icons/payment-transfer-symbol.svg",
    iconWidth: 19.7502,
    iconHeight: 17.75,
  },
  {
    value: "Kartu Debit",
    summary: "Pembayaran kartu diproses melalui mesin EDC.",
    icon: "/figma-icons/payment-debit-symbol.svg",
    iconWidth: 21.75,
    iconHeight: 15.75,
  },
  {
    value: "Tunai di Kasir",
    summary: "Pembayaran tunai langsung kepada kasir.",
    icon: "/figma-icons/payment-cash-symbol.svg",
    iconWidth: 21.75,
    iconHeight: 13.75,
  },
] as const;

export default function CashierOrderDetail({ csrfToken, order }: { csrfToken: string; order: CashierOrder }) {
  const existingPayment = order.pembayaran[0] ?? null;
  const isPaid = existingPayment?.status_pembayaran === "Lunas";
  const [selectedMethod, setSelectedMethod] = useState(existingPayment?.metode ?? "QRIS");
  const selectedPayment = paymentOptions.find((option) => option.value === selectedMethod) ?? paymentOptions[0];
  const totalItems = order.detail_pesanan.reduce((sum, detail) => sum + Number(detail.kuantitas_produk ?? 0), 0);
  const totalAmount = Number(order.total_tagihan ?? 0);
  const subtotal = order.detail_pesanan.reduce((sum, detail) => sum + Number(detail.subtotal ?? 0), 0);

  return (
    <main className="cashier-detail-page">
      <header className="cashier-page-heading">
        <div>
          <h1>Rincian Pesanan</h1>
          <p>Cek kembali pesananmu, lalu pilih metode pembayaran.</p>
        </div>
        <a className="cashier-status-tab" href="/dashboard/kasir/pembayaran">Kembali ke daftar</a>
      </header>

      <div className="cashier-detail-grid">
        <div>
          <section aria-labelledby="cashier-detail-title" className="cashier-detail-panel">
            <div className="cashier-detail-panel__heading">
              <div>
                <h2 id="cashier-detail-title">{order.id_pesanan}</h2>
                <p>{order.tanggal
                  ? new Date(order.tanggal).toLocaleString("id-ID")
                  : "Tanggal tidak tersedia"}</p>
              </div>
              <span className="cashier-detail-status">{isPaid ? "Lunas" : "Belum lunas"}</span>
            </div>

            <h3 className="cashier-detail-section-title">Rincian pesanan</h3>
            {order.detail_pesanan.length === 0 ? (
              <p className="cashier-empty-state">Tidak ada detail menu pada pesanan ini.</p>
            ) : (
              <div>
                {order.detail_pesanan.map((detail) => (
                  <div className="cashier-detail-line" key={detail.id_detail}>
                    <span>
                      <strong>{detail.menu?.nama_menu ?? "Menu"}</strong>
                      <br />
                      <span className="cashier-detail-muted">
                        {formatCurrency(detail.menu?.harga ?? 0)} × {detail.kuantitas_produk}
                      </span>
                    </span>
                    <strong>{formatCurrency(detail.subtotal ?? 0)}</strong>
                  </div>
                ))}
                <div className="cashier-detail-line">
                  <span>Subtotal</span>
                  <strong>{formatCurrency(subtotal)}</strong>
                </div>
              </div>
            )}
          </section>

          <section aria-labelledby="cashier-method-title" className="cashier-method-section">
            <h2 id="cashier-method-title">Pilih metode pembayaran</h2>
            <div className="cashier-payment-methods">
              {paymentOptions.map((payment) => (
                <button
                  aria-pressed={selectedMethod === payment.value}
                  className="cashier-payment-method"
                  disabled={isPaid}
                  key={payment.value}
                  onClick={() => setSelectedMethod(payment.value)}
                  type="button"
                >
                  <span className="cashier-payment-method__icon" aria-hidden="true">
                    <Image alt="" height={48} src="/figma-icons/payment-method-circle.svg" width={48} />
                    <Image
                      alt=""
                      className="cashier-payment-method__symbol"
                      height={payment.iconHeight}
                      src={payment.icon}
                      width={payment.iconWidth}
                    />
                  </span>
                  <span>
                    <strong>{payment.value}</strong>
                    <small>{payment.summary}</small>
                  </span>
                  <span aria-hidden="true" className="cashier-payment-method__radio" />
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside aria-label="Tagihan pesanan" className="cashier-detail-panel cashier-detail-panel--white">
          <div className="cashier-bill-heading">
            <h2>Tagihan</h2>
            <span>{isPaid ? "Lunas" : "Belum lunas"}</span>
          </div>
          <div className="cashier-bill-info">
            <div><span>No. pesanan</span><strong>{order.id_pesanan}</strong></div>
            <div><span>Jumlah item</span><strong>{totalItems} item</strong></div>
            <div><span>Metode dipilih</span><strong>{selectedPayment.value}</strong></div>
          </div>
          <div className="cashier-bill-order-number">
            <span>Nomor pesanan</span>
            <strong>{order.id_pesanan}</strong>
          </div>
          <div className="cashier-bill-total">
            <span>Total pembayaran</span>
            <strong>{formatCurrency(totalAmount)}</strong>
          </div>

          {isPaid ? (
            <a
              className="cashier-button"
              href={`/dashboard/kasir/receipt?orderId=${encodeURIComponent(order.id_pesanan)}`}
            >
              Cetak Bukti Pembayaran
            </a>
          ) : (
            <>
              <p className="cashier-bill-note">
                {selectedPayment.summary} Tidak ada detail rekening atau kode pembayaran yang belum dikonfirmasi.
              </p>
              <form action="/api/payments" className="cashier-payment-confirm" method="POST">
                <input name="_csrf" type="hidden" value={csrfToken} />
                <input name="orderId" type="hidden" value={order.id_pesanan} />
                <input name="paymentMethod" type="hidden" value={selectedMethod} />
                <button className="cashier-button" type="submit">Konfirmasi Pembayaran</button>
              </form>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
