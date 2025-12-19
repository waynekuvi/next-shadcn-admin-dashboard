"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

import { BadgeCheck, Bell, CreditCard, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn, getInitials } from "@/lib/utils";

export function AccountSwitcher({
  users,
}: {
  readonly users: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly avatar: string;
    readonly role: string;
  }>;
}) {
  const { user: authUser } = useAuth();
  const router = useRouter();
  
  // Use session user if available, otherwise use first user from props
  const sessionUser = authUser as any;
  
  // Determine account settings route based on user role
  const accountSettingsRoute = sessionUser?.role === "ADMIN" ? "/admin/account" : "/dashboard/account";
  
  // For admins, billing and notifications should go to dashboard settings (no separate admin settings page)
  const billingRoute = "/dashboard/settings?section=billing";
  const notificationsRoute = "/dashboard/settings?section=notifications";
  const currentUserFromSession = sessionUser ? {
    id: sessionUser.id || users[0]?.id || "current",
    name: sessionUser.name || users[0]?.name || "User",
    email: sessionUser.email || users[0]?.email || "",
    avatar: sessionUser.image || users[0]?.avatar || "",
    role: sessionUser.orgRole || sessionUser.role || users[0]?.role || "CLIENT"
  } : users[0];
  
  const [activeUser, setActiveUser] = useState(currentUserFromSession);
  
  // Update activeUser when session changes
  useEffect(() => {
    if (sessionUser) {
      const newUser = {
        id: sessionUser.id || users[0]?.id || "current",
        name: sessionUser.name || users[0]?.name || "User",
        email: sessionUser.email || users[0]?.email || "",
        avatar: sessionUser.image || users[0]?.avatar || "",
        role: sessionUser.orgRole || sessionUser.role || users[0]?.role || "CLIENT"
      };
      setActiveUser(newUser);
    }
  }, [sessionUser, users]);
  
  // Get display role
  const rawRole = activeUser.role || "CLIENT";
  const displayRole = rawRole === "OWNER" ? "Owner" : rawRole === "MEMBER" ? "Member" : rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-9 rounded-lg">
          <AvatarImage src={activeUser.avatar || undefined} alt={activeUser.name} />
          <AvatarFallback className="rounded-lg">{getInitials(activeUser.name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56 space-y-1 rounded-lg" side="bottom" align="end" sideOffset={4}>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={activeUser.avatar || undefined} alt={activeUser.name} />
              <AvatarFallback className="rounded-lg">{getInitials(activeUser.name)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
              <div className="flex items-center gap-1">
                <span className="truncate font-medium">{activeUser.name}</span>
                {activeUser.role === "ADMIN" && (
                  <BadgeCheck className="h-3 w-3 text-blue-500 shrink-0" />
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
            <BadgeCheck />
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
          className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer"
        >
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
