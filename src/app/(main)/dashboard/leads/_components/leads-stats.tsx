"use client";

import * as React from "react";
import { TrendingUp, UserPlus, Phone } from "lucide-react";
import useSWR from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

export function LeadsStats() {
  const { data, isLoading } = useSWR("/api/leads", fetcher, { refreshInterval: 60000 });

  const stats = React.useMemo(() => {
    if (!data?.leads) {
      return {
        total: 0,
        new: 0,
        contacted: 0,
        booked: 0,
        hot: 0,
        warm: 0,
        cold: 0,
      };
    }

    const leads = data.leads;
    return {
      total: leads.length,
      new: leads.filter((l: any) => l.status === "New").length,
      contacted: leads.filter((l: any) => l.status === "Contacted").length,
      booked: leads.filter((l: any) => l.status === "Booked" || l.status === "Won").length,
      hot: leads.filter((l: any) => l.category === "HOT").length,
      warm: leads.filter((l: any) => l.category === "WARM").length,
      cold: leads.filter((l: any) => l.category === "COLD").length,
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="bg-muted h-4 w-24 rounded"></div>
              <div className="bg-muted h-8 w-32 rounded mt-2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription>Total Leads</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {stats.total}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserPlus className="h-4 w-4" />
            <span>All leads in system</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>New Leads</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {stats.new}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <TrendingUp className="mr-1 h-3 w-3" />
            Needs attention
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Contacted</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {stats.contacted}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>In progress</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Booked / Won</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {stats.booked}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <TrendingUp className="mr-1 h-3 w-3" />
            Converted
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}

