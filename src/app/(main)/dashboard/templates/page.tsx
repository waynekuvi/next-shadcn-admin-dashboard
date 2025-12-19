import { Suspense } from "react";
import { getServerSession } from "@/lib/auth-compat";
import { redirect } from "next/navigation";
import { TemplatesClient } from "./_components/templates-client";

export default async function TemplatesPage() {
  const session = await getServerSession();
  const user = session?.user as any;

  if (!user?.organizationId) {
    redirect("/onboarding");
  }

  return (
    <div className="w-full px-6 lg:px-12 pb-12 pt-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
        <p className="text-muted-foreground mt-2">
          Create and manage message templates for SMS, email, and chatbot responses.
        </p>
      </div>
      <Suspense fallback={<div className="flex h-[400px] items-center justify-center">Loading templates...</div>}>
        <TemplatesClient />
      </Suspense>
    </div>
  );
}





