"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

type DashboardRole = "Pemilik" | "Kasir";
type NavigationItem = {
  href: string;
  label: string;
  icon: string;
  iconWidth: number;
  iconHeight: number;
};

export function DashboardTopbar({ name }: { name: string }) {
  const pathname = usePathname();
  const title = pathname.startsWith("/dashboard/owner/reports")
    ? "Laporan Penjualan"
    : "Selamat Datang, Owner";

  return (
    <header className="kopi-topbar">
      <h1>{title}</h1>
      <div className="kopi-profile">
        <span className="kopi-profile__avatar">{name.slice(0, 2).toUpperCase()}</span>
        <span>{name}</span>
      </div>
    </header>
  );
}

const navigation = {
  Pemilik: [
    { href: "/dashboard/owner", label: "Dashboard", icon: "/figma-icons/owner-dashboard.svg", iconWidth: 23, iconHeight: 22 },
    { href: "/dashboard/owner/reports", label: "Laporan Penjualan", icon: "/figma-icons/owner-report.svg", iconWidth: 29, iconHeight: 25 },
  ],
  Kasir: [
    { href: "/dashboard/kasir", label: "Dashboard", icon: "/figma-icons/cashier-dashboard.svg", iconWidth: 20, iconHeight: 20 },
    { href: "/dashboard/kasir/pembayaran", label: "Pembayaran", icon: "/figma-icons/cashier-payment.svg", iconWidth: 20, iconHeight: 20 },
    { href: "/dashboard/kasir/receipt", label: "Bukti Pembayaran", icon: "/figma-icons/cashier-receipt.svg", iconWidth: 21, iconHeight: 21 },
  ],
} satisfies Record<DashboardRole, NavigationItem[]>;

export default function DashboardNavigation({ role }: { role: DashboardRole }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigasi utama" className="kopi-sidebar__nav">
      {navigation[role].map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <a
            aria-current={isActive ? "page" : undefined}
            className={`kopi-nav-link${isActive ? " kopi-nav-link--active" : ""}`}
            href={item.href}
            key={item.href}
          >
            <Image alt="" height={item.iconHeight} src={item.icon} width={item.iconWidth} />
            <span>{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
