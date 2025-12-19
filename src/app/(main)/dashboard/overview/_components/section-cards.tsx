"use client";

import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { endOfQuarter, format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/hooks/use-currency";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    throw error;
  }
  return res.json();
};

// Helper function to round target to next 1000
function roundToNextThousand(num: number) {
  return Math.ceil(num / 1000) * 1000;
}

export function SectionCards() {
  const { data, error, isLoading } = useSWR("/api/metrics", fetcher, { refreshInterval: 300000 }); // 5 mins
  const router = useRouter();
  const { formatCurrency } = useCurrency();

  if (error) {
    return (
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Error loading metrics</CardTitle>
            <CardDescription className="text-red-600">Please check connection</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="@container/card animate-pulse">
            <CardHeader>
              <div className="bg-muted mb-2 h-4 w-24 rounded"></div>
              <div className="bg-muted h-8 w-32 rounded"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  // Dynamic calculation for Money Saved badge (Monthly Progress)
  // If we saved 2100 and potential was 5000, we are at 42% of potential savings
  // Modified Logic: Target is rounded to next 1000
  const rawTarget = data.potentialMoneySaved || 0;
  const roundedTarget = roundToNextThousand(rawTarget);
  
  const savingsProgress = roundedTarget > 0 
    ? Math.round((data.moneySaved / roundedTarget) * 100) 
    : 0;

  // Date Logic: End of current quarter
  const endOfCurrentQuarter = endOfQuarter(new Date());
  const targetDateLabel = format(endOfCurrentQuarter, "do MMMM yyyy");

  // No-Show Rate Logic
  // Use the actual previous period rate for comparison, falling back to baseline if no history
  const previousRate = data.previousPeriodNoShowRate ?? data.baselineNoShowRate;
  const isImprovement = data.noShowRate < previousRate;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      
      {/* Money Saved Card */}
      <Card 
        className="@container/card cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
        onClick={() => router.push("/dashboard/finance")}
      >
        <CardHeader>
          <CardDescription>Money Saved This Month</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(data.moneySaved, { fromCurrency: "GBP", noDecimals: true })}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
              <TrendingUp className="mr-1 size-3" />
              {savingsProgress > 0 ? `${savingsProgress}% of Goal` : "On Track"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            From no-show reduction <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Target: {formatCurrency(roundedTarget, { fromCurrency: "GBP", noDecimals: true })} by {targetDateLabel}
          </div>
        </CardFooter>
      </Card>

      {/* Leads Captured Card */}
      <Card 
        className="@container/card cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
        onClick={() => router.push("/dashboard/crm")}
      >
        <CardHeader>
          <CardDescription>Leads Captured</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.leadsCaptured}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp className="mr-1 size-3" />
              Last 30 Days
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {data.roi?.savings ? `Potential: ${formatCurrency(data.roi.savings, { fromCurrency: "GBP", noDecimals: true })}` : "Strong pipeline"}{" "}
            <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">New patient inquiries</div>
        </CardFooter>
      </Card>

      {/* No-Show Rate Card */}
      <Card 
        className="@container/card cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
        onClick={() => router.push("/dashboard/crm")}
      >
        <CardHeader>
          <CardDescription>No-Show Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.noShowRate}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className={isImprovement ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}>
              <TrendingDown className="mr-1 size-3" />
              Target: {data.baselineNoShowRate}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {isImprovement ? "Significant improvement" : "Needs Attention"} <TrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">Was {previousRate}% previously</div>
        </CardFooter>
      </Card>

      {/* Time Saved Card */}
      <Card 
        className="@container/card cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
        onClick={() => router.push("/dashboard/crm")}
      >
        <CardHeader>
          <CardDescription>Time Saved</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.timeSaved}h
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp className="mr-1 size-3" />
              Automated
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Staff hours freed up <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Via automated reminders</div>
        </CardFooter>
      </Card>
    </div>
  );
}
