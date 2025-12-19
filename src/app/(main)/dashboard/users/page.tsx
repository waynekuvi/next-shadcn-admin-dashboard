import { Suspense } from "react";
import { getServerSession } from "@/lib/auth-compat";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { UsersPageClient } from "./_components/users-page-client";

export default async function UsersPage() {
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

  // Sort users by name (handle null names)
  if (organization?.users) {
    organization.users.sort((a, b) => {
      const nameA = a.name || a.email || "";
      const nameB = b.name || b.email || "";
      return nameA.localeCompare(nameB);
    });
  }

  if (!organization) {
    redirect("/onboarding");
  }

  return (
    <div className="w-full space-y-6">
      <Suspense fallback={
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <div className="text-muted-foreground">Loading users...</div>
            </div>
          </CardContent>
        </Card>
      }>
        <UsersPageClient members={organization.users} organizationName={organization.name} />
      </Suspense>
    </div>
  );
}

