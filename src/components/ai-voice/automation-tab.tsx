'use client';

import React from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Zap, Webhook, Route } from "lucide-react";
import { RuleBuilder } from "./rule-builder";
import { WebhookConfig } from "./webhook-config";

export function AutomationTab() {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-6 border-b border-border">
        <h2 className="text-2xl font-semibold">Automation & Workflows</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Automate call management with rules, webhooks, and integrations
        </p>
      </div>

      <Tabs defaultValue="rules" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 border-b border-border">
          <TabsList className="bg-transparent h-auto p-0 gap-1">
            <TabsTrigger value="rules" className="gap-2">
              <Zap className="w-4 h-4" />
              <span>Rules</span>
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="gap-2">
              <Webhook className="w-4 h-4" />
              <span>Webhooks</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2">
              <Route className="w-4 h-4" />
              <span>Integrations</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="rules" className="flex-1 mt-0 overflow-auto p-6">
          <RuleBuilder />
        </TabsContent>

        <TabsContent value="webhooks" className="flex-1 mt-0 overflow-auto p-6">
          <WebhookConfig />
        </TabsContent>

        <TabsContent value="integrations" className="flex-1 mt-0 overflow-auto p-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Integrations</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect with other services and automate workflows.
            </p>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Auto-Create Leads</h4>
                <p className="text-sm text-muted-foreground">
                  Automatically create leads from calls with contact information.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Auto-Create Reminders</h4>
                <p className="text-sm text-muted-foreground">
                  Automatically create reminders from call tasks.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

