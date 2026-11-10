'use client';

export default function ReceiptPrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="cashier-button print:hidden"
    >
      Cetak Bukti Pembayaran
    </button>
  );
}
