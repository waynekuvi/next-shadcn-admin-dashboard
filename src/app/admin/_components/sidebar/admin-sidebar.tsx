"use client";

import Link from "next/link";
import useSWR from "swr";
import { Users, Building2, BarChart3, Settings, LayoutDashboard, FileText, MessageSquare } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { APP_CONFIG } from "@/config/app-config";
import { rootUser } from "@/data/users";
import { NavUser } from "@/app/(main)/dashboard/_components/sidebar/nav-user";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const adminItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Clients",
    url: "/admin/organizations",
    icon: Building2,
  },
  {
    title: "Onboard New Client",
    url: "/admin/create-client",
    icon: Users,
  },
  {
    title: "Messages",
    url: "/admin/messages",
    icon: MessageSquare,
  },
];

const systemItems = [
  {
    title: "System Settings",
    url: "/admin/settings",
    icon: Settings,
  },
  {
    title: "Logs & Audit",
    url: "/admin/logs",
    icon: FileText,
  },
];

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Fetch unread message count
  const { data: unreadData } = useSWR<{ count: number }>(
    "/api/messages/unread-count",
    fetcher,
    { refreshInterval: 10000 }
  );
  const unreadCount = unreadData?.count || 0;

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <img
                    src="https://res.cloudinary.com/dwjvtgiid/image/upload/v1764419666/logo-white_x64htk.svg"
                    alt={APP_CONFIG.name}
                    className="size-5"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{APP_CONFIG.name}</span>
                  <span className="truncate text-xs">Super Admin</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => {
                const isMessages = item.url === "/admin/messages";
                // Only show badge when count is explicitly greater than 0
                const showBadge = isMessages && typeof unreadCount === 'number' && unreadCount > 0;
                // Always use the original title - never append count to title text
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                        {showBadge && (
                          <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1.5 text-[10px]">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={rootUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
