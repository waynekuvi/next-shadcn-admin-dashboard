"use client";

import { AuthProvider } from "@/components/providers/auth-provider";
import * as React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
