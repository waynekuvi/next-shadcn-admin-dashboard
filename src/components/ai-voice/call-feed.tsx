import React, { useState, useEffect } from "react";
import { VoiceCall } from "@prisma/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CallFeedProps {
  calls: VoiceCall[];
  selectedCallId: string | null;
  onSelectCall: (call: VoiceCall) => void;
  selectedCallIds?: Set<string>;
  onBulkSelect?: (callIds: Set<string>) => void;
}

export function CallFeed({ calls, selectedCallId, onSelectCall, selectedCallIds, onBulkSelect }: CallFeedProps) {
  const [localSelectedIds, setLocalSelectedIds] = useState<Set<string>>(new Set());
  const selectedIds = selectedCallIds || localSelectedIds;
  const setSelectedIds = onBulkSelect || setLocalSelectedIds;
  
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredCalls = calls.filter(call => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      call.fromNumber?.toLowerCase().includes(query) ||
      call.toNumber?.toLowerCase().includes(query) ||
      call.summary?.toLowerCase().includes(query) ||
      call.outcome?.toLowerCase().includes(query)
    );
  });

  const handleCheckboxChange = (callId: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(callId);
    } else {
      newSelected.delete(callId);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredCalls.map(c => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const allSelected = filteredCalls.length > 0 && filteredCalls.every(c => selectedIds.has(c.id));
  const someSelected = filteredCalls.some(c => selectedIds.has(c.id)) && !allSelected;
  return (
    <div className="flex flex-col h-full border-r border-border bg-card w-80">
      <div className="p-4 border-b border-border space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search calls..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background border-input text-sm focus-visible:ring-1 focus-visible:ring-ring" 
          />
        </div>
        {filteredCalls.length > 0 && (
          <div className="flex items-center gap-2 px-1">
            <Checkbox
              checked={allSelected}
              onCheckedChange={(checked) => handleSelectAll(checked === true)}
              ref={(el) => {
                if (el) {
                  (el as any).indeterminate = someSelected;
                }
              }}
            />
            <span className="text-xs text-muted-foreground">
              {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
            </span>
          </div>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {filteredCalls.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {searchQuery ? "No calls match your search" : "No calls found"}
            </div>
          )}
          
          {filteredCalls.map((call) => {
             const isSelected = selectedCallId === call.id;
             
             return (
              <div
                key={call.id}
                className={cn(
                  "flex flex-col gap-2 p-4 border-b border-border transition-colors hover:bg-accent/50",
                  isSelected && "bg-accent border-l-2 border-l-primary"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <Checkbox
                      checked={selectedIds.has(call.id)}
                      onCheckedChange={(checked) => {
                        handleCheckboxChange(call.id, checked === true);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0"
                    />
                    <button
                      onClick={() => onSelectCall(call)}
                      className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                    >
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center border",
                      call.status === 'ended' 
                        ? "bg-muted text-muted-foreground border-border" 
                        : "bg-green-500/10 text-green-500 border-green-500/20 dark:bg-green-950/30 dark:text-green-400"
                    )}>
                      <PhoneIncoming className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                       <span className={cn(
                         "text-sm font-medium",
                         isSelected ? "text-foreground" : "text-foreground/90"
                       )}>
                         {call.fromNumber || "Unknown Caller"}
                       </span>
                       <span className="text-[10px] text-muted-foreground font-mono">
                         {new Date(call.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1">
                   <div className="flex items-center gap-2">
                     <Badge variant="outline" className={cn(
                       "text-[10px] h-5 px-1.5 border-0",
                       call.status === 'ended' 
                         ? "bg-muted text-muted-foreground" 
                         : "bg-green-500/10 text-green-600 dark:bg-green-950/30 dark:text-green-400"
                     )}>
                       {call.status}
                     </Badge>
                     {call.duration && (
                       <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                         <Clock className="w-3 h-3" />
                         {Math.round(call.duration)}s
                       </span>
                     )}
                   </div>
                   
                   {/* Outcome Badge if available */}
                   {call.outcome && (
                     <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium truncate max-w-[80px]">
                       {call.outcome}
                     </span>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

