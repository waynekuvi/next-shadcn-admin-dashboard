"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getInitials } from "@/lib/utils";
import { Shield, ShieldCheck } from "lucide-react";

interface MembersTableProps {
  members: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    orgRole: string;
    role?: string;
  }[];
}

export function MembersTable({ members }: MembersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={member.image || undefined} alt={member.name || "User"} />
                  <AvatarFallback>{getInitials(member.name || member.email || "U")}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">
                {member.name || "Unknown Name"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {member.email}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {member.orgRole === "OWNER" ? (
                    <Badge variant="default" className="bg-indigo-600 hover:bg-indigo-700 gap-1">
                      <ShieldCheck className="h-3 w-3" /> Owner
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" /> Member
                    </Badge>
                  )}
                  {member.role === "ADMIN" && (
                    <Badge variant="outline" className="border-blue-500 text-blue-600 dark:text-blue-400">
                      Admin
                    </Badge>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

