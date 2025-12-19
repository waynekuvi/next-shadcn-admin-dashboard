import { Suspense } from "react";
import { getServerSession } from "@/lib/auth-compat";
import { redirect } from "next/navigation";
import { AutomationsClient } from "./_components/automations-client";

export default async function AutomationsPage() {
  const session = await getServerSession();
  const user = session?.user as any;

  if (!user?.organizationId) {
    redirect("/onboarding");
  }

  return (
    <div className="w-full px-6 lg:px-12 pb-12 pt-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Automations</h1>
        <p className="text-muted-foreground mt-2">
          Create and manage automated workflows to streamline your operations.
        </p>
      </div>
      <Suspense fallback={<div className="flex h-[400px] items-center justify-center">Loading automations...</div>}>
        <AutomationsClient />
      </Suspense>
    </div>
  );
}





