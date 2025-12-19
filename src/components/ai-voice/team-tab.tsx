'use client';

import React from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, UserCheck, BarChart3, Share2 } from "lucide-react";
import { AssignmentPanel } from "./assignment-panel";
import { TeamDashboard } from "./team-dashboard";

interface TeamTabProps {
  selectedCallId: string | null;
}

export function TeamTab({ selectedCallId }: TeamTabProps) {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-6 border-b border-border">
        <h2 className="text-2xl font-semibold">Team Collaboration</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Assign calls, track performance, and collaborate with your team
        </p>
      </div>

      <Tabs defaultValue="assignments" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 border-b border-border">
          <TabsList className="bg-transparent h-auto p-0 gap-1">
            <TabsTrigger value="assignments" className="gap-2">
              <UserCheck className="w-4 h-4" />
              <span>Assignments</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>Performance</span>
            </TabsTrigger>
            <TabsTrigger value="sharing" className="gap-2">
              <Share2 className="w-4 h-4" />
              <span>Sharing</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="assignments" className="flex-1 mt-0 overflow-auto p-6">
          <AssignmentPanel callId={selectedCallId} />
        </TabsContent>

        <TabsContent value="performance" className="flex-1 mt-0 overflow-auto p-6">
          <TeamDashboard />
        </TabsContent>

        <TabsContent value="sharing" className="flex-1 mt-0 overflow-auto p-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Share Call</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Generate a shareable link for the selected call.
            </p>
            {selectedCallId ? (
              <div className="space-y-4">
                <p className="text-sm">Call ID: {selectedCallId}</p>
                {/* Sharing functionality will be added here */}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select a call to generate a shareable link.
              </p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

