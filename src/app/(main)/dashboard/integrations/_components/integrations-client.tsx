"use client";

import { useState } from "react";
import {
  Plug,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Settings,
  Calendar,
  MessageSquare,
  Bot,
  Mic,
  Sheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

type Integration = {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
  category: "Communication" | "Data" | "Automation";
  status: "connected" | "not_connected" | "configured";
  settingsUrl?: string;
  docsUrl?: string;
};

export function IntegrationsClient({ organization }: { organization: any }) {
  const router = useRouter();

  const integrations: Integration[] = [
    {
      id: "google-sheets",
      name: "Google Sheets",
      description: "Sync leads and data with Google Sheets",
      icon: Sheet,
      enabled: !!organization.googleSheetId,
      category: "Data",
      status: organization.googleSheetId ? "connected" : "not_connected",
      settingsUrl: "/dashboard/settings?section=integrations",
    },
    {
      id: "vapi-voice",
      name: "Vapi Voice AI",
      description: "AI-powered voice calls and assistants",
      icon: Mic,
      enabled: organization.voiceAiEnabled,
      category: "Communication",
      status: organization.voiceAiEnabled && organization.vapiApiKey ? "connected" : organization.vapiAssistantId ? "configured" : "not_connected",
      settingsUrl: "/dashboard/settings?section=integrations",
    },
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Sync appointments with Google Calendar",
      icon: Calendar,
      enabled: organization.googleCalendarEnabled,
      category: "Automation",
      status: organization.googleCalendarEnabled && organization.googleCalendarId ? "connected" : "not_connected",
      settingsUrl: "/dashboard/settings?section=integrations",
    },
    {
      id: "sms-vonage",
      name: "SMS (Vonage/n8n)",
      description: "Send SMS campaigns via Vonage and n8n workflows",
      icon: MessageSquare,
      enabled: organization.smsEnabled,
      category: "Communication",
      status: organization.smsEnabled && (organization.smsReminderWebhookUrl || organization.smsFollowUpWebhookUrl) ? "connected" : organization.smsEnabled ? "configured" : "not_connected",
      settingsUrl: "/dashboard/settings?section=integrations",
      docsUrl: "/dashboard/sms",
    },
    {
      id: "chatbot",
      name: "Chatbot",
      description: "Customizable chatbot for your website",
      icon: Bot,
      enabled: !!organization.chatbotEmbedCode,
      category: "Communication",
      status: organization.chatbotEmbedCode ? "connected" : "not_connected",
      settingsUrl: "/dashboard/chatbot",
    },
  ];

  const getStatusBadge = (status: Integration["status"]) => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Connected
          </Badge>
        );
      case "configured":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Settings className="mr-1 h-3 w-3" />
            Configured
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <XCircle className="mr-1 h-3 w-3" />
            Not Connected
          </Badge>
        );
    }
  };

  const categories = ["All", "Communication", "Data", "Automation"] as const;
  const [selectedCategory, setSelectedCategory] = useState<typeof categories[number]>("All");

  const filteredIntegrations = selectedCategory === "All"
    ? integrations
    : integrations.filter(i => i.category === selectedCategory);

  const connectedCount = integrations.filter(i => i.status === "connected").length;
  const totalCount = integrations.length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">Available integrations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Connected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{connectedCount}</div>
            <p className="text-xs text-muted-foreground">Active connections</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalCount - connectedCount}</div>
            <p className="text-xs text-muted-foreground">Ready to connect</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredIntegrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <Card key={integration.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {integration.description}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(integration.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {integration.category}
                  </Badge>
                  <div className="flex gap-2">
                    {integration.settingsUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(integration.settingsUrl!)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Configure
                      </Button>
                    )}
                    {integration.docsUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(integration.docsUrl!)}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredIntegrations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Plug className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No integrations found in this category</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" />
            Need More Integrations?
          </CardTitle>
          <CardDescription>
            We're constantly adding new integrations. Contact support to request a new integration or check our roadmap.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">
            <ExternalLink className="mr-2 h-4 w-4" />
            View Integration Roadmap
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}





