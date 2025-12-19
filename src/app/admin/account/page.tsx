import { Suspense } from "react";
import { getServerSession } from "@/lib/auth-compat";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { AccountSettingsShell } from "@/app/(main)/dashboard/account/_components/account-settings-shell";

export default async function AdminAccountSettingsPage() {
  const session = await getServerSession();
  const user = session?.user as any;

  if (!user) {
    redirect("/auth/v2/login");
  }

  // Ensure user is ADMIN
  if (user.role !== "ADMIN") {
    redirect("/dashboard/overview");
  }

  // Fetch full user data
  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      emailVerified: true,
      role: true,
      orgRole: true,
    },
  });

  if (!currentUser) {
    redirect("/auth/v2/login");
  }

  return (
    <div className="w-full px-6 lg:px-12 pb-12 pt-6">
      <Suspense fallback={<div className="flex h-[400px] items-center justify-center">Loading account settings...</div>}>
        <AccountSettingsShell user={currentUser} />
      </Suspense>
    </div>
  );
}

