"use client";

import * as React from "react";
import { Users as UsersIcon } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { DataTable as DataTableNew } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { withDndColumn } from "@/components/data-table/table-utils";

import { userColumns } from "./user-columns";
import { userSchema } from "./user-schema";

interface UsersDataTableProps {
  members: z.infer<typeof userSchema>[];
  organizationName: string;
}

export function UsersDataTable({ members, organizationName }: UsersDataTableProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });

  // Filter members based on search query
  const filteredMembers = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return members;
    }

    const query = searchQuery.toLowerCase();
    return members.filter((member) => {
      const name = member.name?.toLowerCase() || "";
      const email = member.email?.toLowerCase() || "";
      const role = member.role?.toLowerCase() || "";
      const orgRole = member.orgRole?.toLowerCase() || "";
      return name.includes(query) || email.includes(query) || role.includes(query) || orgRole.includes(query);
    });
  }, [members, searchQuery]);

  // Paginate filtered data
  const paginatedData = React.useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return filteredMembers.slice(start, start + pagination.pageSize);
  }, [filteredMembers, pagination.pageIndex, pagination.pageSize]);

  // Clamp page index if data shrinks
  React.useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pagination.pageSize));
    if (pagination.pageIndex > totalPages - 1) {
      setPagination((prev) => ({ ...prev, pageIndex: Math.max(0, totalPages - 1) }));
    }
  }, [filteredMembers.length, pagination.pageIndex, pagination.pageSize]);

  const columns = React.useMemo(() => withDndColumn(userColumns), []);

  const table = useDataTableInstance({
    data: paginatedData,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    manualPagination: true,
  });

  const selectedCount = table.getSelectedRowModel().rows.length;

  // Stats
  const ownerCount = members.filter((m) => m.orgRole === "OWNER").length;
  const memberCount = members.filter((m) => m.orgRole === "MEMBER").length;
  const adminCount = members.filter((m) => m.role === "ADMIN").length;

  return (
    <div className="space-y-6">
      {/* Stats Bar - Minimal & Sleek */}
      <div className="flex items-center gap-4 text-xs border-b pb-3">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">{members.length}</span> total
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">{ownerCount}</span> owner{ownerCount !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">{memberCount}</span> member{memberCount !== 1 ? "s" : ""}
          </span>
        </div>
        {adminCount > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">{adminCount}</span> admin{adminCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Toolbar - Minimal */}
      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder="Search by name, email, or role..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
          }}
          className="h-9 w-full max-w-sm"
        />
        <div className="flex items-center gap-2">
          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* Bulk Actions - Sleek */}
      {selectedCount > 0 && (
        <div className="bg-primary/5 border border-primary/20 text-xs flex flex-wrap items-center justify-between gap-3 rounded-md px-3 py-2">
          <span className="font-medium">
            {selectedCount} user{selectedCount > 1 ? "s" : ""} selected
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <Button variant="outline" size="sm" className="h-7 text-xs" disabled>
              Export
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" disabled>
              Actions
            </Button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="relative min-h-[400px] overflow-hidden rounded-lg border">
        {filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <UsersIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm font-medium text-foreground mb-1">
              {searchQuery ? "No users found" : "No users yet"}
            </p>
            <p className="text-xs text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Users will appear here once they join the organization"}
            </p>
          </div>
        ) : (
          <>
            <DataTableNew
              key={`${pagination.pageIndex}-${pagination.pageSize}-${paginatedData.length}`}
              table={table}
              columns={columns}
            />
          </>
        )}
      </div>

      {/* Pagination */}
      {filteredMembers.length > 0 && (
        <DataTablePagination
          totalRows={filteredMembers.length}
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
      )}
    </div>
  );
}

