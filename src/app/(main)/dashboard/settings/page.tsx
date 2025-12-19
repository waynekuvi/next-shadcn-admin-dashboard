import { Suspense } from "react";
import { getServerSession } from "@/lib/auth-compat";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";
import { SettingsShell } from "./_components/settings-shell";

export default async function OrganizationSettingsPage() {
  const session = await getServerSession();
  const user = session?.user as any;

  if (!user?.organizationId) {
    redirect("/onboarding");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          orgRole: true,
          role: true,
        },
      },
    },
  });

  if (!organization) {
    redirect("/onboarding");
  }

  // Find current user in the fresh database result to get real-time role
  const currentUserInOrg = organization.users.find((u) => u.email === user.email);
  const realTimeOrgRole = currentUserInOrg?.orgRole;

  // Super Admins are implicitly Owners everywhere
  // Otherwise, check the fresh database role
  const isOwner = realTimeOrgRole === "OWNER" || user.role === "ADMIN";

  return (
    <div className="w-full px-6 lg:px-12 pb-12 pt-6">
      {!isOwner && (
        <Alert variant="destructive" className="mb-8">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Read Only Access</AlertTitle>
          <AlertDescription>
            Only the organization Owner can modify these settings. You are viewing them as a Member.
          </AlertDescription>
        </Alert>
      )}

      <Suspense fallback={<div className="flex h-[400px] items-center justify-center">Loading settings...</div>}>
      <SettingsShell organization={organization} isOwner={isOwner} />
      </Suspense>
    </div>
  );
}
