"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

import { PlusCircleIcon, MailIcon, ChevronRight, UserPlus, MessageSquare, CalendarClock, Bell, UserPlus as UserPlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { LeadSheet } from "@/app/(main)/dashboard/overview/_components/lead-sheet";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { type NavGroup, type NavMainItem } from "@/navigation/sidebar/sidebar-items";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface NavMainProps {
  readonly items: readonly NavGroup[];
}

const IsComingSoon = () => (
  <span className="ml-auto rounded-md bg-gray-200 px-2 py-1 text-xs dark:text-gray-800">Soon</span>
);

const IsNew = () => (
  <span className="ml-auto rounded-md bg-blue-500 px-2 py-1 text-xs text-white font-medium">New</span>
);

const NavItemExpanded = ({
  item,
  isActive,
  isSubmenuOpen,
  unreadCount,
}: {
  item: NavMainItem;
  isActive: (url: string, subItems?: NavMainItem["subItems"]) => boolean;
  isSubmenuOpen: (subItems?: NavMainItem["subItems"]) => boolean;
  unreadCount?: number;
}) => {
  // Only show badge when count is explicitly greater than 0
  const showBadge = item.url === "/dashboard/messages" && typeof unreadCount === 'number' && unreadCount > 0;
  // Always use the original title - never append count to title text

  return (
    <Collapsible key={item.title} asChild defaultOpen={isSubmenuOpen(item.subItems)} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          {item.subItems ? (
            <SidebarMenuButton
              disabled={item.comingSoon}
              isActive={isActive(item.url, item.subItems)}
              tooltip={item.title}
            >
              {item.icon && <item.icon />}
              <span>{item.title}</span>
              {item.isNew && <IsNew />}
              {item.comingSoon && <IsComingSoon />}
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          ) : (
            <SidebarMenuButton
              asChild
              aria-disabled={item.comingSoon}
              isActive={isActive(item.url)}
              tooltip={item.title}
            >
              <Link prefetch={false} href={item.url} target={item.newTab ? "_blank" : undefined}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
                {showBadge && (
                  <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1.5 text-[10px]">
                    {unreadCount! > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
                {item.isNew && <IsNew />}
                {item.comingSoon && <IsComingSoon />}
              </Link>
            </SidebarMenuButton>
          )}
        </CollapsibleTrigger>
        {item.subItems && (
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.subItems.map((subItem) => (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton aria-disabled={subItem.comingSoon} isActive={isActive(subItem.url)} asChild>
                    <Link prefetch={false} href={subItem.url} target={subItem.newTab ? "_blank" : undefined}>
                      {subItem.icon && <subItem.icon />}
                      <span>{subItem.title}</span>
                      {subItem.comingSoon && <IsComingSoon />}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        )}
      </SidebarMenuItem>
    </Collapsible>
  );
};

const NavItemCollapsed = ({
  item,
  isActive,
  unreadCount,
}: {
  item: NavMainItem;
  isActive: (url: string, subItems?: NavMainItem["subItems"]) => boolean;
  unreadCount?: number;
}) => {
  // Only show badge when count is explicitly greater than 0
  const showBadge = item.url === "/dashboard/messages" && typeof unreadCount === 'number' && unreadCount > 0;
  // Always use the original title - never append count to title text

  return (
    <SidebarMenuItem key={item.title}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            disabled={item.comingSoon}
            tooltip={item.title}
            isActive={isActive(item.url, item.subItems)}
          >
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            {showBadge && (
              <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1.5 text-[10px]">
                {unreadCount! > 99 ? "99+" : unreadCount}
              </Badge>
            )}
            {item.isNew && <IsNew />}
            {item.comingSoon && <IsComingSoon />}
            <ChevronRight />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-50 space-y-1" side="right" align="start">
          {item.subItems?.map((subItem) => (
            <DropdownMenuItem key={subItem.title} asChild>
              <SidebarMenuSubButton
                key={subItem.title}
                asChild
                className="focus-visible:ring-0"
                aria-disabled={subItem.comingSoon}
                isActive={isActive(subItem.url)}
              >
                <Link prefetch={false} href={subItem.url} target={subItem.newTab ? "_blank" : undefined}>
                  {subItem.icon && <subItem.icon className="[&>svg]:text-sidebar-foreground" />}
                  <span>{subItem.title}</span>
                  {subItem.comingSoon && <IsComingSoon />}
                </Link>
              </SidebarMenuSubButton>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

export function NavMain({ items }: NavMainProps) {
  const path = usePathname();
  const router = useRouter();
  const { state, isMobile } = useSidebar();
  const [leadSheetOpen, setLeadSheetOpen] = useState(false);

  // Fetch unread message count
  const { data: unreadData } = useSWR<{ count: number }>(
    "/api/messages/unread-count",
    fetcher,
    { refreshInterval: 10000 }
  );
  const unreadCount = unreadData?.count || 0;

  // Fetch recent activity for notifications
  const { data: activityData } = useSWR<{ activity: Array<{
    id: string;
    type: string;
    timestamp: string;
    description: string;
    actor: string | null;
    timeAgo?: string;
  }> }>(
    "/api/activity",
    fetcher,
    { refreshInterval: 30000 }
  );
  
  const recentActivity = activityData?.activity?.slice(0, 5) || [];

  const isItemActive = (url: string, subItems?: NavMainItem["subItems"]) => {
    if (subItems?.length) {
      return subItems.some((sub) => path.startsWith(sub.url));
    }
    return path === url;
  };

  const isSubmenuOpen = (subItems?: NavMainItem["subItems"]) => {
    return subItems?.some((sub) => path.startsWith(sub.url)) ?? false;
  };

  const handleCreateLead = () => {
    setLeadSheetOpen(true);
  };

  const handleCreateChannel = () => {
    router.push("/dashboard/messages");
  };

  const handleCreateReminder = () => {
    // Navigate to messages page for now (reminders can be added later)
    router.push("/dashboard/messages");
  };

  return (
    <>
      <LeadSheet open={leadSheetOpen} onOpenChange={setLeadSheetOpen} />
      <SidebarGroup>
        <SidebarGroupContent className="flex flex-col gap-2">
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                tooltip="Quick Create"
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
              >
                <PlusCircleIcon />
                <span>Quick Create</span>
              </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onClick={handleCreateLead} className="cursor-pointer">
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>New Lead</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCreateChannel} className="cursor-pointer">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>New Message</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCreateReminder} className="cursor-pointer">
                    <CalendarClock className="mr-2 h-4 w-4" />
                    <span>New Reminder</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                    className="h-9 w-9 shrink-0 group-data-[collapsible=icon]:opacity-0 relative"
                variant="outline"
              >
                    <Bell />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                    <span className="sr-only">Notifications</span>
              </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {unreadCount} unread
                      </Badge>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <ScrollArea className="h-[300px]">
                    {unreadCount > 0 && (
                      <>
                        <DropdownMenuItem 
                          onClick={() => router.push("/dashboard/messages")}
                          className="cursor-pointer"
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          <div className="flex flex-col">
                            <span className="font-medium">You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</span>
                            <span className="text-xs text-muted-foreground">Click to view</span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {recentActivity.length > 0 ? (
                      <>
                        {recentActivity.map((item) => {
                          const getIcon = () => {
                            if (item.type === "LEAD") return <UserPlusIcon className="h-4 w-4 text-blue-500" />;
                            if (item.type === "REMINDER") return <CalendarClock className="h-4 w-4 text-orange-500" />;
                            return <Bell className="h-4 w-4 text-muted-foreground" />;
                          };
                          
                          return (
                            <DropdownMenuItem 
                              key={item.id}
                              className="cursor-pointer py-3"
                              onClick={() => {
                                if (item.type === "LEAD") router.push("/dashboard/overview");
                                else if (item.type === "REMINDER") router.push("/dashboard/messages");
                              }}
                            >
                              <div className="flex items-start gap-3 w-full">
                                <div className="mt-0.5">{getIcon()}</div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{item.description}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {item.actor && (
                                      <span className="text-xs text-muted-foreground">{item.actor}</span>
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                      {item.timeAgo || formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </DropdownMenuItem>
                          );
                        })}
                      </>
                    ) : (
                      <div className="py-6 text-center">
                        <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                        <p className="text-sm text-muted-foreground">No notifications</p>
                      </div>
                    )}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      {items.map((group) => {
        const visibleItems = group.items.filter(item => !item.hidden);
        // Don't render the group if all items are hidden
        if (visibleItems.length === 0) return null;
        
        return (
        <SidebarGroup key={group.id}>
          {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {visibleItems.map((item) => {
                if (state === "collapsed" && !isMobile) {
                  // If no subItems, just render the button as a link
                  if (!item.subItems) {
                    // Only show badge when count is explicitly greater than 0
                    const showBadge = item.url === "/dashboard/messages" && typeof unreadCount === 'number' && unreadCount > 0;
                    // Always use the original title - never append count to title text
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          aria-disabled={item.comingSoon}
                          tooltip={item.title}
                          isActive={isItemActive(item.url)}
                        >
                          <Link prefetch={false} href={item.url} target={item.newTab ? "_blank" : undefined}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            {showBadge && (
                              <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1.5 text-[10px]">
                                {unreadCount > 99 ? "99+" : unreadCount}
                              </Badge>
                            )}
                            {item.isNew && <IsNew />}
                            {item.comingSoon && <IsComingSoon />}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }
                  // Otherwise, render the dropdown as before
                  return <NavItemCollapsed key={item.title} item={item} isActive={isItemActive} unreadCount={unreadCount} />;
                }
                // Expanded view
                return (
                  <NavItemExpanded key={item.title} item={item} isActive={isItemActive} isSubmenuOpen={isSubmenuOpen} unreadCount={unreadCount} />
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        );
      })}
    </>
  );
}
