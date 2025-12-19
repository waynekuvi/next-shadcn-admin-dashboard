"use client";

import { UsersDataTable } from "./users-data-table";

interface UsersPageClientProps {
  members: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    orgRole: string;
    role: string;
  }[];
  organizationName: string;
}

export function UsersPageClient({ members, organizationName }: UsersPageClientProps) {
  return <UsersDataTable members={members} organizationName={organizationName} />;
}

