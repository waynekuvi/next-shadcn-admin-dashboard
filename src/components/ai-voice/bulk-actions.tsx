'use client';

import React from "react";
import { Button } from "@/components/ui/button";
import { Tag, Archive, Trash2, Download, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface BulkActionsProps {
  selectedCount: number;
  onTag: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onExport: () => void;
  onClear: () => void;
}

export function BulkActions({ 
  selectedCount, 
  onTag, 
  onArchive, 
  onDelete, 
  onExport,
  onClear 
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="border-b border-border bg-muted/30 px-6 py-2 flex items-center justify-between">
      <span className="text-sm text-muted-foreground">
        {selectedCount} call{selectedCount !== 1 ? 's' : ''} selected
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onTag}
          className="h-8 gap-2"
        >
          <Tag className="w-4 h-4" />
          <span>Tag</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onArchive}
          className="h-8 gap-2"
        >
          <Archive className="w-4 h-4" />
          <span>Archive</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExport}>
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExport}>
              Export as JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-border mx-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-8 gap-2 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

