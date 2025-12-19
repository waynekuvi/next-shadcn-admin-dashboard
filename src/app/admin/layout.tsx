import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "./_components/sidebar/admin-sidebar";
import { AccountSwitcher } from "@/app/(main)/dashboard/_components/sidebar/account-switcher";
import { ThemeSwitcher } from "@/app/(main)/dashboard/_components/sidebar/theme-switcher";
import { users } from "@/data/users";
import { SearchDialog } from "@/app/(main)/dashboard/_components/sidebar/search-dialog";
import { getSession } from "@/lib/auth-lucia";

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  // Default to open (true) if no cookie exists, otherwise use cookie value
  const sidebarState = cookieStore.get("sidebar_state")?.value;
  const defaultOpen = sidebarState === undefined ? true : sidebarState === "true";
  
  // Check if user is authenticated and is ADMIN
  const { user } = await getSession() || {};
  
  if (!user) {
    redirect("/auth/v2/login");
  }
  
  if (user.role !== "ADMIN") {
    redirect("/dashboard/overview");
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <span className="font-medium">Platform Overview</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <SearchDialog />
            <ThemeSwitcher />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
