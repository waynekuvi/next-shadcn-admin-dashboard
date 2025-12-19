'use client';

import React, { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CheckCircle2, Circle, Calendar } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface TaskCreatorProps {
  callId: string | null;
}

export function TaskCreator({ callId }: TaskCreatorProps) {
  const { data: session } = useSWR('/api/auth/session', fetcher);
  const organizationId = session?.user?.organizationId;
  
  const { data: usersData } = useSWR(
    organizationId ? `/api/users?organizationId=${organizationId}` : null,
    fetcher
  );

  const { data: tasksData, mutate } = useSWR(
    callId ? `/api/voice-calls/${callId}/tasks` : null,
    fetcher
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedToId, setAssignedToId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tasks = tasksData?.tasks || [];
  const users = usersData?.users || [];

  const handleCreateTask = async () => {
    if (!callId) {
      toast.error("Please select a call first");
      return;
    }

    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/voice-calls/${callId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          dueDate: dueDate || undefined,
          assignedToId: assignedToId || undefined
        })
      });

      if (response.ok) {
        toast.success("Task created");
        setTitle("");
        setDescription("");
        setDueDate("");
        setAssignedToId("");
        mutate();
      } else {
        throw new Error('Failed to create task');
      }
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/voice-calls/${callId}/tasks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          completed: !completed
        })
      });

      if (response.ok) {
        mutate();
      } else {
        throw new Error('Failed to update task');
      }
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  if (!callId) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground text-center">
          Select a call to create tasks
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Create Task Form */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-4">Create Task</h3>
        <div className="space-y-3">
          <Input
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="datetime-local"
              placeholder="Due date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <Select value={assignedToId} onValueChange={setAssignedToId}>
              <SelectTrigger>
                <SelectValue placeholder="Assign to" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
                {users.map((user: any) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreateTask} disabled={isSubmitting}>
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
        </div>
      </Card>

      {/* Tasks List */}
      <Card className="flex-1 p-4">
        <h3 className="text-sm font-semibold mb-4">Tasks ({tasks.length})</h3>
        <ScrollArea className="h-[calc(100vh-400px)]">
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No tasks yet
            </p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task: any) => (
                <div
                  key={task.id}
                  className={cn(
                    "p-3 border rounded-lg flex items-start gap-3",
                    task.completed && "opacity-60"
                  )}
                >
                  <button
                    onClick={() => handleToggleComplete(task.id, task.completed)}
                    className="mt-0.5"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h4 className={cn(
                      "text-sm font-medium",
                      task.completed && "line-through"
                    )}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      {task.assignedTo && (
                        <span>Assigned to {task.assignedTo.name || task.assignedTo.email}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
}

