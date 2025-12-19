'use client';

import React, { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Webhook, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function WebhookConfig() {
  const { data: session } = useSWR('/api/auth/session', fetcher);
  const organizationId = session?.user?.organizationId;
  
  const { data: webhooksData, mutate } = useSWR(
    organizationId ? `/api/voice-calls/automation/webhooks?organizationId=${organizationId}` : null,
    fetcher
  );

  const [webhookName, setWebhookName] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState<string | null>(null);

  const webhooks = webhooksData?.webhooks || [];
  const availableEvents = [
    'status-update',
    'transcript-update',
    'end-of-call-report',
    'function-call',
    'hang'
  ];

  const handleCreateWebhook = async () => {
    if (!webhookName.trim() || !webhookUrl.trim()) {
      toast.error("Name and URL are required");
      return;
    }

    if (selectedEvents.length === 0) {
      toast.error("Select at least one event");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/voice-calls/automation/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: webhookName.trim(),
          url: webhookUrl.trim(),
          events: selectedEvents,
          organizationId,
          enabled: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Webhook created");
        setWebhookName("");
        setWebhookUrl("");
        setSelectedEvents([]);
        mutate();
        
        // Show secret to user (only shown once)
        if (data.webhook?.secret) {
          toast.info(`Webhook secret: ${data.webhook.secret}`, { duration: 10000 });
        }
      } else {
        throw new Error('Failed to create webhook');
      }
    } catch (error) {
      toast.error('Failed to create webhook');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleEvent = (event: string) => {
    if (selectedEvents.includes(event)) {
      setSelectedEvents(selectedEvents.filter(e => e !== event));
    } else {
      setSelectedEvents([...selectedEvents, event]);
    }
  };

  const handleToggleWebhook = async (webhookId: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/voice-calls/automation/webhooks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookId,
          enabled: !enabled
        })
      });

      if (response.ok) {
        mutate();
      } else {
        throw new Error('Failed to update webhook');
      }
    } catch (error) {
      toast.error('Failed to update webhook');
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm("Are you sure you want to delete this webhook?")) return;

    try {
      const response = await fetch(`/api/voice-calls/automation/webhooks?id=${webhookId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success("Webhook deleted");
        mutate();
      } else {
        throw new Error('Failed to delete webhook');
      }
    } catch (error) {
      toast.error('Failed to delete webhook');
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Webhook Form */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-4">Create Webhook</h3>
        <div className="space-y-3">
          <Input
            placeholder="Webhook name"
            value={webhookName}
            onChange={(e) => setWebhookName(e.target.value)}
          />
          <Input
            placeholder="https://your-server.com/webhook"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            type="url"
          />
          <div>
            <label className="text-sm font-medium mb-2 block">Events</label>
            <div className="grid grid-cols-2 gap-2">
              {availableEvents.map((event) => (
                <div key={event} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedEvents.includes(event)}
                    onCheckedChange={() => handleToggleEvent(event)}
                  />
                  <label className="text-sm">{event}</label>
                </div>
              ))}
            </div>
          </div>
          <Button onClick={handleCreateWebhook} disabled={isCreating}>
            <Plus className="w-4 h-4 mr-2" />
            Create Webhook
          </Button>
        </div>
      </Card>

      {/* Webhooks List */}
      <div>
        <h3 className="text-sm font-semibold mb-4">Webhooks ({webhooks.length})</h3>
        {webhooks.length === 0 ? (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground text-center">
              No webhooks configured yet
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {webhooks.map((webhook: any) => (
              <Card key={webhook.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Webhook className={cn(
                        "w-4 h-4",
                        webhook.enabled ? "text-green-500" : "text-muted-foreground"
                      )} />
                      <h4 className="text-sm font-semibold">{webhook.name}</h4>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded",
                        webhook.enabled 
                          ? "bg-green-500/10 text-green-600" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        {webhook.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{webhook.url}</p>
                    <p className="text-xs text-muted-foreground">
                      Events: {(webhook.events as string[]).join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleWebhook(webhook.id, webhook.enabled)}
                    >
                      {webhook.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteWebhook(webhook.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

