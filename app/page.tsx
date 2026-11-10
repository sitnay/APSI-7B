import { redirect } from "next/navigation";

import { LoginExperience, type LoginStage, type LoginActor } from "@/components/LoginExperience";
import { getRoleLandingPage, getSessionUser } from "@/lib/coffee-oz";
import { createCsrfToken } from "@/lib/security";

export const dynamic = "force-dynamic";

const actors: readonly LoginActor[] = [
  "Pelanggan",
  "Kasir",
  "Barista",
  "Supervisor Stok",
  "Pemilik",
];

function isLoginActor(value: string | undefined): value is LoginActor {
  return actors.some((actor) => actor === value);
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ actor?: string; error?: string }>;
}) {
  const sessionUser = await getSessionUser();

  if (sessionUser) {
    redirect(getRoleLandingPage(sessionUser.role));
  }

  const params = (await searchParams) ?? {};
  const selectedActor = isLoginActor(params.actor) ? params.actor : null;
  const initialStage: LoginStage =
    params.error && selectedActor
      ? selectedActor === "Kasir" || selectedActor === "Pemilik"
        ? "login"
        : "unavailable"
      : "splash";
  const csrfToken = createCsrfToken();

  return (
    <LoginExperience
      csrfToken={csrfToken}
      initialActor={selectedActor}
      initialError={params.error ?? ""}
      initialStage={initialStage}
    />
  );
}
