"use client";

import { useMemo, useState } from "react";

function formatCurrency(value: any) {
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
    label: "QRIS",
    summary: "Scan QR code dari aplikasi pembayaran Anda.",
    description: "Pembayaran QRIS memerlukan konfirmasi manual oleh kasir setelah pelanggan menampilkan QR code. Tidak ada proses otomatis yang dipicu tanpa konfirmasi.",
  },
  {
    value: "Transfer Bank",
    label: "Transfer Bank",
    summary: "Transfer ke rekening resmi toko yang tersedia.",
    description: "Gunakan rekening resmi yang tercatat pada konfigurasi pembayaran toko. Tidak ada nomor rekening palsu yang ditampilkan di sistem.",
  },
  {
    value: "Kartu Debit",
    label: "Kartu Debit",
    summary: "Bayar dengan kartu debit atau EDC.",
    description: "Konfirmasi pembayaran dilakukan oleh kasir setelah transaksi kartu berhasil diproses pada mesin EDC atau terminal pembayaran.",
  },
  {
    value: "Tunai di Kasir",
    label: "Tunai di Kasir",
    summary: "Pembayaran tunai langsung ke kasir.",
    description: "Kasir menerima uang tunai dan memverifikasi jumlah pembayaran sebelum mengonfirmasi transaksi sebagai lunas.",
  },
] as const;

