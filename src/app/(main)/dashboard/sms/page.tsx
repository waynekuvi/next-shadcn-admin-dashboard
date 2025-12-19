import { Suspense } from "react";
import { getServerSession } from "@/lib/auth-compat";
import { redirect } from "next/navigation";
import { SMSCampaignsClient } from "./_components/sms-campaigns-client";

export default async function SMSCampaignsPage() {
  const session = await getServerSession();
  const user = session?.user as any;

  if (!user?.organizationId) {
    redirect("/onboarding");
  }

  return (
    <div className="w-full px-6 lg:px-12 pb-12 pt-6">
      <Suspense fallback={<div className="flex h-[200px] items-center justify-center">Loading SMS campaigns...</div>}>
        <SMSCampaignsClient />
      </Suspense>
    </div>
  );
}





