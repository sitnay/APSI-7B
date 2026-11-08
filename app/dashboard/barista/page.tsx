import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/coffee-oz";

export const dynamic = "force-dynamic";

export default async function BaristaDashboardPage() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/");
  }

  if (sessionUser.role !== "Barista") {
    redirect("/");
  }

  return (
    <main className="rounded-[26px] border border-white/20 bg-white/12 p-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-white/70">Fungsi operasional</p>
        <h2 className="mt-3 text-3xl font-bold tracking-[-0.06em]">Halaman Utama Barista</h2>
        <p className="mt-3 text-white/80">
          Login aktif untuk akun Barista telah berhasil. Fitur utama yang dibutuhkan untuk role ini telah disiapkan dan session tersimpan dengan aman.
        </p>
        <div className="mt-6 rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-sm text-white/85">
          Pengguna aktif: {sessionUser.nama} ({sessionUser.username})
        </div>
      </div>
    </main>
  );
}
