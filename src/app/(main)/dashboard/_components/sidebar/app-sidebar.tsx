"use client";

import Link from "next/link";

import { Settings, CircleHelp, Search, Database, ClipboardList, File } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { APP_CONFIG } from "@/config/app-config";
import { rootUser } from "@/data/users";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  organization?: {
    name: string;
    logo: string | null;
    joinCode: string;
  } | null;
}

export function AppSidebar({ organization, ...props }: AppSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link prefetch={false} href="/dashboard/overview">
                <img
                  src="https://res.cloudinary.com/dwjvtgiid/image/upload/v1764419666/logo-white_x64htk.svg"
                  alt={APP_CONFIG.name}
                  className="size-6"
                />
                <span className="text-base font-semibold">{APP_CONFIG.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {organization && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Organization Settings" className="mt-2 border border-border bg-muted/30 hover:bg-muted/50">
                <Link href="/dashboard/settings">
                  {organization.logo ? (
                    <img
                      src={organization.logo}
                      alt={organization.name}
                      className="size-5 object-contain rounded-sm"
                    />
                  ) : (
                    <div className="flex size-5 items-center justify-center rounded-sm bg-primary text-[10px] text-primary-foreground font-bold">
                      {organization.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium truncate">{organization.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={rootUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
