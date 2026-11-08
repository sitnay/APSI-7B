import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/coffee-oz";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#dfe5ff] p-4 md:p-6">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[26px] border border-[#8090ee]/40 bg-[#6d7fe2] shadow-[0_25px_70px_rgba(46,58,146,0.28)]">
        <aside className="flex w-full flex-col bg-[linear-gradient(180deg,#4f5fe1_0%,#3345b6_100%)] p-5 text-white md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white/10 text-xl font-black tracking-[-0.12em] text-white/90">
              kz
            </div>
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.2em] text-white/65">Kopi OZ</p>
              <h1 className="text-2xl font-bold tracking-[-0.06em]">
                {sessionUser.role === "Pemilik"
                  ? "Dashboard Pemilik"
                  : sessionUser.role === "Kasir"
                    ? "Dashboard Kasir"
                    : sessionUser.role === "Barista"
                      ? "Halaman Barista"
                      : "Halaman Supervisor Stok"}
              </h1>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3 md:mt-0">
            <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/80">
              {sessionUser.role}
            </div>
            <form action="/api/logout" method="POST">
              <button
                type="submit"
                className="rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-white/15"
              >
                Keluar
              </button>
            </form>
          </div>
        </aside>

        <div className="flex flex-col gap-5 bg-[linear-gradient(180deg,rgba(111,120,220,0.95),rgba(126,134,232,0.82))] p-4 md:p-6">
          <nav className="flex flex-wrap gap-2 rounded-2xl border border-white/20 bg-white/8 p-2 backdrop-blur-sm">
            {sessionUser.role === "Pemilik" && (
              <a href="/dashboard/owner" className="rounded-xl bg-white/14 px-4 py-2 text-sm font-medium text-white shadow-inner shadow-white/10">
                Laporan Penjualan
              </a>
            )}
            {sessionUser.role === "Kasir" && (
              <a href="/dashboard/kasir" className="rounded-xl bg-white/14 px-4 py-2 text-sm font-medium text-white shadow-inner shadow-white/10">
                Pembayaran
              </a>
            )}
            {sessionUser.role === "Barista" && (
              <a href="/dashboard/barista" className="rounded-xl bg-white/14 px-4 py-2 text-sm font-medium text-white shadow-inner shadow-white/10">
                Operasional
              </a>
            )}
            {sessionUser.role === "Supervisor Stok" && (
              <a href="/dashboard/supervisor" className="rounded-xl bg-white/14 px-4 py-2 text-sm font-medium text-white shadow-inner shadow-white/10">
                Stok
              </a>
            )}
          </nav>

          {children}
        </div>
      </div>
    </div>
  );
}
