"use client";

import Image from "next/image";
import { useState } from "react";

export default function OwnerTransactionDeleteButton({
  csrfToken,
  from,
  to,
  transactionId,
}: {
  csrfToken: string;
  from: string;
  to: string;
  transactionId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="owner-report-table__delete"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        Hapus
      </button>
      {isOpen ? (
        <div
          className="owner-report-modal-backdrop"
          onClick={() => setIsOpen(false)}
        >
          <section
            aria-labelledby={`delete-transaction-${transactionId}`}
            aria-modal="true"
            className="owner-report-modal owner-report-modal--confirm"
            onClick={(event) => event.stopPropagation()}
            role="alertdialog"
          >
            <div className="owner-report-modal__icon">
              <Image
                alt=""
                height={60}
                src="/figma-icons/report-delete-confirm-circle.svg"
                width={60}
              />
              <span aria-hidden="true">?</span>
            </div>
            <h2 id={`delete-transaction-${transactionId}`}>
              Anda Ingin Menghapus Data?
            </h2>
            <form action="/api/owner/transactions" method="POST">
              <input name="_csrf" type="hidden" value={csrfToken} />
              <input name="action" type="hidden" value="delete" />
              <input name="transactionId" type="hidden" value={transactionId} />
              <input name="from" type="hidden" value={from} />
              <input name="to" type="hidden" value={to} />
              <div className="owner-report-modal__actions">
                <button
                  className="owner-report-modal__cancel"
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  Tidak
                </button>
                <button className="owner-report-modal__confirm" type="submit">
                  Ya
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
