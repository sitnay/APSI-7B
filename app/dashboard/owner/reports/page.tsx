import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import OwnerTransactionDeleteButton from "@/components/OwnerTransactionDeleteButton";
import OwnerTransactionResultModal from "@/components/OwnerTransactionResultModal";
import {
  formatCurrency,
  getSalesReport,
  getSessionUser,
} from "@/lib/coffee-oz";
import { createCsrfToken } from "@/lib/security";

export const dynamic = "force-dynamic";

type ReportSearchParams = {
  from?: string;
  to?: string;
  editTransactionId?: string;
  result?: string;
  message?: string;
};

function isValidDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function dateToInputValue(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

function formatReportDate(value: Date | null) {
  if (!value) {
    return "Tanggal tidak tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(value);
}

function getReportHref(from: string, to: string) {
  return `?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
}

export default async function OwnerDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<ReportSearchParams>;
}) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/");
  }

  if (sessionUser.role !== "Pemilik") {
    redirect("/");
  }

  const params = (await searchParams) ?? {};
  const fromDate = params.from ?? "";
  const toDate = params.to ?? "";
  const hasRangeParams = params.from !== undefined || params.to !== undefined;
  const hasValidRange =
    isValidDateInput(fromDate) &&
    isValidDateInput(toDate) &&
    fromDate <= toDate;
  const report = hasValidRange ? await getSalesReport(fromDate, toDate) : null;
  const selectedTransaction = params.editTransactionId
    ? report?.transactions.find(
        (transaction) => transaction.id_transaksi === params.editTransactionId,
      ) ?? null
    : null;
  const isEditing = Boolean(params.editTransactionId && selectedTransaction);
  const reportHref = getReportHref(fromDate, toDate);
  const csrfToken = createCsrfToken();

  return (
    <main className={`owner-report-page${isEditing ? " owner-report-page--editing" : ""}`}>
      {isEditing && selectedTransaction ? (
        <div className="owner-report-page__edit-back">
          <Link className="owner-report-back" href={reportHref}>
            <span>Kembali</span>
            <Image
              alt=""
              height={17}
              src="/figma-icons/owner-report-back.svg"
              width={17}
            />
          </Link>
        </div>
      ) : (
        <header className="owner-report-page__heading">
          <div className="owner-report-page__intro">
            <h2>Lihat Laporan Penjualan</h2>
            <p>
              {report
                ? `Tanggal ${formatReportDate(new Date(`${fromDate}T00:00:00.000Z`))} sampai ${formatReportDate(new Date(`${toDate}T00:00:00.000Z`))}`
                : "Pilih Periode Laporan"}
            </p>
          </div>
          {report ? (
            <Link className="owner-report-back" href="/dashboard/owner">
              <span>Kembali</span>
              <Image
                alt=""
                height={17}
                src="/figma-icons/owner-report-back.svg"
                width={17}
              />
            </Link>
          ) : null}
        </header>
      )}

      {hasRangeParams && !hasValidRange ? (
        <p className="owner-report-error" role="alert">
          Periode tanggal tidak valid. Pilih tanggal awal dan akhir yang benar.
        </p>
      ) : null}

      {!report ? (
        <form className="owner-report-filter" method="GET">
          <label className="owner-report-filter__field">
            <span>Tanggal</span>
            <div className="owner-report-date-field">
              <input
                aria-label="Tanggal awal"
                defaultValue={fromDate}
                lang="id"
                name="from"
                required
                type="date"
              />
              <Image
                alt=""
                height={28.5}
                src="/figma-icons/report-date-calendar-start.svg"
                width={31.5}
              />
            </div>
          </label>
          <span className="owner-report-filter__separator">sampai</span>
          <label className="owner-report-filter__field">
            <span aria-hidden="true">&nbsp;</span>
            <div className="owner-report-date-field">
              <input
                aria-label="Tanggal akhir"
                defaultValue={toDate}
                lang="id"
                name="to"
                required
                type="date"
              />
              <Image
                alt=""
                height={28.5}
                src="/figma-icons/report-date-calendar-end.svg"
                width={31.5}
              />
            </div>
          </label>
          <button className="owner-report-filter__submit" type="submit">
            Tampilkan
          </button>
        </form>
      ) : (
        <>
          {params.result === "error" ? (
            <p className="owner-report-error" role="alert">
              {params.message ?? "Perubahan transaksi gagal. Silakan coba lagi."}
            </p>
          ) : null}
          {params.editTransactionId && !selectedTransaction ? (
            <p className="owner-report-error" role="alert">
              Transaksi tidak ditemukan pada periode yang dipilih.
            </p>
          ) : null}

          {isEditing && selectedTransaction ? (
            <section aria-label="Ubah transaksi" className="owner-report-edit">
              <form action="/api/owner/transactions" method="POST">
                <input name="_csrf" type="hidden" value={csrfToken} />
                <input name="action" type="hidden" value="update" />
                <input
                  name="transactionId"
                  type="hidden"
                  value={selectedTransaction.id_transaksi}
                />
                <input name="from" type="hidden" value={fromDate} />
                <input name="to" type="hidden" value={toDate} />

                <div className="owner-report-edit__fields">
                  <label>
                    <span>ID Transaksi</span>
                    <input
                      aria-label="ID Transaksi"
                      readOnly
                      value={selectedTransaction.id_transaksi}
                    />
                  </label>
                  <label>
                    <span>Tanggal Transaksi</span>
                    <input
                      aria-label="Tanggal Transaksi"
                      defaultValue={dateToInputValue(selectedTransaction.tanggal_transaksi)}
                      lang="id"
                      name="transactionDate"
                      required
                      type="date"
                    />
                  </label>
                  <label>
                    <span>Jumlah Transaksi</span>
                    <input
                      aria-label="Jumlah Transaksi"
                      defaultValue={Number(selectedTransaction.total_transaksi ?? 0)}
                      max="99999999"
                      min="1"
                      name="totalTransaksi"
                      required
                      step="1"
                      type="number"
                    />
                  </label>
                </div>

                <div className="owner-report-edit__actions">
                  <Link className="owner-report-edit__cancel" href={reportHref}>
                    Batal
                  </Link>
                  <button className="owner-report-edit__save" type="submit">
                    Simpan
                  </button>
                </div>
              </form>
            </section>
          ) : (
            <section aria-label="Ringkasan pendapatan" className="owner-report-data">
              <article className="owner-report-revenue">
                <span>Total Pendapatan</span>
                <strong>{formatCurrency(report.totalRevenue)}</strong>
              </article>
              <TransactionTable
                csrfToken={csrfToken}
                from={fromDate}
                to={toDate}
                transactions={report.transactions}
              />
            </section>
          )}

          {isEditing && selectedTransaction ? (
            <TransactionTable
              csrfToken={csrfToken}
              from={fromDate}
              to={toDate}
              transactions={report.transactions}
            />
          ) : null}
        </>
      )}

      {report && (params.result === "deleted" || params.result === "updated") ? (
        <OwnerTransactionResultModal
          from={fromDate}
          result={params.result}
          to={toDate}
        />
      ) : null}
    </main>
  );
}

function TransactionTable({
  csrfToken,
  from,
  to,
  transactions,
}: {
  csrfToken: string;
  from: string;
  to: string;
  transactions: Awaited<ReturnType<typeof getSalesReport>>["transactions"];
}) {
  return (
    <div className="owner-report-table-scroll">
      <table className="owner-report-table">
        <thead>
          <tr>
            <th scope="col">ID Transaksi</th>
            <th scope="col">Tanggal Transaksi</th>
            <th scope="col">Jumlah Transaksi</th>
            <th scope="col">Tindakan</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <tr key={transaction.id_transaksi}>
                <td>{transaction.id_transaksi}</td>
                <td>{formatReportDate(transaction.tanggal_transaksi)}</td>
                <td>{formatCurrency(transaction.total_transaksi ?? 0)}</td>
                <td>
                  <div className="owner-report-table__actions">
                    <Link
                      className="owner-report-table__edit"
                      href={`${getReportHref(from, to)}&editTransactionId=${encodeURIComponent(transaction.id_transaksi)}`}
                    >
                      Ubah
                    </Link>
                    <OwnerTransactionDeleteButton
                      csrfToken={csrfToken}
                      from={from}
                      to={to}
                      transactionId={transaction.id_transaksi}
                    />
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="owner-report-table__empty" colSpan={4}>
                Belum terdapat transaksi pada periode yang dipilih.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
