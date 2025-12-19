"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";
import { Shield, ShieldCheck } from "lucide-react";

interface TeamListProps {
  members: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    orgRole: string;
  }[];
}

export function TeamList({ members }: TeamListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <CardDescription>Users with access to this organization.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={member.image || undefined} alt={member.name || "User"} />
                  <AvatarFallback>{getInitials(member.name || member.email || "U")}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{member.name || "Unknown Name"}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
              </div>
              <div>
                {member.orgRole === "OWNER" ? (
                  <Badge variant="default" className="flex gap-1 items-center bg-indigo-600 hover:bg-indigo-700">
                    <ShieldCheck className="h-3 w-3" /> Owner
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex gap-1 items-center">
                    <Shield className="h-3 w-3" /> Member
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

