'use client';

export default function ReceiptPrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden rounded-xl bg-[#27398f] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-sm transition hover:bg-[#20337c]"
    >
      Cetak
    </button>
  );
}
