import { ReactNode } from "react";

import { cookies } from "next/headers";

import { AppSidebar } from "@/app/(main)/dashboard/_components/sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { users } from "@/data/users";
import { cn } from "@/lib/utils";
import { getPreference } from "@/server/server-actions";
import {
  SIDEBAR_VARIANT_VALUES,
  SIDEBAR_COLLAPSIBLE_VALUES,
  CONTENT_LAYOUT_VALUES,
  NAVBAR_STYLE_VALUES,
  type SidebarVariant,
  type SidebarCollapsible,
  type ContentLayout,
  type NavbarStyle,
} from "@/types/preferences/layout";
import { getSession } from "@/lib/auth-lucia";
import { prisma } from "@/lib/db";

import { AccountSwitcher } from "./_components/sidebar/account-switcher";
import { SearchDialog } from "./_components/sidebar/search-dialog";
import { ThemeSwitcher } from "./_components/sidebar/theme-switcher";
import { CurrencySelector } from "./_components/sidebar/currency-selector";

export default async function Layout({ children }: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  const { user } = await getSession() || { user: null };
  // Default to open (true) if no cookie exists, otherwise use cookie value
  const sidebarState = cookieStore.get("sidebar_state")?.value;
  const defaultOpen = sidebarState === undefined ? true : sidebarState === "true";

  const [sidebarVariant, sidebarCollapsible, contentLayout, navbarStyle] = await Promise.all([
    getPreference<SidebarVariant>("sidebar_variant", SIDEBAR_VARIANT_VALUES, "inset"),
    getPreference<SidebarCollapsible>("sidebar_collapsible", SIDEBAR_COLLAPSIBLE_VALUES, "icon"),
    getPreference<ContentLayout>("content_layout", CONTENT_LAYOUT_VALUES, "centered"),
    getPreference<NavbarStyle>("navbar_style", NAVBAR_STYLE_VALUES, "scroll"),
  ]);

  // Fetch Organization Data
  let organization = null;
  const organizationId = user?.organizationId;
  if (organizationId) {
    organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true, logo: true, joinCode: true },
    });
  }

  // Use real session user for AccountSwitcher with correct Role display
  const rawRole = user?.orgRole || user?.role || "CLIENT";
  const displayRole = rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();

  const currentUsers = user ? [{
    id: user.id || "current",
    name: user.name || "User",
    email: user.email || "",
    avatar: user.image || "",
    role: displayRole
  }] : users;

  const layoutPreferences = {
    contentLayout,
    variant: sidebarVariant,
    collapsible: sidebarCollapsible,
    navbarStyle,
  };

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar 
        variant={sidebarVariant} 
        collapsible={sidebarCollapsible}
        organization={organization} // Pass org data
      />
      <SidebarInset
        data-content-layout={contentLayout}
        className={cn(
          "data-[content-layout=centered]:!mx-auto data-[content-layout=centered]:max-w-screen-2xl",
          // Adds right margin for inset sidebar in centered layout up to 113rem.
          // On wider screens with collapsed sidebar, removes margin and sets margin auto for alignment.
          "max-[113rem]:peer-data-[variant=inset]:!mr-2 min-[101rem]:peer-data-[variant=inset]:peer-data-[state=collapsed]:!mr-auto",
        )}
      >
        <header
          data-navbar-style={navbarStyle}
          className={cn(
            "flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
            // Handle sticky navbar style with conditional classes so blur, background, z-index, and rounded corners remain consistent across all SidebarVariant layouts.
            "data-[navbar-style=sticky]:bg-background/50 data-[navbar-style=sticky]:sticky data-[navbar-style=sticky]:top-0 data-[navbar-style=sticky]:z-50 data-[navbar-style=sticky]:overflow-hidden data-[navbar-style=sticky]:rounded-t-[inherit] data-[navbar-style=sticky]:backdrop-blur-md",
          )}
        >
          <div className="flex w-full items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-1 lg:gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
              
              {/* Organization Info in Header */}
              {organization ? (
                <div className="flex items-center gap-2">
                  {organization.logo && (
                    <img 
                      src={organization.logo} 
                      alt={organization.name} 
                      className="h-6 w-auto object-contain max-w-[100px]" 
                    />
                  )}
                  <span className="text-sm font-medium hidden sm:inline-block">
                    {organization.name}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono hidden md:inline-block bg-muted px-1.5 py-0.5 rounded">
                    {organization.joinCode}
                  </span>
                </div>
              ) : (
                <SearchDialog />
              )}
            </div>
            <div className="flex items-center gap-2">
              <CurrencySelector />
              <ThemeSwitcher />
              <AccountSwitcher users={currentUsers} />
            </div>
          </div>
        </header>
        <div className="h-full p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
