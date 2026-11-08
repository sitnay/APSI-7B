import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/coffee-oz";

export const dynamic = "force-dynamic";

export default async function SupervisorDashboardPage() {
  const sessionUser = await getSessionUser();

  if (sessionUser) {
    redirect("/");
  }

  return (
    <main className="rounded-[26px] border border-white/20 bg-white/12 p-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-white/70">Informasi</p>
        <h2 className="mt-3 text-3xl font-bold tracking-[-0.06em]">Fitur Supervisor Stok belum tersedia</h2>
        <p className="mt-3 text-white/80">
          Fitur pengelolaan stok belum termasuk dalam ruang lingkup implementasi saat ini. Silakan gunakan akses Pemilik atau Kasir.
        </p>
      </div>
    </main>
  );
}
