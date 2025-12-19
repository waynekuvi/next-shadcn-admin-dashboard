"use client";

import * as React from "react";
import useSWR from "swr";
import { formatDistanceToNow, parseISO, isToday, isYesterday, format } from "date-fns";
import {
  UserPlus,
  CalendarClock,
  Mail,
  Phone,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ActivityItem {
  id: string;
  type: string;
  timestamp: string;
  description: string;
  details: any;
  action: string;
  actor: string | null;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch activity");
  return res.json();
};

export function ActivityFeed() {
  const { data, isLoading, error } = useSWR("/api/activity", fetcher, { refreshInterval: 60000 });

  const groupedActivities = React.useMemo(() => {
    if (!data?.activity) return {};
    const groups: Record<string, ActivityItem[]> = {};
    
    data.activity.forEach((item: ActivityItem) => {
      const date = parseISO(item.timestamp);
      let key = format(date, "MMMM d, yyyy");
      if (isToday(date)) key = "Today";
      if (isYesterday(date)) key = "Yesterday";
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    
    return groups;
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading activity timeline...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-destructive">Failed to load activity feed</div>
      </div>
    );
  }

  if (Object.keys(groupedActivities).length === 0) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-2 text-muted-foreground">
        <CalendarClock className="h-10 w-10 opacity-20" />
        <p>No recent activity</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] pr-6">
      <div className="space-y-8 p-1">
        {Object.entries(groupedActivities).map(([date, items]) => (
          <div key={date} className="relative">
            <div className="sticky top-0 z-10 mb-6 bg-background/95 py-2 backdrop-blur">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {date}
              </h3>
            </div>
            
            <div className="ml-3 space-y-8 border-l-2 border-muted pl-8">
              {items.map((item) => (
                <ActivityItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function ActivityItemCard({ item }: { item: ActivityItem }) {
  const isLead = item.type === "LEAD";
  const date = parseISO(item.timestamp);
  const timeAgo = formatDistanceToNow(date, { addSuffix: true });

  // Generate initials for avatar
  // For Leads: Use details.name if available, else actor name or "?"
  // For Reminders/Others: Use actor name or "?"
  let name = "System";
  if (isLead && item.details?.name) {
      name = item.details.name;
  } else if (item.actor && item.actor !== "System") {
      name = item.actor;
  }
  
  const initials = name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <div className="group relative flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/20">
        {/* Absolute icon on the timeline */}
        <div className={cn(
            "absolute -left-[41px] top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 ring-4 ring-background shadow-sm",
            isLead ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-blue-500 bg-blue-50 text-blue-600"
        )}>
            {isLead ? <UserPlus className="h-3 w-3" /> : <CalendarClock className="h-3 w-3" />}
        </div>

        <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
                <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${name}`} />
                    <AvatarFallback className={cn(
                      isLead ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                    )}>{initials}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-medium leading-none">
                        {item.description}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground/80 mt-1.5 flex items-center gap-1.5">
                        <Clock className="h-3 w-3" /> {timeAgo} • by {item.actor || "System"}
                    </p>
                </div>
            </div>
            
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 -mr-2">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Button>
        </div>

        {/* Details Section */}
        {item.details && (
        <div className="mt-1 rounded-lg bg-muted/30 p-3 text-sm border border-transparent group-hover:border-muted transition-colors">
            {isLead ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Only show email/phone if they exist in metadata, otherwise just show score/source */}
                     {item.details.email && (
                        <div className="flex items-center gap-2 text-muted-foreground truncate">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{item.details.email}</span>
                        </div>
                     )}
                    
                    <div className="sm:col-span-2 flex flex-wrap items-center gap-2 mt-1">
                        {item.details.score !== undefined && (
                             <Badge variant="outline" className={cn(
                                "h-5 px-2 font-medium border-0",
                                item.details.score > 70 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                            )}>
                                Score: {item.details.score}
                            </Badge>
                        )}
                        {item.details.source && (
                            <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-md border">
                            via {item.details.source}
                            </span>
                        )}
                         {item.details.oldStatus && item.details.newStatus && (
                            <div className="flex items-center gap-2 text-xs">
                                <Badge variant="outline">{item.details.oldStatus}</Badge>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <Badge variant="outline" className="bg-primary/10 border-primary/20">{item.details.newStatus}</Badge>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                 <div className="text-xs text-muted-foreground">
                    <pre className="whitespace-pre-wrap font-sans">{JSON.stringify(item.details, null, 2)}</pre>
                 </div>
            )}
        </div>
        )}
    </div>
  );
}

// Add Clock icon for the timeAgo display
function Clock({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
