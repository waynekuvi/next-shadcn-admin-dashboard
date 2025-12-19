import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  Mic,
  Smartphone,
  Bell,
  RefreshCw,
  BarChart3,
  UserPlus,
  Users,
  Calendar,
  FileText,
  Settings,
  Plug,
  BellRing,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
  hidden?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Core",
    items: [
      {
        title: "Overview",
        url: "/dashboard/overview",
        icon: LayoutDashboard,
      },
      {
        title: "Messages",
        url: "/dashboard/messages",
        icon: MessageSquare,
      },
      {
        title: "Chatbot",
        url: "/dashboard/chatbot",
        icon: Bot,
      },
      {
        title: "AI Voice",
        url: "/dashboard/ai-voice",
        icon: Mic,
        isNew: true,
      },
      {
        title: "SMS",
        url: "/dashboard/sms",
        icon: Smartphone,
      },
    ],
  },
  {
    id: 2,
    label: "Management",
    items: [
      {
        title: "Leads",
        url: "/dashboard/leads",
        icon: UserPlus,
      },
      {
        title: "Team",
        url: "/dashboard/users",
        icon: Users,
      },
      {
        title: "Appointments",
        url: "/dashboard/appointments",
        icon: Calendar,
      },
      {
        title: "Templates",
        url: "/dashboard/templates",
        icon: FileText,
      },
    ],
  },
  {
    id: 3,
    label: "Configuration",
    items: [
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
      },
      {
        title: "Integrations",
        url: "/dashboard/integrations",
        icon: Plug,
      },
      {
        title: "Automations",
        url: "/dashboard/automations",
        icon: Zap,
      },
    ],
  },
];
