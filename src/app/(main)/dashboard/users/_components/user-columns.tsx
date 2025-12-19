"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Check, Mail, Shield, ShieldCheck, BadgeCheck } from "lucide-react";
import { z } from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { getInitials } from "@/lib/utils";
import { userSchema } from "./user-schema";
import { UserActions } from "./user-actions";

// Custom checkbox component
function CustomCheckbox({ checked, onCheckedChange, ariaLabel }: { checked: boolean; onCheckedChange: (val: boolean) => void; ariaLabel?: string }) {
  return (
    <div
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.stopPropagation();
        onCheckedChange(!checked);
      }}
      className={`
        flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border shadow-xs transition-colors cursor-pointer
        ${checked ? "bg-black border-black text-white dark:bg-white dark:border-white dark:text-black" : "border-zinc-400 bg-transparent"}
      `}
    >
      {checked && <Check className="h-3 w-3 stroke-[3]" />}
    </div>
  );
}

export const userColumns: ColumnDef<z.infer<typeof userSchema>>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <CustomCheckbox
          checked={table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          ariaLabel="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center cursor-pointer">
        <CustomCheckbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          ariaLabel="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3 min-w-[200px]">
          <Avatar className="h-8 w-8 border border-border/50">
            <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
            <AvatarFallback className="text-xs font-medium bg-muted">
              {getInitials(user.name || user.email || "U")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-sm truncate">{user.name || "Unknown Name"}</span>
              {user.role === "ADMIN" && (
                <BadgeCheck className="h-3 w-3 text-blue-500 shrink-0" />
              )}
            </div>
            <span className="text-xs text-muted-foreground truncate">{user.email || "No email"}</span>
          </div>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "orgRole",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
    cell: ({ row }) => {
      const role = row.original.orgRole;
      return (
        <div className="flex items-center gap-1.5 flex-wrap">
          {role === "OWNER" ? (
            <Badge variant="default" className="bg-indigo-600 hover:bg-indigo-700 gap-1 px-1.5 py-0.5 text-xs">
              <ShieldCheck className="h-2.5 w-2.5" />
              Owner
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1 px-1.5 py-0.5 text-xs">
              <Shield className="h-2.5 w-2.5" />
              Member
            </Badge>
          )}
          {row.original.role === "ADMIN" && (
            <Badge variant="outline" className="border-blue-500 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 text-xs">
              Admin
            </Badge>
          )}
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => {
      const email = row.original.email;
      return (
        <div className="flex items-center gap-1.5 text-muted-foreground min-w-[180px]">
          <Mail className="h-3 w-3 shrink-0 opacity-60" />
          <span className="text-xs truncate">{email || "No email"}</span>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "role",
    header: ({ column }) => <DataTableColumnHeader column={column} title="System" />,
    cell: ({ row }) => {
      const role = row.original.role;
      return (
        <Badge 
          variant={role === "ADMIN" ? "default" : "outline"}
          className={role === "ADMIN" ? "bg-blue-600 hover:bg-blue-700 px-1.5 py-0.5 text-xs" : "px-1.5 py-0.5 text-xs"}
        >
          {role === "ADMIN" ? "Admin" : "Client"}
        </Badge>
      );
    },
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <UserActions user={row.original} />,
    enableSorting: false,
  },
];

