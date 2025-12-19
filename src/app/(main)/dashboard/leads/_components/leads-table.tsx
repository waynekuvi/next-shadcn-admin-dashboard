"use client";

import * as React from "react";
import { Plus, Loader2 } from "lucide-react";
import useSWR from "swr";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { DataTable as DataTableNew } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { withDndColumn } from "@/components/data-table/table-utils";

import { dashboardColumns } from "./columns";
import { sectionSchema } from "./schema";
import { LeadSheet } from "./lead-sheet";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    throw error;
  }
  return res.json();
};

export function LeadsTable() {
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
        (l.phone && l.phone.includes(lowerQuery)) ||
        l.status.toLowerCase().includes(lowerQuery) ||
        l.category.toLowerCase().includes(lowerQuery)
      );
    }
    return filteredLeads;
  }, [apiData, searchQuery]);

  // Local state for drag-and-drop reordering
  const [data, setData] = React.useState<z.infer<typeof sectionSchema>[]>([]);

  // Sync local data with fetched leads
  React.useEffect(() => {
    if (leads.length > 0) {
      setData(leads);
      setManuallyOrderedData([]);
    } else if (!isLoading && leads.length === 0 && searchQuery === "") {
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
    <div className="flex flex-col gap-4">
      <LeadSheet open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen} />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Input 
            placeholder="Search leads by name, email, phone, status..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 max-w-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <DataTableViewOptions table={table} />
          <Button onClick={() => setIsAddLeadOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
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

      <div className="relative min-h-[400px] overflow-hidden rounded-lg border">
        {isLoading && (
          <div className="bg-background/50 absolute inset-0 z-10 flex items-center justify-center">
            <Loader2 className="animate-spin" />
          </div>
        )}
        <DataTableNew 
          key={`${pagination.pageIndex}-${pagination.pageSize}-${paginatedData.length}`}
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
    </div>
  );
}

