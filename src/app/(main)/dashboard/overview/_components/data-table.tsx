"use client";

import * as React from "react";

import { Plus, Loader2 } from "lucide-react";
import useSWR from "swr";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { Input } from "@/components/ui/input";

import { DataTable as DataTableNew } from "../../../../../components/data-table/data-table";
import { DataTablePagination } from "../../../../../components/data-table/data-table-pagination";
import { DataTableViewOptions } from "../../../../../components/data-table/data-table-view-options";
import { withDndColumn } from "../../../../../components/data-table/table-utils";

import { dashboardColumns } from "./columns";
import { sectionSchema } from "./schema";
import { LeadSheet } from "./lead-sheet";
import { ActivityFeed } from "./activity-feed";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    throw error;
  }
  return res.json();
};

export function DataTable({ data: initialData }: { data?: z.infer<typeof sectionSchema>[] }) {
  const { data: apiData, isLoading } = useSWR("/api/leads", fetcher, { refreshInterval: 60000 });
  const [isAddLeadOpen, setIsAddLeadOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  
  // Transform API data to include IDs and match schema
  const leads = React.useMemo(() => {
    if (!apiData?.leads) return [];
    let filteredLeads = apiData.leads.map((l: any, i: number) => ({
      ...l,
      id: l.id || `lead-${i}`,
    }));

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filteredLeads = filteredLeads.filter((l: any) => 
        l.name.toLowerCase().includes(lowerQuery) || 
        l.email.toLowerCase().includes(lowerQuery) ||
        l.phone.includes(lowerQuery) ||
        l.status.toLowerCase().includes(lowerQuery) ||
        l.category.toLowerCase().includes(lowerQuery)
      );
    }
    return filteredLeads;
  }, [apiData, searchQuery]);

  // Local state for drag-and-drop reordering
  const [data, setData] = React.useState<z.infer<typeof sectionSchema>[]>([]);

  // Sync local data with fetched leads, but only when leads change meaningfully
  React.useEffect(() => {
    // Simple check to avoid unnecessary updates if data is same length (imperfect but helps keep order during minor updates)
    // For a real app, you might want more complex reconciliation or disable SWR sync while editing order
    if (leads.length > 0) {
      setData(leads);
      setManuallyOrderedData([]);
    } else if (!isLoading && leads.length === 0 && searchQuery === "") {
       // If data loaded but leads is empty and no search, explicitly set empty
      setData([]);
      setManuallyOrderedData([]);
    }
  }, [leads, isLoading, searchQuery]);

  const columns = React.useMemo(() => withDndColumn(dashboardColumns), []);
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [manuallyOrderedData, setManuallyOrderedData] = React.useState<z.infer<typeof sectionSchema>[]>([]);

  const workingData = manuallyOrderedData.length > 0 ? manuallyOrderedData : data;

  const updateWorkingData = React.useCallback(
    (updater: (base: z.infer<typeof sectionSchema>[]) => z.infer<typeof sectionSchema>[]) => {
      setManuallyOrderedData((prev) => {
        const base = prev.length > 0 ? prev : data;
        return updater(base);
      });
    },
    [data],
  );

  // Clamp page index if data shrinks
  React.useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(workingData.length / pagination.pageSize));
    if (pagination.pageIndex > totalPages - 1) {
      setPagination((prev) => ({ ...prev, pageIndex: totalPages - 1 }));
    }
  }, [workingData.length, pagination.pageIndex, pagination.pageSize]);

  const paginatedData = React.useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return workingData.slice(start, start + pagination.pageSize);
  }, [workingData, pagination.pageIndex, pagination.pageSize]);

  const handleReorder = React.useCallback(
    (newPageData: z.infer<typeof sectionSchema>[]) => {
      updateWorkingData((base) => {
        const start = pagination.pageIndex * pagination.pageSize;
        const updated = [...base];
        newPageData.forEach((row, index) => {
          updated[start + index] = row;
        });
        return updated;
      });
    },
    [pagination.pageIndex, pagination.pageSize, updateWorkingData],
  );

  const table = useDataTableInstance({ 
    data: paginatedData, 
    columns, 
    getRowId: (row) => row.id?.toString() || "",
    enableRowSelection: true,
    manualPagination: true,
  });

  const selectedCount = table.getSelectedRowModel().rows.length;

  const handleBulkStatusChange = React.useCallback(
    (status: string) => {
      if (!selectedCount) return;
      const selectedIds = new Set(table.getSelectedRowModel().rows.map((row) => row.original.id));
      updateWorkingData((base) =>
        base.map((lead) => (selectedIds.has(lead.id) ? { ...lead, status } : lead)),
      );
      table.resetRowSelection();
    },
    [selectedCount, table, updateWorkingData],
  );

  return (
    <Tabs defaultValue="leads" className="w-full flex-col justify-start gap-6">
      <LeadSheet open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen} />
      <div className="flex items-center justify-between">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="leads">
          <SelectTrigger className="flex w-fit @4xl/main:hidden" size="sm" id="view-selector">
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="leads">Leads</SelectItem>
            <SelectItem value="activity">Recent Activity</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="leads">
            Leads <Badge variant="secondary">{data.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <Input 
            placeholder="Filter leads..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
          <DataTableViewOptions table={table} />
          <Button variant="outline" size="sm" onClick={() => setIsAddLeadOpen(true)}>
            <Plus />
            <span className="hidden lg:inline">Add Lead</span>
          </Button>
        </div>
      </div>
      {selectedCount > 0 && (
        <div className="bg-primary/5 border border-primary/20 text-sm flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3">
          <span className="font-medium">
            {selectedCount} lead{selectedCount > 1 ? "s" : ""} selected
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleBulkStatusChange("Contacted")}>
              Mark Contacted
            </Button>
            <Button size="sm" onClick={() => handleBulkStatusChange("Booked")}>
              Mark Booked
            </Button>
          </div>
        </div>
      )}
      <TabsContent value="leads" className="relative flex flex-col gap-4 overflow-auto">
        <div className="relative min-h-[200px] overflow-hidden rounded-lg border">
          {isLoading && (
            <div className="bg-background/50 absolute inset-0 z-10 flex items-center justify-center">
              <Loader2 className="animate-spin" />
            </div>
          )}
          <DataTableNew 
            key={`${pagination.pageIndex}-${pagination.pageSize}-${paginatedData.length}`} // Force re-render when page changes
            dndEnabled 
            table={table} 
            columns={columns} 
            onReorder={handleReorder} 
          />
        </div>
        <DataTablePagination 
          totalRows={workingData.length}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          selectedRows={selectedCount}
          onPageChange={(index) =>
            setPagination((prev) => ({ ...prev, pageIndex: Math.max(0, index) }))
          }
          onPageSizeChange={(size) =>
            setPagination({ pageIndex: 0, pageSize: size })
          }
        />
      </TabsContent>
      <TabsContent value="activity" className="flex flex-col">
        <div className="relative min-h-[400px] rounded-lg border">
          <ActivityFeed />
        </div>
      </TabsContent>
    </Tabs>
  );
}
