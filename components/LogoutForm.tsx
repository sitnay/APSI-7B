"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function LogoutForm({
  csrfToken,
  role,
}: {
  csrfToken: string;
  role: "Pemilik" | "Kasir";
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  return (
    <>
      <button
        className="kopi-nav-link kopi-nav-link--logout"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Image
          alt=""
          height={role === "Pemilik" ? 20 : 18}
          src={`/figma-icons/${role === "Pemilik" ? "owner-logout" : "cashier-logout"}.svg`}
          width={role === "Pemilik" ? 20 : 18}
        />
        <span>Keluar</span>
      </button>
      {isOpen ? (
        <div
          className="logout-dialog-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <section aria-labelledby="logout-dialog-title" aria-modal="true" className="logout-dialog" role="dialog">
            <span aria-hidden="true" className="logout-dialog__icon">
              <Image alt="" height={60} src="/figma-icons/logout-modal-circle.svg" width={60} />
              <Image
                alt=""
                className="logout-dialog__mark"
                height={32}
                src="/figma-icons/logout-modal.svg"
                width={35}
              />
            </span>
            <h2 id="logout-dialog-title">Log Out?</h2>
            <p>Anda Akan Kembali Ke Halaman Log In</p>
            <div className="logout-dialog__actions">
              <button onClick={() => setIsOpen(false)} type="button">Tidak</button>
              <form action="/api/logout" method="POST">
                <input name="_csrf" type="hidden" value={csrfToken} />
                <button type="submit">Ya</button>
              </form>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
