const sidebarItems = [
  { label: "Dashboard", active: false },
  { label: "Pemesanan", active: false },
  { label: "Pembayaran", active: true },
  { label: "Status Pesanan", active: false },
  { label: "Bukti Pembayaran", active: false },
];

const paymentOptions = [
  {
    id: "qris",
    name: "QRIS",
    subtitle: "Scan dengan e-wallet / m-banking",
    selected: true,
    icon: "qris",
  },
  {
    id: "transfer",
    name: "Transfer Bank",
    subtitle: "Virtual account BCA, BRI, Mandiri",
    selected: false,
    icon: "bank",
  },
  {
    id: "debit",
    name: "Kartu Debit",
    subtitle: "Gesek atau tap di mesin EDC",
    selected: false,
    icon: "card",
  },
  {
    id: "cash",
    name: "Tunai ke Kasir",
    subtitle: "Bayar langsung saat mengambil pesanan",
    selected: false,
    icon: "cash",
  },
];

const orderItems = [
  { name: "Kopi Susu OZ Large", detail: "Topping Oreo - xl", price: "Rp 18.000", quantity: 1 },
  { name: "ChocoLate Oz", detail: "Topping Boba - x1", price: "Rp 13.000", quantity: 1 },
  { name: "Americano", detail: "Tampa topping - x2", price: "Rp 16.000", quantity: 2 },
];

