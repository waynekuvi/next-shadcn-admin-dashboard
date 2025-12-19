import { ColumnDef } from "@tanstack/react-table";
import { CircleCheck, Loader, EllipsisVertical, Phone, Mail, Check } from "lucide-react";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DataTableColumnHeader } from "../../../../../components/data-table/data-table-column-header";

import { sectionSchema } from "./schema";
import { LeadActions } from "./lead-actions";

// Custom checkbox that guarantees high-contrast state immediately
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
        ${checked ? "bg-black border-black text-white" : "border-zinc-400 bg-transparent"}
      `}
    >
      {checked && <Check className="h-3 w-3 stroke-[3]" />}
    </div>
  );
}

export const dashboardColumns: ColumnDef<z.infer<typeof sectionSchema>>[] = [
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
    header: ({ column }) => <DataTableColumnHeader column={column} title="Patient Name" />,
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-muted-foreground text-xs">{new Date(row.original.timestamp).toLocaleDateString()}</span>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "category",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
    cell: ({ row }) => {
      const category = row.original.category.toUpperCase();
      let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
      if (category === "HOT") variant = "destructive";
      if (category === "WARM") variant = "default"; // or something else
      if (category === "COLD") variant = "secondary";

      return (
        <div className="w-24">
          <Badge variant={variant} className="px-1.5">
            {row.original.category}
          </Badge>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.status === "Booked" || row.original.status === "Won" ? (
          <CircleCheck className="stroke-border mr-1 size-3 fill-green-500 dark:fill-green-400" />
        ) : (
          <Loader className="mr-1 size-3" />
        )}
        {row.original.status}
      </Badge>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "score",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Score" />,
    cell: ({ row }) => <div className="font-medium">{row.original.score}</div>,
    enableSorting: true,
  },
  {
    accessorKey: "phone",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Contact" />,
    cell: ({ row }) => (
      <div className="text-muted-foreground flex flex-col gap-1 text-xs">
        <div className="flex items-center gap-1">
          <Phone className="size-3" /> {row.original.phone}
        </div>
        <div className="flex items-center gap-1">
          <Mail className="size-3" /> {row.original.email}
        </div>
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "source",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Source" />,
    cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.source}</span>,
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <LeadActions lead={row.original} />,
    enableSorting: false,
  },
];
