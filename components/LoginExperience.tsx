"use client";

import Image from "next/image";
import Link from "next/link";
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

export function LoginExperience({
  csrfToken,
  initialActor,
  initialError,
  initialStage,
}: {
  csrfToken: string;
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
    setStage(actor === "Kasir" || actor === "Pemilik" ? "login" : "unavailable");
  }

  function returnToActors() {
    setStage("actors");
    setError("");
  }

  return (
    <main className="login-experience">
      {stage === "splash" ? (
        <button
          aria-label="Selanjutnya: pilih aktor"
          className="login-splash"
          onClick={() => setStage("actors")}
          type="button"
        >
          <Image
            alt="Kopi OZ"
            className="login-splash__logo"
            height={357}
            priority
            src="/kopi-oz-logo.png"
            width={357}
          />
        </button>
      ) : (
        <>
          <Link aria-label="Kembali ke halaman pembuka" className="login-corner-logo" href="/">
            <Image alt="Kopi OZ" height={94} priority src="/kopi-oz-logo.png" width={94} />
          </Link>

          <div className="login-stage">
            <section aria-labelledby="login-title" className="login-card">
              {stage === "actors" ? (
                <>
                  <h1 className="login-card__title" id="login-title">Login Sebagai</h1>
                  <div className="login-actor-list">
                    {actors.map((actor) => (
                      <button
                        className="login-actor"
                        key={actor}
                        onClick={() => chooseActor(actor)}
                        type="button"
                      >
                        <Image
                          alt=""
                          className="login-actor__icon"
                          height={37}
                          src="/figma-icons/login-actor.svg"
                          width={44}
                        />
                        <span>{actor}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : null}

              {stage === "login" && selectedActor ? (
                <div className="login-form-stage">
                  <button className="login-back" onClick={returnToActors} type="button">
                    ← Kembali
                  </button>
                  <h1 className="login-card__title" id="login-title">Login {selectedActor}</h1>
                  <form action="/api/login" className="login-form" method="POST">
                    <input name="_csrf" type="hidden" value={csrfToken} />
                    <input name="role" type="hidden" value={selectedActor} />
                    <label className="login-field" htmlFor="username">
                      <span>Username</span>
                      <input
                        autoComplete="username"
                        id="username"
                        name="username"
                        placeholder="Masukkan username"
                        required
                        type="text"
                      />
                    </label>
                    <label className="login-field" htmlFor="password">
                      <span>Password</span>
                      <input
                        autoComplete="current-password"
                        id="password"
                        name="password"
                        placeholder="Masukkan password"
                        required
                        type="password"
                      />
                    </label>
                    {error ? <p aria-live="polite" className="login-error">{error}</p> : null}
                    <button className="login-submit" type="submit">Masuk</button>
                  </form>
                </div>
              ) : null}

              {stage === "unavailable" && selectedActor ? (
                <div className="login-unavailable">
                  <p className="login-unavailable__eyebrow">Informasi</p>
                  <h1 className="login-card__title" id="login-title">{selectedActor}</h1>
                  <p aria-live="polite">
                    Fitur {selectedActor} belum tersedia dalam implementasi saat ini.
                  </p>
                  {error ? <p className="login-error">{error}</p> : null}
                  <button className="login-back" onClick={returnToActors} type="button">
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
