import { redirect } from "next/navigation";

import { getRoleLandingPage, getSessionUser } from "@/lib/coffee-oz";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const sessionUser = await getSessionUser();

  if (sessionUser) {
    redirect(getRoleLandingPage(sessionUser.role));
  }

  const params = (await searchParams) ?? {};

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#c8d2ff_0%,#b9c1ff_35%,#7d8de3_100%)] p-4 md:p-8">
      <div className="w-full max-w-5xl overflow-hidden rounded-[28px] border border-[#7f8df0]/40 bg-[#5c70de] shadow-[0_35px_90px_rgba(38,48,126,0.35)] md:grid md:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-between bg-[linear-gradient(180deg,#4e61d9_0%,#3548b5_100%)] p-6 text-white md:p-10">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/30 bg-white/10 text-2xl font-black tracking-[-0.15em] text-white/85">
                kz
              </div>
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.25em] text-white/60">System access</p>
                <h1 className="text-4xl font-black tracking-[-0.08em]">Kopi OZ</h1>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[0.7rem] uppercase tracking-[0.2em] text-white/70">Sistem pelayanan kopi</p>
              <h2 className="max-w-md text-3xl font-bold tracking-[-0.06em] md:text-5xl">
                Selamat datang di pusat operasional kopi.
              </h2>
            </div>
          </div>

          <div className="mt-8 rounded-[22px] border border-white/15 bg-white/8 p-5 text-white/85 backdrop-blur-sm">
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-white/65">Akun internal</p>
            <ul className="mt-4 space-y-2 text-sm md:text-base">
              <li>• Pemilik: rhadya / pemilik123</li>
              <li>• Kasir: rahma / kasir123</li>
              <li>• Barista: barista / barista123</li>
              <li>• Supervisor Stok: supervisor / stok123</li>
            </ul>
          </div>
        </section>

        <section className="flex items-center justify-center bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.08))] p-6 md:p-10">
          <div className="w-full max-w-md rounded-[26px] border border-white/15 bg-white/10 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.20)] backdrop-blur-sm">
            <div className="mb-6">
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-white/70">Login</p>
              <h3 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-white">Masuk ke akun</h3>
            </div>

            <form action="/api/login" method="POST" className="space-y-5">
              <div>
                <label htmlFor="username" className="mb-2 block text-sm font-medium text-white/80">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="Masukkan username"
                  className="w-full rounded-2xl border border-white/15 bg-white/90 px-4 py-3 text-[#16214f] outline-none ring-0 placeholder:text-slate-400 focus:border-[#dfe5ff]"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-white/80">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Masukkan password"
                  className="w-full rounded-2xl border border-white/15 bg-white/90 px-4 py-3 text-[#16214f] outline-none ring-0 placeholder:text-slate-400 focus:border-[#dfe5ff]"
                />
              </div>

              {params.error && (
                <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {params.error}
                </div>
              )}

              <button
                type="submit"
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#edf3ff] text-base font-bold tracking-[0.08em] text-[#1d2d67] transition hover:bg-white"
              >
                Masuk
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
