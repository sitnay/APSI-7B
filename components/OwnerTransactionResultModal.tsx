"use client";

import Image from "next/image";
import Link from "next/link";

export default function OwnerTransactionResultModal({
  from,
  result,
  to,
}: {
  from: string;
  result: "deleted" | "updated";
  to: string;
}) {
  const returnHref = `/dashboard/owner/reports?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;

  return (
    <div className="owner-report-modal-backdrop">
      <section
        aria-labelledby="owner-transaction-result"
        aria-modal="true"
        className="owner-report-modal owner-report-modal--result"
        role="dialog"
      >
        <div className="owner-report-modal__icon">
          <Image
            alt=""
            height={60}
            src="/figma-icons/report-result-circle.svg"
            width={60}
          />
          <span aria-hidden="true" className="owner-report-modal__check-frame">
            <Image
              alt=""
              className="owner-report-modal__check"
              height={23}
              src="/figma-icons/report-result-check.svg"
              width={27}
            />
          </span>
        </div>
        <h2 id="owner-transaction-result">
          {result === "deleted" ? "Data Berhasil Dihapus" : "Data Berhasil Diubah"}
        </h2>
        <Link className="owner-report-modal__return" href={returnHref}>
          Klik Untuk Kembali
        </Link>
      </section>
    </div>
  );
}
