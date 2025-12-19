'use client';

import React, { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Lock, Globe, User } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface NotesPanelProps {
  callId: string | null;
}

export function NotesPanel({ callId }: NotesPanelProps) {
  const { data: notesData, mutate } = useSWR(
    callId ? `/api/voice-calls/${callId}/notes` : null,
    fetcher
  );

  const [newNote, setNewNote] = useState("");
  const [isInternal, setIsInternal] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const notes = notesData?.notes || [];

  const handleAddNote = async () => {
    if (!callId) {
      toast.error("Please select a call first");
      return;
    }

    if (!newNote.trim()) {
      toast.error("Note content is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/voice-calls/${callId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newNote.trim(),
          isInternal
        })
      });

      if (response.ok) {
        toast.success("Note added");
        setNewNote("");
        mutate();
      } else {
        throw new Error('Failed to add note');
      }
    } catch (error) {
      toast.error('Failed to add note');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!callId) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground text-center">
          Select a call to view and add notes
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Add Note Form */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-4">Add Note</h3>
        <div className="space-y-3">
          <Textarea
            placeholder="Write a note about this call..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isInternal}
              onCheckedChange={(checked) => setIsInternal(checked === true)}
            />
            <label className="text-sm text-muted-foreground flex items-center gap-2">
              {isInternal ? (
                <>
                  <Lock className="w-4 h-4" />
                  Internal (team only)
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  Public
                </>
              )}
            </label>
          </div>
          <Button onClick={handleAddNote} disabled={isSubmitting}>
            <Plus className="w-4 h-4 mr-2" />
            Add Note
          </Button>
        </div>
      </Card>

      {/* Notes List */}
      <Card className="flex-1 p-4">
        <h3 className="text-sm font-semibold mb-4">Notes ({notes.length})</h3>
        <ScrollArea className="h-[calc(100vh-400px)]">
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No notes yet
            </p>
          ) : (
            <div className="space-y-4">
              {notes.map((note: any) => (
                <div
                  key={note.id}
                  className="p-3 border rounded-lg bg-muted/30"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {note.user?.name || 'Unknown'}
                      </span>
                      {note.isInternal && (
                        <Lock className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(note.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
}

