import { redirect } from "next/navigation";

import CashierOrderDetail from "@/components/CashierOrderDetail";
import { getOrderDetail, getSessionUser } from "@/lib/coffee-oz";

export const dynamic = "force-dynamic";

export default async function KasirOrderDetailPage({
  searchParams,
}: {
  searchParams?: Promise<{ orderId?: string }>;
}) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/");
  }

  if (sessionUser.role !== "Kasir") {
    redirect("/");
  }

  const params = (await searchParams) ?? {};
  const orderId = params.orderId ?? "";

  if (!orderId) {
    redirect("/dashboard/kasir");
  }

  const order = await getOrderDetail(orderId);

  if (!order) {
    return (
      <main className="rounded-[26px] border border-white/20 bg-white/12 p-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm">
        <div className="rounded-2xl border border-dashed border-white/40 bg-white/8 p-6 text-center text-white/80">
          Pesanan yang dipilih tidak ditemukan.
        </div>
      </main>
    );
  }

  return <CashierOrderDetail order={order} />;
}
