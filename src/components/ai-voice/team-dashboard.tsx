'use client';

import React from "react";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Phone, Clock, CheckCircle2, User } from "lucide-react";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function TeamDashboard() {
  const { data: session } = useSWR('/api/auth/session', fetcher);
  const organizationId = session?.user?.organizationId;
  
  const { data: statsData, isLoading } = useSWR(
    organizationId ? `/api/voice-calls/team/stats?organizationId=${organizationId}` : null,
    fetcher
  );

  const stats = statsData?.stats || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-muted-foreground">Loading team stats...</p>
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground text-center">
          No team statistics available yet
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((member: any) => (
          <Card key={member.userId} className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {member.userName || member.userEmail || 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {member.totalCalls} calls
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  Assigned
                </span>
                <span className="font-medium">{member.assignedCalls}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Avg Response
                </span>
                <span className="font-medium">
                  {member.avgResponseTime ? `${member.avgResponseTime}m` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Completed
                </span>
                <span className="font-medium">{member.completedCalls}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

