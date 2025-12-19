'use client';

import React, { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, X, Tag as TagIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface TagManagerProps {
  selectedCallId: string | null;
}

export function TagManager({ selectedCallId }: TagManagerProps) {
  const { data: session } = useSWR('/api/auth/session', fetcher);
  const organizationId = session?.user?.organizationId;
  
  const { data: tagsData, mutate } = useSWR(
    organizationId ? `/api/voice-calls/tags?organizationId=${organizationId}` : null,
    fetcher
  );

  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3b82f6");
  const [isCreating, setIsCreating] = useState(false);

  const tags = tagsData?.tags || [];

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error("Tag name is required");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/voice-calls/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTagName.trim(),
          color: newTagColor,
          organizationId
        })
      });

      if (response.ok) {
        toast.success("Tag created");
        setNewTagName("");
        mutate();
      } else {
        throw new Error('Failed to create tag');
      }
    } catch (error) {
      toast.error('Failed to create tag');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) return;

    try {
      const response = await fetch(`/api/voice-calls/tags?id=${tagId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success("Tag deleted");
        mutate();
      } else {
        throw new Error('Failed to delete tag');
      }
    } catch (error) {
      toast.error('Failed to delete tag');
    }
  };

  const handleApplyTag = async (tagId: string) => {
    if (!selectedCallId) {
      toast.error("Please select a call first");
      return;
    }

    try {
      const response = await fetch(`/api/voice-calls/${selectedCallId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagId })
      });

      if (response.ok) {
        toast.success("Tag applied");
      } else {
        throw new Error('Failed to apply tag');
      }
    } catch (error) {
      toast.error('Failed to apply tag');
    }
  };

  return (
    <div className="space-y-6">
      {/* Create New Tag */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-4">Create New Tag</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Tag name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="flex-1"
          />
          <input
            type="color"
            value={newTagColor}
            onChange={(e) => setNewTagColor(e.target.value)}
            className="w-12 h-10 rounded border border-input cursor-pointer"
          />
          <Button onClick={handleCreateTag} disabled={isCreating}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Existing Tags */}
      <div>
        <h3 className="text-sm font-semibold mb-4">Existing Tags</h3>
        {tags.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tags created yet</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag: any) => (
              <div
                key={tag.id}
                className="flex items-center gap-2 p-2 border rounded-lg bg-card"
              >
                <Badge
                  style={{ backgroundColor: tag.color }}
                  className="text-white border-0"
                >
                  <TagIcon className="w-3 h-3 mr-1" />
                  {tag.name}
                </Badge>
                {selectedCallId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleApplyTag(tag.id)}
                    className="h-6 px-2 text-xs"
                  >
                    Apply
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTag(tag.id)}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

