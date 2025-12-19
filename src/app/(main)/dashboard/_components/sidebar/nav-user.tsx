"use client";

import { EllipsisVertical, CheckCircle2, CreditCard, Bell, LogOut, BadgeCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { getInitials } from "@/lib/utils";

export function NavUser({
  user: initialUser,
}: {
  readonly user: {
    readonly name: string;
    readonly email: string;
    readonly avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const { user: authUser } = useAuth();
  const router = useRouter();

  // Prefer session data if available, fallback to initial props
  const currentUser = authUser ? {
    name: authUser.name || initialUser.name,
    email: authUser.email || initialUser.email,
    avatar: authUser.image || initialUser.avatar,
  } : initialUser;

  // Get user role
  const user = authUser as any;
  const rawRole = user?.orgRole || user?.role || "CLIENT";
  const displayRole = rawRole === "OWNER" ? "Owner" : rawRole === "MEMBER" ? "Member" : rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();
  
  // Determine account settings route based on user role
  const accountSettingsRoute = user?.role === "ADMIN" ? "/admin/account" : "/dashboard/account";
  
  // For admins, billing and notifications should go to dashboard settings (no separate admin settings page)
  const billingRoute = "/dashboard/settings?section=billing";
  const notificationsRoute = "/dashboard/settings?section=notifications";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={currentUser.avatar || undefined} alt={currentUser.name} />
                <AvatarFallback className="rounded-lg">{getInitials(currentUser.name)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <div className="flex items-center gap-1.5">
                <span className="truncate font-medium">{currentUser.name}</span>
                  {user?.role === "ADMIN" && (
                    <BadgeCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  )}
                </div>
                <span className="text-muted-foreground truncate text-xs">{displayRole}</span>
              </div>
              <EllipsisVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={currentUser.avatar || undefined} alt={currentUser.name} />
                  <AvatarFallback className="rounded-lg">{getInitials(currentUser.name)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <div className="flex items-center gap-1.5">
                  <span className="truncate font-medium">{currentUser.name}</span>
                    {user?.role === "ADMIN" && (
                      <BadgeCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    )}
                  </div>
                  <span className="text-muted-foreground truncate text-xs">{displayRole}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem 
                onClick={() => {
                  window.location.href = accountSettingsRoute;
                }}
                className="cursor-pointer"
              >
                <CheckCircle2 />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  window.location.href = billingRoute;
                }}
                className="cursor-pointer"
              >
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  window.location.href = notificationsRoute;
                }}
                className="cursor-pointer"
              >
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/auth/v2/login";
              }}
              className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/20"
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
