import { redirect } from "next/navigation";
import Image from "next/image";

import DashboardNavigation, { DashboardTopbar } from "@/components/DashboardNavigation";
import LogoutForm from "@/components/LogoutForm";
import { getSessionUser } from "@/lib/coffee-oz";
import { createCsrfToken } from "@/lib/security";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const sessionUser = await getSessionUser();

  if (!sessionUser || (sessionUser.role !== "Pemilik" && sessionUser.role !== "Kasir")) {
    redirect("/");
  }

  return (
    <div className={`kopi-dashboard kopi-dashboard--${sessionUser.role === "Pemilik" ? "owner" : "cashier"}`}>
      <aside className="kopi-sidebar">
        <a aria-label="Kopi OZ" className="kopi-sidebar__brand" href={sessionUser.role === "Pemilik" ? "/dashboard/owner" : "/dashboard/kasir"}>
          <Image alt="" height={220} src="/kopi-oz-logo.png" width={220} />
        </a>
        <div className="kopi-sidebar__section-label"><span>WORKING SPACE</span></div>
        <DashboardNavigation role={sessionUser.role} />
        <div className="kopi-sidebar__logout">
          <LogoutForm csrfToken={createCsrfToken()} role={sessionUser.role} />
        </div>
      </aside>

      <div className="kopi-dashboard__body">
        {sessionUser.role === "Pemilik" ? (
          <DashboardTopbar name={sessionUser.nama} />
        ) : null}
        <div className="kopi-dashboard__content">{children}</div>
      </div>
    </div>
  );
}
