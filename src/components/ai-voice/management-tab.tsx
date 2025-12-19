'use client';

import React from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tag, FileText, CheckSquare, UserPlus } from "lucide-react";
import { TagManager } from "./tag-manager";
import { NotesPanel } from "./notes-panel";
import { TaskCreator } from "./task-creator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ManagementTabProps {
  selectedCallId: string | null;
}

export function ManagementTab({ selectedCallId }: ManagementTabProps) {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-6 border-b border-border">
        <h2 className="text-2xl font-semibold">Call Management</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Organize, tag, and manage your calls
        </p>
      </div>

      <Tabs defaultValue="tags" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 border-b border-border">
          <TabsList className="bg-transparent h-auto p-0 gap-1">
            <TabsTrigger value="tags" className="gap-2">
              <Tag className="w-4 h-4" />
              <span>Tags</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2">
              <FileText className="w-4 h-4" />
              <span>Notes</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <CheckSquare className="w-4 h-4" />
              <span>Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="gap-2">
              <UserPlus className="w-4 h-4" />
              <span>Create Lead</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="tags" className="flex-1 mt-0 overflow-auto p-6">
          <TagManager selectedCallId={selectedCallId} />
        </TabsContent>

        <TabsContent value="notes" className="flex-1 mt-0 overflow-auto p-6">
          <NotesPanel callId={selectedCallId} />
        </TabsContent>

        <TabsContent value="tasks" className="flex-1 mt-0 overflow-auto p-6">
          <TaskCreator callId={selectedCallId} />
        </TabsContent>

        <TabsContent value="leads" className="flex-1 mt-0 overflow-auto p-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Create Lead from Call</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Extract contact information from the selected call and create a new lead.
            </p>
            {selectedCallId ? (
              <div className="space-y-4">
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/voice-calls/${selectedCallId}/create-lead`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({})
                      });

                      if (response.ok) {
                        toast.success("Lead created successfully");
                      } else {
                        const error = await response.json();
                        throw new Error(error.error || 'Failed to create lead');
                      }
                    } catch (error: any) {
                      toast.error(error.message || 'Failed to create lead');
                    }
                  }}
                >
                  Create Lead from Call
                </Button>
                <p className="text-xs text-muted-foreground">
                  This will extract contact information from the call transcript and create a new lead.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select a call to create a lead from it.
              </p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

