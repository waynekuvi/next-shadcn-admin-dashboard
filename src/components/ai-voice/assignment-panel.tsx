'use client';

import React, { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, UserCheck, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface AssignmentPanelProps {
  callId: string | null;
}

export function AssignmentPanel({ callId }: AssignmentPanelProps) {
  const { data: session } = useSWR('/api/auth/session', fetcher);
  const organizationId = session?.user?.organizationId;
  
  const { data: usersData } = useSWR(
    organizationId ? `/api/users?organizationId=${organizationId}` : null,
    fetcher
  );

  const { data: assignmentData, mutate } = useSWR(
    callId ? `/api/voice-calls/${callId}/assign` : null,
    fetcher
  );

  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);

  const users = usersData?.users || [];
  const assignment = assignmentData?.assignment;

  const handleAssign = async () => {
    if (!callId) {
      toast.error("Please select a call first");
      return;
    }

    setIsAssigning(true);
    try {
      const response = await fetch(`/api/voice-calls/${callId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedToId: selectedUserId || null
        })
      });

      if (response.ok) {
        toast.success(selectedUserId ? "Call assigned" : "Assignment removed");
        setSelectedUserId("");
        mutate();
      } else {
        throw new Error('Failed to assign call');
      }
    } catch (error) {
      toast.error('Failed to assign call');
    } finally {
      setIsAssigning(false);
    }
  };

  if (!callId) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground text-center">
          Select a call to assign it to a team member
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Assignment */}
      {assignment && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-4">Current Assignment</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {assignment.assignedTo?.name || assignment.assignedTo?.email || 'Unknown'}
              </p>
              <p className="text-xs text-muted-foreground">
                Assigned by {assignment.assignedBy?.name || 'Unknown'} on{' '}
                {new Date(assignment.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Assign Call */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-4">
          {assignment ? 'Reassign Call' : 'Assign Call'}
        </h3>
        <div className="space-y-3">
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Select team member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unassign</SelectItem>
              {users.map((user: any) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name || user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAssign} disabled={isAssigning}>
            {assignment ? 'Reassign' : 'Assign'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

