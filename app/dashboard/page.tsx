import { redirect } from "next/navigation";

import { getRoleLandingPage, getSessionUser } from "@/lib/coffee-oz";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/");
  }

  redirect(getRoleLandingPage(sessionUser.role));
}
