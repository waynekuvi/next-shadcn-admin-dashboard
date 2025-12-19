import { Suspense } from "react";
import { getServerSession } from "@/lib/auth-compat";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ChatbotPageClient } from "./_components/chatbot-page-client";

export default async function ChatbotPage() {
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
      chatbotEmbedCode: true,
      chatbotGradientColor1: true,
      chatbotGradientColor2: true,
      chatbotGradientColor3: true,
      chatbotGradientColor4: true,
      chatbotAvatars: true,
      chatbotBrandLogo: true,
    },
  });

  if (!organization) {
    redirect("/onboarding");
  }

  const isOwner = user.role === "ADMIN" || user.role === "OWNER";

  // Parse gradient colors with defaults
  const initialGradient = {
    color1: organization.chatbotGradientColor1 || "#1e5eff",
    color2: organization.chatbotGradientColor2 || "#5860f4",
    color3: organization.chatbotGradientColor3 || "#7c3aed",
    color4: organization.chatbotGradientColor4 || "#dcd6ff",
  };

  // Parse avatars (stored as JSON string)
  let initialAvatars: string[] = [];
  if (organization.chatbotAvatars) {
    try {
      initialAvatars = JSON.parse(organization.chatbotAvatars);
    } catch {
      initialAvatars = [];
    }
  }

  return (
    <div className="w-full h-[calc(100vh-3rem)] -m-4 md:-m-6 overflow-hidden">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Loading chatbot...</div>
          </div>
        }
      >
        <ChatbotPageClient
          organizationId={organization.id}
          organizationName={organization.name}
          chatbotEmbedCode={organization.chatbotEmbedCode}
          initialGradient={initialGradient}
          initialAvatars={initialAvatars}
          initialBrandLogo={organization.chatbotBrandLogo}
          isOwner={isOwner}
        />
      </Suspense>
    </div>
  );
}