function PaymentIcon({ type }: { type: string }) {
  const common = "relative h-8 w-8 rounded-full border border-[#6d7ae9]/80 bg-white/80";

  if (type === "qris") {
    return (
      <div className={`${common} flex items-center justify-center`}>
        <div className="grid grid-cols-3 gap-[2px] rounded-[4px] bg-[#1b2349] p-[3px]">
          {Array.from({ length: 9 }).map((_, index) => (
            <span
              key={index}
              className={`h-[4px] w-[4px] rounded-[1px] ${index % 2 === 0 ? "bg-[#1b2349]" : "bg-white"}`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (type === "bank") {
    return (
      <div className={`${common} flex items-center justify-center`}>
        <div className="flex h-5 w-5 items-center justify-center rounded-[4px] border border-[#1c2a6b] bg-[#eef2ff]">
          <div className="h-2.5 w-2.5 rounded-sm border border-[#1c2a6b]" />
        </div>
      </div>
    );
  }

  if (type === "card") {
    return (
      <div className={`${common} flex items-center justify-center`}>
        <div className="h-4 w-5 rounded-[4px] border border-[#1c2a6b] bg-[#eef2ff]" />
      </div>
    );
  }

  return (
    <div className={`${common} flex items-center justify-center`}>
      <div className="h-5 w-5 rounded-full border-[2px] border-[#1c2a6b]" />
    </div>
  );
}

export default function PembayaranPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#b9c1ff] p-4 md:p-8">
      <div className="flex w-full max-w-[1440px] overflow-hidden rounded-[18px] border border-[#7d8fe9]/60 bg-[#6d7fe2] shadow-[0_30px_80px_rgba(53,63,133,0.35)]">
        <aside className="hidden w-[200px] flex-col justify-between bg-[linear-gradient(180deg,#4b5ad8_0%,#3d4db4_100%)] px-5 py-6 text-white md:flex">
          <div>
            <div className="mb-8 ml-1 mt-1 flex items-center justify-center text-[2.5rem] font-serif leading-none tracking-[-0.12em] text-white/90">
              <span className="block -rotate-90">ko</span>
              <span className="block -rotate-90">pi</span>
              <span className="block -rotate-90">oz</span>
            </div>

            <div className="space-y-2 text-[0.72rem] uppercase tracking-[0.18em] text-white/80">
              <div className="pt-3 text-[0.64rem] font-medium text-white/60">WORKING SPACE</div>
              {sidebarItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    item.active
                      ? "bg-white/15 text-white shadow-inner shadow-white/10"
                      : "text-white/75 hover:bg-white/10"
                  }`}
                >
                  <span className="h-4 w-4 rounded-[4px] border border-white/60 bg-white/10" />
                  <span className="text-[0.74rem] tracking-[0.08em]">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-left text-[0.7rem] uppercase tracking-[0.12em] text-white/80"
          >
            <span className="inline-block h-3.5 w-3.5 rounded-full border border-white/70" />
            Keluar
          </button>
        </aside>

        <section className="flex-1 bg-[linear-gradient(180deg,rgba(97,109,214,0.92),rgba(112,120,217,0.82))] px-5 py-5 md:px-8 md:py-7">
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-[720px] flex-1">
              <h1 className="text-4xl font-bold tracking-[-0.06em] text-white md:text-[3rem]">
                Pembayaran
              </h1>
              <p className="mt-3 max-w-[650px] text-[0.98rem] text-white/85 md:text-[1.05rem]">
                Pilih metode pembayaran yang paling nyaman, lalu selesaikan pesanan.
              </p>
            </div>

            <div className="hidden w-[320px] rounded-[24px] bg-white/18 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-sm md:block">
              <div className="flex items-center justify-between text-white">
                <h2 className="text-[1.9rem] font-bold tracking-[-0.05em]">Ringkasan</h2>
                <span className="rounded-full bg-white/15 px-3 py-1 text-[0.7rem] font-medium tracking-[0.08em] text-white/90">
                  4 item
                </span>
              </div>

              <div className="mt-5 space-y-4 border-b border-white/10 pb-4">
                {orderItems.map((item) => (
                  <div key={item.name} className="flex items-start justify-between gap-4 text-white/90">
                    <div className="min-w-0">
                      <p className="truncate text-[1.05rem] font-medium text-white">{item.name}</p>
                      <p className="text-[0.75rem] text-white/75">{item.detail}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[1rem] font-medium text-white">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-3 text-white/85">
                <div className="flex items-center justify-between text-[0.95rem]">
                  <span>Metode dipilih</span>
                  <span className="font-semibold text-white">QRIS</span>
                </div>
                <div className="flex items-center justify-between text-[0.95rem]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">Rp 47.000</span>
                </div>
                <div className="flex items-center justify-between text-[0.95rem]">
                  <span>Biaya layanan</span>
                  <span className="font-semibold text-white">Rp 0</span>
                </div>
                <div className="mt-4 flex items-center justify-between pt-3 text-[1.7rem] font-bold tracking-[-0.04em] text-white">
                  <span>Total pembayaran</span>
                  <span>Rp 47.000</span>
                </div>
              </div>

              <button
                type="button"
                className="mt-6 flex h-14 w-full items-center justify-center rounded-[16px] bg-[#e8f0ff] text-[1.05rem] font-bold tracking-[0.04em] text-[#1f2956] transition hover:bg-white"
              >
                Cetak Bukti Pembayaran
              </button>
            </div>
          </div>

          <div className="mt-10 max-w-[810px] rounded-[26px] border border-white/20 bg-white/12 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm md:p-6">
            <h2 className="text-[1.15rem] font-bold text-white md:text-[1.55rem]">Metode pembayaran</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {paymentOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`flex min-h-[120px] items-center gap-4 rounded-[22px] border px-4 py-4 text-left transition md:px-5 ${
                    option.selected
                      ? "border-white/70 bg-white/90 text-[#1b2349] shadow-[0_10px_30px_rgba(20,29,85,0.12)]"
                      : "border-white/20 bg-white/10 text-white/90"
                  }`}
                >
                  <div className="flex-shrink-0">
                    <PaymentIcon type={option.icon} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[1.05rem] font-semibold md:text-[1.2rem]">{option.name}</p>
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full border ${
                          option.selected
                            ? "border-[#1b2349] bg-[#1b2349]"
                            : "border-white/70 bg-transparent"
                        }`}
                      >
                        {option.selected && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                      </span>
                    </div>
                    <p
                      className={`mt-1 text-[0.75rem] md:text-[0.83rem] ${
                        option.selected ? "text-[#1b2349]/70" : "text-white/80"
                      }`}
                    >
                      {option.subtitle}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-[22px] border border-white/20 bg-white/10 p-4 md:p-5">
              <h3 className="text-[1.25rem] font-bold text-white">Cara bayar dengan QRIS</h3>

              <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-start">
                <div className="flex h-[150px] w-[150px] items-center justify-center rounded-[16px] border border-[#dfe5ff] bg-white p-3 shadow-[inset_0_0_0_1px_rgba(18,30,70,0.05)]">
                  <div className="grid h-full w-full grid-cols-6 gap-[2px] rounded-[8px] bg-[#111827] p-2">
                    {Array.from({ length: 36 }).map((_, index) => {
                      const row = Math.floor(index / 6);
                      const col = index % 6;
                      const filled =
                        (row === 0 && col >= 1 && col <= 4) ||
                        (row === 1 && (col === 0 || col === 5)) ||
                        (row === 2 && (col === 1 || col === 4)) ||
                        (row === 3 && (col === 0 || col === 1 || col === 4 || col === 5)) ||
                        (row === 4 && (col === 0 || col === 5)) ||
                        (row === 5 && (col === 1 || col === 2 || col === 4 || col === 5));

                      return (
                        <span
                          key={index}
                          className={`rounded-[2px] ${filled ? "bg-[#111827]" : "bg-white"}`}
                        />
                      );
                    })}
                  </div>
                </div>

                <ol className="list-decimal space-y-2 pl-5 text-sm text-white/85 md:text-[0.95rem]">
                  <li>Buka aplikasi e-wallet atau mobile banking.</li>
                  <li>Pilih menu Scan atau bayar via QRIS.</li>
                  <li>Arahkan kamera ke kode QR di samping.</li>
                  <li>Pastikan nominal Rp 47.000, lalu konfirmasi.</li>
                </ol>

                <button
                  type="button"
                  className="mt-2 inline-flex h-11 items-center justify-center rounded-xl border border-white/60 bg-white/10 px-5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-white/20"
                >
                  Berlaku 10 menit
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