export default function CashierOrderDetail({ order }: { order: any }) {
  const existingPayment = (order.pembayaran ?? [])[0] ?? null;
  const isPaid = existingPayment?.status_pembayaran === "Lunas";
  const [selectedMethod, setSelectedMethod] = useState<string>(existingPayment?.metode ?? "QRIS");

  const details = useMemo(() => order.detail_pesanan ?? [], [order]);
  const totalItems = details.reduce((sum: number, detail: any) => sum + Number(detail.kuantitas_produk ?? 0), 0);
  const totalAmount = Number(order.total_tagihan ?? 0);
  const selectedPayment = paymentOptions.find((option) => option.value === selectedMethod) ?? paymentOptions[0];

  return (
    <main className="space-y-6">
      <section className="rounded-[26px] border border-white/20 bg-white/12 p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[0.72rem] uppercase tracking-[0.2em] text-white/65">Rincian Pesanan</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.07em]">Pembayaran</h2>
          </div>
          <a
            href="/dashboard/kasir"
            className="rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-white/15"
          >
            Kembali ke Daftar
          </a>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[26px] border border-white/15 bg-white/12 p-5 text-white backdrop-blur-sm md:p-6">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.2em] text-white/65">Nomor Pesanan</p>
              <h3 className="mt-2 text-3xl font-bold tracking-[-0.06em]">{order.id_pesanan}</h3>
            </div>
            <div className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.14em] text-white/80">
              {existingPayment?.status_pembayaran ?? order.status_pesanan ?? "Menunggu Pembayaran"}
            </div>
          </div>

          <div className="mt-5 grid gap-4 rounded-2xl border border-white/10 bg-white/6 p-4 md:grid-cols-2">
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/60">Tanggal & Waktu</p>
              <p className="mt-2 font-semibold text-white">{new Date(order.tanggal ?? Date.now()).toLocaleString("id-ID")}</p>
            </div>
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/60">Status</p>
              <p className="mt-2 font-semibold text-white">{isPaid ? "Lunas" : "Menunggu Pembayaran"}</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-xl font-bold text-white">Daftar Menu</h4>
              <span className="rounded-full border border-white/15 bg-white/8 px-2 py-1 text-[0.62rem] uppercase tracking-[0.12em] text-white/75">
                {details.length} item
              </span>
            </div>

            <div className="space-y-3">
              {details.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/30 bg-white/5 p-4 text-sm text-white/75">
                  Tidak ada detail menu pada pesanan ini.
                </div>
              ) : (
                details.map((detail: any) => (
                  <div key={detail.id_detail} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-white">{detail.menu?.nama_menu ?? "Menu"}</p>
                        <p className="mt-1 text-sm text-white/70">Jumlah: {detail.kuantitas_produk ?? 0}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white/70">Harga satuan</p>
                        <p className="font-semibold text-white">{formatCurrency(detail.menu?.harga ?? 0)}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-sm">
                      <span className="text-white/70">Subtotal</span>
                      <span className="font-bold text-white">{formatCurrency(detail.subtotal ?? 0)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <aside className="rounded-[26px] border border-white/15 bg-white/12 p-5 text-white backdrop-blur-sm md:p-6">
          <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
            <p className="text-[0.72rem] uppercase tracking-[0.2em] text-white/65">Panel Tagihan</p>
            <span className="rounded-full border border-white/15 bg-white/8 px-2 py-1 text-[0.62rem] uppercase tracking-[0.12em] text-white/75">
              {isPaid ? "Lunas" : "Belum dibayar"}
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between text-white/75">
              <span>Status Pembayaran</span>
              <strong className={isPaid ? "text-emerald-200" : "text-amber-100"}>{isPaid ? "Lunas" : "Menunggu"}</strong>
            </div>
            <div className="flex items-center justify-between text-white/75">
              <span>Nomor Pesanan</span>
              <strong>{order.id_pesanan}</strong>
            </div>
            <div className="flex items-center justify-between text-white/75">
              <span>Jumlah Item</span>
              <strong>{totalItems}</strong>
            </div>
            <div className="flex items-center justify-between text-white/75">
              <span>Total Tagihan</span>
              <strong>{formatCurrency(totalAmount)}</strong>
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-[0.72rem] uppercase tracking-[0.2em] text-white/65">Pilih Metode Pembayaran</p>
            <div className="space-y-3">
              {paymentOptions.map((payment) => {
                const isSelected = selectedMethod === payment.value;
                return (
                  <button
                    key={payment.value}
                    type="button"
                    onClick={() => !isPaid && setSelectedMethod(payment.value)}
                    disabled={isPaid}
                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                      isSelected
                        ? "border-white/60 bg-white/18 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                        : "border-white/15 bg-white/6 hover:bg-white/10"
                    } ${isPaid ? "cursor-not-allowed opacity-80" : ""}`}
                  >
                    <div>
                      <p className="font-semibold text-white">{payment.label}</p>
                      <span className="mt-1 block text-xs text-white/70">{payment.summary}</span>
                    </div>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border text-[0.6rem] font-bold ${
                        isSelected ? "border-white bg-white text-[#2a3fa8]" : "border-white/50 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/60">Informasi {selectedPayment.label}</p>
            <p className="mt-3 text-sm leading-6 text-white/85">{selectedPayment.description}</p>
          </div>

          <form method="POST" action="/api/payments" className="mt-6 space-y-4">
            <input type="hidden" name="orderId" value={order.id_pesanan} />
            <input type="hidden" name="paymentMethod" value={selectedMethod} />
            <button
              type="submit"
              disabled={isPaid}
              className={`flex h-14 w-full items-center justify-center rounded-2xl text-base font-bold tracking-[0.08em] transition ${
                isPaid
                  ? "cursor-not-allowed bg-slate-200 text-slate-500"
                  : "bg-[#edf3ff] text-[#1d2d67] hover:bg-white"
              }`}
            >
              {isPaid ? "Pembayaran Selesai" : "Konfirmasi Pembayaran"}
            </button>
          </form>

          {isPaid && existingPayment && (
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-emerald-200/40 bg-emerald-50/10 px-4 py-3 text-sm text-emerald-50">
                Pembayaran berhasil dilaksanakan.
              </div>
              <a
                href={`/dashboard/kasir/receipt?orderId=${order.id_pesanan}`}
                className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#edf3ff] text-sm font-bold uppercase tracking-[0.08em] text-[#1d2d67]"
              >
                Lihat Bukti Pembayaran
              </a>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
