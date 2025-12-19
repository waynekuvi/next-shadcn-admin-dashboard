export type TrendTone = "success" | "warning" | "danger" | "info";

export interface StatCardData {
  readonly id: string;
  readonly title: string;
  readonly value: string;
  readonly icon: string;
  readonly subtitle?: string;
  readonly previous?: string;
  readonly trend: {
    readonly value: string;
    readonly tone: TrendTone;
    readonly direction: "up" | "down";
    readonly description?: string;
  };
}

export interface AutomationCardMetric {
  readonly label: string;
  readonly value: string;
}

export interface AutomationCardData {
  readonly id: string;
  readonly title: string;
  readonly statusLabel: string;
  readonly statusTone: TrendTone;
  readonly metrics: AutomationCardMetric[];
  readonly actionLabel: string;
  readonly actionHref?: string;
}

export interface LeadRowData {
  readonly id: string;
  readonly time: string;
  readonly name: string;
  readonly score: number;
  readonly issue: string;
  readonly status: string;
}

export interface RoiBreakdownSection {
  readonly label: string;
  readonly value: string;
}

export interface RoiData {
  readonly savings: RoiBreakdownSection[];
  readonly totalSavings: string;
  readonly costs: RoiBreakdownSection[];
  readonly totalCosts: string;
  readonly netProfit: string;
  readonly roi: string;
  readonly annualProjection: string;
}

export const dashboardMockData = {
  stats: [
    {
      id: "money-saved",
      title: "Money Saved This Month",
      value: "£3,245",
      icon: "💰",
      subtitle: "From no-show reduction",
      trend: {
        value: "+12.5%",
        tone: "success",
        direction: "up",
        description: "From no-show reduction",
      },
    },
    {
      id: "leads-captured",
      title: "Leads Captured",
      value: "127",
      icon: "📊",
      subtitle: "This month",
      trend: {
        value: "-20%",
        tone: "danger",
        direction: "down",
        description: "This month",
      },
    },
    {
      id: "no-show-rate",
      title: "No-Show Rate",
      value: "4%",
      icon: "📉",
      previous: "(Was 18%)",
      trend: {
        value: "+12.5% improvement",
        tone: "success",
        direction: "up",
        description: "Improvement vs last month",
      },
    },
    {
      id: "time-saved",
      title: "Time Saved",
      value: "42 hours",
      icon: "⏱️",
      subtitle: "Staff time freed",
      trend: {
        value: "+4.5%",
        tone: "success",
        direction: "up",
        description: "Staff time freed",
      },
    },
  ] satisfies StatCardData[],
  automations: [
    {
      id: "chatbot",
      title: "🤖 Chatbot - Lead Capture",
      statusLabel: "ACTIVE",
      statusTone: "success",
      metrics: [
        { label: "Leads Today", value: "5" },
        { label: "Leads This Month", value: "127" },
        { label: "Avg Response Time", value: "1.2 mins" },
        { label: "Conversion Rate", value: "78%" },
      ],
      actionLabel: "View Details",
      actionHref: "#",
    },
    {
      id: "appointment-reminders",
      title: "📅 Appointment Reminders",
      statusLabel: "ACTIVE",
      statusTone: "success",
      metrics: [
        { label: "Reminders Sent Today", value: "12" },
        { label: "This Month", value: "342" },
        { label: "Confirmation Rate", value: "85%" },
        { label: "No-Show Rate", value: "4% (was 18%)" },
      ],
      actionLabel: "View Schedule",
      actionHref: "#",
    },
    {
      id: "review-collection",
      title: "⭐ Review Collection",
      statusLabel: "ACTIVE",
      statusTone: "success",
      metrics: [
        { label: "Reviews Requested", value: "89" },
        { label: "Reviews Received", value: "37" },
        { label: "Collection Rate", value: "42%" },
        { label: "Avg Rating", value: "4.8★" },
      ],
      actionLabel: "Recent Reviews",
      actionHref: "#",
    },
  ] satisfies AutomationCardData[],
  hotLeads: [
    {
      id: "sarah-johnson",
      time: "2 mins ago",
      name: "Sarah Johnson",
      score: 95,
      issue: "Emergency",
      status: "New",
    },
    {
      id: "mike-roberts",
      time: "15 mins ago",
      name: "Mike Roberts",
      score: 92,
      issue: "Veneers",
      status: "Contacted",
    },
    {
      id: "emma-davies",
      time: "1 hour ago",
      name: "Emma Davies",
      score: 78,
      issue: "Checkup",
      status: "Booked",
    },
    {
      id: "tom-wilson",
      time: "2 hours ago",
      name: "Tom Wilson",
      score: 68,
      issue: "Whitening",
      status: "Pending",
    },
    {
      id: "lucy-brown",
      time: "3 hours ago",
      name: "Lucy Brown",
      score: 45,
      issue: "Info Request",
      status: "Responded",
    },
  ] satisfies LeadRowData[],
  roi: {
    savings: [
      { label: "No-shows prevented", value: "£3,245" },
      { label: "After-hours leads", value: "£1,145" },
      { label: "Staff time saved", value: "£600" },
    ],
    totalSavings: "£4,990",
    costs: [
      { label: "Subscription", value: "£199" },
      { label: "SMS Credits", value: "£42" },
    ],
    totalCosts: "£241",
    netProfit: "£4,749/month",
    roi: "19.7x",
    annualProjection: "£56,988",
  } satisfies RoiData,
} as const;

export type DashboardMockData = typeof dashboardMockData;

