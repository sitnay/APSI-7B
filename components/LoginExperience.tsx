"use client";

import Image from "next/image";
import { useState } from "react";

export type LoginActor = "Pelanggan" | "Kasir" | "Barista" | "Supervisor Stok" | "Pemilik";
export type LoginStage = "splash" | "actors" | "login" | "unavailable";

const actors: readonly LoginActor[] = [
  "Pelanggan",
  "Kasir",
  "Barista",
  "Supervisor Stok",
  "Pemilik",
];

function ActorIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-[37px] w-[44px] shrink-0"
      fill="none"
      viewBox="0 0 44 37"
    >
      <circle cx="15" cy="9" r="6.25" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M2.5 31.5v-2.2c0-5.3 4.3-9.6 9.6-9.6h5.8c5.3 0 9.6 4.3 9.6 9.6v2.2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path d="M34 10v11m-5.5-5.5h11" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

export function LoginExperience({
  initialActor,
  initialError,
  initialStage,
}: {
  initialActor: LoginActor | null;
  initialError: string;
  initialStage: LoginStage;
}) {
  const [stage, setStage] = useState(initialStage);
  const [selectedActor, setSelectedActor] = useState<LoginActor | null>(initialActor);
  const [error, setError] = useState(initialError);

  function chooseActor(actor: LoginActor) {
    setSelectedActor(actor);
    setError("");

    if (actor === "Pelanggan") {
      return;
    }

    setStage(actor === "Kasir" || actor === "Pemilik" ? "login" : "unavailable");
  }

  function returnToActors() {
    setStage("actors");
    setError("");
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#5869b5] font-sans text-white">
      {stage === "splash" ? (
        <>
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              alt="Kopi OZ"
              className="h-auto w-[min(357px,64vw)]"
              height={357}
              priority
              src="/kopi-oz-logo.png"
              width={357}
            />
          </div>
          <button
            className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full border border-white/75 bg-white/10 px-8 py-3 text-sm font-bold tracking-[0.12em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:bottom-10"
            onClick={() => setStage("actors")}
            type="button"
          >
            Selanjutnya
          </button>
        </>
      ) : (
        <>
          <div className="absolute left-0 top-3 z-10 sm:top-5">
            <Image
              alt="Kopi OZ"
              height={94}
              priority
              src="/kopi-oz-logo.png"
              width={94}
            />
          </div>

          <div className="flex min-h-dvh items-center justify-center px-4 pb-8 pt-28 sm:px-6 sm:pt-28 md:py-8">
            <section className="w-full max-w-[852px] rounded-[40px] border border-white/80 bg-[linear-gradient(145deg,rgba(190,201,246,0.34),rgba(211,219,255,0.52))] px-5 pb-8 pt-9 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_18px_48px_rgba(35,47,105,0.12)] backdrop-blur-md sm:px-10 sm:pb-10 sm:pt-11 md:min-h-[607px] md:px-12">
              {stage === "actors" ? (
                <>
                  <h1 className="mb-8 text-center text-[clamp(2rem,5vw,3rem)] font-black leading-tight tracking-[0.01em] text-white [text-shadow:0_3px_3px_rgba(25,34,73,0.28)] sm:mb-10">
                    Login Sebagai
                  </h1>
                  <div className="mx-auto flex w-full max-w-[508px] flex-col gap-4 sm:gap-6">
                    {actors.map((actor) => {
                      const isSelected = selectedActor === actor;

                      return (
                        <button
                          key={actor}
                          aria-pressed={isSelected}
                          className={`relative flex h-[50px] w-full items-center rounded-full border px-3 text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.28)] backdrop-blur-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                            isSelected
                              ? "border-white bg-white/35"
                              : "border-white/75 bg-white/20 hover:bg-white/30"
                          }`}
                          onClick={() => chooseActor(actor)}
                          type="button"
                        >
                          <span className="text-[#11172c]">
                            <ActorIcon />
                          </span>
                          <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-base font-black tracking-[0.01em] [text-shadow:0_2px_2px_rgba(34,42,79,0.3)] sm:text-lg">
                            {actor}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-7 text-center">
                    <button
                      className="rounded-full px-5 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                      onClick={() => {
                        setStage("splash");
                        setSelectedActor(null);
                      }}
                      type="button"
                    >
                      Kembali
                    </button>
                  </div>
                </>
              ) : null}

              {stage === "login" && selectedActor ? (
                <div className="mx-auto w-full max-w-[508px]">
                  <button
                    className="mb-5 rounded-full px-3 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    onClick={returnToActors}
                    type="button"
                  >
                    ← Kembali
                  </button>
                  <h1 className="text-center text-4xl font-black tracking-wide text-white [text-shadow:0_3px_3px_rgba(25,34,73,0.28)]">
                    Login
                  </h1>
                  <h2 className="mb-8 mt-2 text-center text-2xl font-bold text-white">{selectedActor}</h2>
                  <form action="/api/login" className="space-y-5" method="POST">
                    <input name="role" type="hidden" value={selectedActor} />
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-white" htmlFor="username">
                        Username
                      </label>
                      <input
                        autoComplete="username"
                        className="h-[50px] w-full rounded-full border border-white/80 bg-white/20 px-5 text-white outline-none placeholder:text-white/65 focus:border-white focus:bg-white/30"
                        id="username"
                        name="username"
                        placeholder="Masukkan username"
                        required
                        type="text"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-white" htmlFor="password">
                        Password
                      </label>
                      <input
                        autoComplete="current-password"
                        className="h-[50px] w-full rounded-full border border-white/80 bg-white/20 px-5 text-white outline-none placeholder:text-white/65 focus:border-white focus:bg-white/30"
                        id="password"
                        name="password"
                        placeholder="Masukkan password"
                        required
                        type="password"
                      />
                    </div>
                    {error ? (
                      <p
                        aria-live="polite"
                        className="rounded-2xl border border-red-100/70 bg-red-950/20 px-4 py-3 text-sm text-white"
                      >
                        {error}
                      </p>
                    ) : null}
                    <button
                      className="mx-auto flex h-[50px] w-[193px] items-center justify-center rounded-full border border-white/85 bg-white/20 text-base font-bold text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.25)] transition hover:bg-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                      type="submit"
                    >
                      Masuk
                    </button>
                  </form>
                </div>
              ) : null}

              {stage === "unavailable" && selectedActor ? (
                <div className="mx-auto flex min-h-[440px] w-full max-w-[508px] flex-col items-center justify-center text-center">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/80">
                    Informasi
                  </p>
                  <h1 className="mt-3 text-3xl font-black text-white [text-shadow:0_3px_3px_rgba(25,34,73,0.28)]">
                    {selectedActor}
                  </h1>
                  <p aria-live="polite" className="mt-5 max-w-md text-base leading-7 text-white/95">
                    Fitur {selectedActor} belum tersedia dalam implementasi saat ini.
                  </p>
                  {error ? (
                    <p className="mt-4 rounded-2xl border border-red-100/70 bg-red-950/20 px-4 py-3 text-sm text-white">
                      {error}
                    </p>
                  ) : null}
                  <button
                    className="mt-8 rounded-full px-5 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    onClick={returnToActors}
                    type="button"
                  >
                    ← Kembali ke pilihan aktor
                  </button>
                </div>
              ) : null}
            </section>
          </div>
        </>
      )}
    </main>
  );
}
