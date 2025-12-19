import { Suspense } from "react";
import { getServerSession } from "@/lib/auth-compat";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { IntegrationsClient } from "./_components/integrations-client";

export default async function IntegrationsPage() {
  const session = await getServerSession();
  const user = session?.user as any;

  if (!user?.organizationId) {
    redirect("/onboarding");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    select: {
      id: true,
      name: true,
      googleSheetId: true,
      voiceAiEnabled: true,
      vapiApiKey: true,
      vapiAssistantId: true,
      googleCalendarEnabled: true,
      googleCalendarId: true,
      smsEnabled: true,
      smsReminderWebhookUrl: true,
      smsFollowUpWebhookUrl: true,
      chatbotEmbedCode: true,
      chatbotWebhookUrl: true,
    },
  });

  if (!organization) {
    redirect("/onboarding");
  }

  return (
    <div className="w-full px-6 lg:px-12 pb-12 pt-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect and manage your third-party services and tools.
        </p>
      </div>
      <Suspense fallback={<div className="flex h-[400px] items-center justify-center">Loading integrations...</div>}>
        <IntegrationsClient organization={organization} />
      </Suspense>
    </div>
  );
}





