'use client';

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { CallFeed } from "./call-feed";
import { CallDetailView } from "./call-detail";
import { BulkActions } from "./bulk-actions";
import { VoiceCall } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Calendar, Clock, DollarSign, ArrowUpRight, ArrowDownRight, PhoneOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface AIVoiceDashboardProps {
  selectedCallId?: string | null;
  onCallSelect?: (callId: string | null) => void;
}

export function AIVoiceDashboard({ selectedCallId: externalSelectedCallId, onCallSelect }: AIVoiceDashboardProps = {}) {
  // Fetch calls from our API
  // We use the GET endpoint which merges Vapi data with our DB data
  // We assume organizationId is handled by the session/auth middleware wrapper in the API route
  // but based on the code, we might need to pass it.
  // However, standard practice in this repo seems to be handling it on server.
  // Let's try fetching without orgId first, if it fails we'll need to fetch user session.
  // Actually, looking at the API route, it looks for 'organizationId' in query params.
  // I should probably get the current organization ID.
  // For now, I'll assume the API handles auth context or I'll hardcode a fetch for the current user's org.
  
  // NOTE: To make this truly robust, we should fetch the user's org ID first.
  // But for the UI build, I'll fetch from the API and hope it uses session or default.
  // UPDATE: The API route expects `organizationId` in query params for the GET route.
  
  const { data: session } = useSWR('/api/auth/session', fetcher);
  const organizationId = session?.user?.organizationId;
  const userRole = session?.user?.role;

  // Fetch organization data to check if voice AI is enabled
  const { data: orgData } = useSWR(
    organizationId ? `/api/organization/${organizationId}` : null,
    fetcher
  );

  const voiceAiEnabled = orgData?.voiceAiEnabled || userRole === 'ADMIN';

  const { data: callsData, isLoading: isLoadingCalls } = useSWR(
    organizationId ? `/api/voice-calls?organizationId=${organizationId}&limit=50` : null,
    fetcher,
    { refreshInterval: 5000 } // Poll every 5s for new calls
  );

  const { data: statsData, isLoading: isLoadingStats } = useSWR(
    organizationId ? ['/api/voice-calls', organizationId] : null,
    ([url, orgId]) => fetch(url, {
      method: 'POST',
      body: JSON.stringify({ organizationId: orgId }),
      headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json())
  );

  const [internalSelectedCallId, setInternalSelectedCallId] = useState<string | null>(null);
  const [selectedCallIds, setSelectedCallIds] = useState<Set<string>>(new Set());
  const selectedCallId = externalSelectedCallId !== undefined ? externalSelectedCallId : internalSelectedCallId;
  
  const setSelectedCallId = (callId: string | null) => {
    if (onCallSelect) {
      onCallSelect(callId);
    } else {
      setInternalSelectedCallId(callId);
    }
  };

  // Select first call by default when loaded
  useEffect(() => {
    if (callsData?.calls?.length > 0 && !selectedCallId) {
      setSelectedCallId(callsData.calls[0].id);
    }
  }, [callsData, selectedCallId]);

  const selectedCall = callsData?.calls?.find((c: any) => c.id === selectedCallId) || null;

  const stats = [
    {
      label: "Total Calls",
      value: statsData?.total || 0,
      icon: Phone,
      color: "text-blue-400",
      trend: "+12%", // Mock trend for now
      trendUp: true
    },
    {
      label: "Avg Duration",
      value: `${Math.round((statsData?.avgDuration || 0) / 60)}m ${Math.round((statsData?.avgDuration || 0) % 60)}s`,
      icon: Clock,
      color: "text-orange-400",
      trend: "-5%",
      trendUp: false
    },
    {
      label: "Total Cost",
      value: `$${(statsData?.totalCost || 0).toFixed(2)}`,
      icon: DollarSign,
      color: "text-emerald-400",
      trend: "+2.1%",
      trendUp: true
    },
    {
      label: "Appointments",
      value: statsData?.appointmentsBooked || 0,
      icon: Calendar,
      color: "text-purple-400",
      trend: "+4",
      trendUp: true
    }
  ];


  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background text-foreground">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-px bg-border border-b">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card p-4 flex flex-col justify-between gap-4 hover:bg-accent/50 transition-colors">
             <div className="flex items-center justify-between">
               <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
               <stat.icon className={cn("w-4 h-4 opacity-80", stat.color)} />
             </div>
             <div className="flex items-end justify-between">
               <span className="text-2xl font-light tracking-tight text-foreground">{stat.value}</span>
               <div className={cn("flex items-center text-[10px] font-medium", stat.trendUp ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400")}>
                 {stat.trendUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                 {stat.trend}
               </div>
             </div>
          </div>
        ))}
      </div>

      {/* Bulk Actions Toolbar */}
      <BulkActions
        selectedCount={selectedCallIds.size}
        onTag={() => {
          // TODO: Open tag dialog
          toast.info("Tag functionality coming soon");
        }}
        onArchive={async () => {
          try {
            const response = await fetch('/api/voice-calls/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                callIds: Array.from(selectedCallIds),
                action: 'archive'
              })
            });
            if (response.ok) {
              toast.success(`Archived ${selectedCallIds.size} call${selectedCallIds.size !== 1 ? 's' : ''}`);
              setSelectedCallIds(new Set());
            } else {
              throw new Error('Failed to archive calls');
            }
          } catch (error) {
            toast.error('Failed to archive calls');
          }
        }}
        onDelete={async () => {
          if (!confirm(`Are you sure you want to delete ${selectedCallIds.size} call${selectedCallIds.size !== 1 ? 's' : ''}?`)) return;
          try {
            const response = await fetch('/api/voice-calls/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                callIds: Array.from(selectedCallIds),
                action: 'delete'
              })
            });
            if (response.ok) {
              toast.success(`Deleted ${selectedCallIds.size} call${selectedCallIds.size !== 1 ? 's' : ''}`);
              setSelectedCallIds(new Set());
            } else {
              throw new Error('Failed to delete calls');
            }
          } catch (error) {
            toast.error('Failed to delete calls');
          }
        }}
        onExport={() => {
          // TODO: Export functionality
          toast.info("Export functionality coming soon");
        }}
        onClear={() => setSelectedCallIds(new Set())}
      />

      {/* Main Content: Split View */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Call List */}
        <CallFeed 
          calls={callsData?.calls || []} 
          selectedCallId={selectedCallId}
          onSelectCall={(call) => setSelectedCallId(call.id)}
          selectedCallIds={selectedCallIds}
          onBulkSelect={setSelectedCallIds}
        />

        {/* Right Panel: Detail View */}
        <div className="flex-1 overflow-hidden">
          <CallDetailView call={selectedCall} />
        </div>
      </div>
    </div>
  );
}

