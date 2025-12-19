"use client";

import useSWR from "swr";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Loader2, PauseCircle, PlayCircle, RefreshCw, Plus, MessagesSquare, TestTube } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const campaignSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["REMINDER", "FOLLOW_UP"]),
  trigger: z.enum(["APPOINTMENT_BOOKED", "APPOINTMENT_COMPLETED"]),
  isActive: z.boolean().default(true),
});

const messageSchema = z.object({
  campaignId: z.string().min(1),
  sequence: z.coerce.number().min(1),
  delay: z.coerce.number().min(0),
  message: z.string().min(1),
});

type CampaignForm = z.infer<typeof campaignSchema>;
type MessageForm = z.infer<typeof messageSchema>;

export function SMSCampaignsClient() {
  const { data, isLoading, mutate } = useSWR<{ campaigns: any[] }>("/api/sms/campaigns", fetcher);
  const [creating, setCreating] = useState(false);

  const form = useForm<CampaignForm>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      type: "REMINDER",
      trigger: "APPOINTMENT_BOOKED",
      isActive: true,
    },
  });

  async function onCreate(values: CampaignForm) {
    setCreating(true);
    try {
      const res = await fetch("/api/sms/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to create campaign");
      toast.success("Campaign created");
      form.reset({ name: "", type: "REMINDER", trigger: "APPOINTMENT_BOOKED", isActive: true });
      mutate();
    } catch (error: any) {
      toast.error(error?.message || "Error creating campaign");
    } finally {
      setCreating(false);
    }
  }

  async function togglePause(campaign: any) {
    try {
      const res = await fetch("/api/sms/campaigns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: campaign.id, isPaused: !campaign.isPaused }),
      });
      if (!res.ok) throw new Error("Failed to update campaign");
      toast.success(!campaign.isPaused ? "Campaign paused" : "Campaign resumed");
      mutate();
    } catch (error: any) {
      toast.error(error?.message || "Error updating campaign");
    }
  }

  async function toggleActive(campaign: any) {
    try {
      const res = await fetch("/api/sms/campaigns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: campaign.id, isActive: !campaign.isActive }),
      });
      if (!res.ok) throw new Error("Failed to update campaign");
      toast.success(!campaign.isActive ? "Campaign activated" : "Campaign deactivated");
      mutate();
    } catch (error: any) {
      toast.error(error?.message || "Error updating campaign");
    }
  }

  async function deleteCampaign(id: string) {
    if (!confirm("Delete this campaign?")) return;
    try {
      const res = await fetch(`/api/sms/campaigns?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete campaign");
      toast.success("Campaign deleted");
      mutate();
    } catch (error: any) {
      toast.error(error?.message || "Error deleting campaign");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading SMS campaigns...
      </div>
    );
  }

  const campaigns = data?.campaigns || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">SMS Campaigns</h1>
          <p className="text-sm text-muted-foreground">Plug-and-play reminders and follow-ups for appointments.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => mutate()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Campaign</CardTitle>
          <CardDescription>Define default SMS campaigns for reminders or follow-ups.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input placeholder="Reminder Sequence" {...form.register("name")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select defaultValue={form.getValues("type")} onValueChange={(v) => form.setValue("type", v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REMINDER">Reminder</SelectItem>
                  <SelectItem value="FOLLOW_UP">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Trigger</label>
              <Select defaultValue={form.getValues("trigger")} onValueChange={(v) => form.setValue("trigger", v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPOINTMENT_BOOKED">Appointment Booked</SelectItem>
                  <SelectItem value="APPOINTMENT_COMPLETED">Appointment Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Auto-run for matching appointments.</p>
              </div>
              <Switch checked={form.watch("isActive")} onCheckedChange={(v) => form.setValue("isActive", v)} />
            </div>
          </div>
          <Button onClick={form.handleSubmit(onCreate)} disabled={creating}>
            {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Create Campaign
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {campaigns.length === 0 && (
          <div className="text-sm text-muted-foreground border rounded-lg p-6">No campaigns yet. Create one above.</div>
        )}

        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {campaign.name}
                  <Badge variant={campaign.type === "REMINDER" ? "default" : "secondary"}>
                    {campaign.type === "REMINDER" ? "Reminder" : "Follow-up"}
                  </Badge>
                  <Badge variant="outline">{campaign.trigger.replace("APPOINTMENT_", "").replace("_", " ")}</Badge>
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <Badge variant={campaign.isActive ? "success" : "secondary"}>
                    {campaign.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant={campaign.isPaused ? "destructive" : "outline"}>
                    {campaign.isPaused ? "Paused" : "Running"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {campaign.messages?.length || 0} messages • {campaign._count?.executions || 0} executions
                  </span>
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 relative">
                <TestCampaignButton campaign={campaign} />
                <Button variant="outline" size="sm" onClick={() => toggleActive(campaign)}>
                  <Switch checked={campaign.isActive} onCheckedChange={() => toggleActive(campaign)} className="mr-2" />
                  Active
                </Button>
                <Button variant="secondary" size="sm" onClick={() => togglePause(campaign)}>
                  {campaign.isPaused ? (
                    <PlayCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <PauseCircle className="h-4 w-4 mr-2" />
                  )}
                  {campaign.isPaused ? "Resume" : "Pause"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteCampaign(campaign.id)}>
                  Delete
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <MessageList campaign={campaign} onChanged={mutate} />
              <Separator />
              <AddMessageForm campaignId={campaign.id} onChanged={mutate} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MessageList({ campaign, onChanged }: { campaign: any; onChanged: () => void }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function deleteMessage(id: string) {
    if (!confirm("Delete this message?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/sms/messages?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete message");
      toast.success("Message deleted");
      onChanged();
    } catch (error: any) {
      toast.error(error?.message || "Error deleting message");
    } finally {
      setDeletingId(null);
    }
  }

  const messages = campaign.messages || [];

  if (messages.length === 0) {
    return <p className="text-sm text-muted-foreground">No messages yet.</p>;
  }

  return (
    <div className="space-y-3">
      {messages.map((msg: any) => (
        <div key={msg.id} className="border rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Seq {msg.sequence}</Badge>
              <Badge variant="secondary">{msg.delay}h delay</Badge>
            </div>
            <Button variant="ghost" size="sm" disabled={deletingId === msg.id} onClick={() => deleteMessage(msg.id)}>
              {deletingId === msg.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
          </div>
          <p className="text-sm whitespace-pre-wrap mt-2">{msg.message}</p>
        </div>
      ))}
    </div>
  );
}

function TestCampaignButton({ campaign }: { campaign: any }) {
  const [open, setOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<string>("");
  const { data: appointmentsData } = useSWR<{ appointments: any[] }>("/api/appointments?limit=10", fetcher);

  async function runTest() {
    if (!selectedAppointment) {
      toast.error("Please select an appointment");
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/sms/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: selectedAppointment,
          type: campaign.type,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Test failed");
      setTestResult(data);
      toast.success("Test executed! No SMS sent, no credits used.");
    } catch (error: any) {
      toast.error(error?.message || "Test failed");
      setTestResult({ error: error?.message || "Test failed" });
    } finally {
      setTesting(false);
    }
  }

  const appointments = appointmentsData?.appointments || [];

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <TestTube className="h-4 w-4 mr-2" />
        Test
      </Button>
    );
  }

  return (
    <div className="absolute z-50 bg-background border rounded-lg shadow-lg p-4 w-96 max-h-[80vh] overflow-y-auto">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Test Campaign</h3>
            <p className="text-xs text-muted-foreground">No SMS sent, no credits used</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { setOpen(false); setTestResult(null); }}>
            ×
          </Button>
        </div>

        {appointments.length === 0 ? (
          <div className="text-sm text-muted-foreground p-4 border rounded-lg">
            No appointments found. Create an appointment first.
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Appointment</label>
              <Select value={selectedAppointment} onValueChange={setSelectedAppointment}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose appointment..." />
                </SelectTrigger>
                <SelectContent>
                  {appointments.map((apt) => (
                    <SelectItem key={apt.id} value={apt.id}>
                      {apt.customerName} - {new Date(apt.date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={runTest} disabled={testing || !selectedAppointment} className="w-full">
              {testing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Run Test
            </Button>

            {testResult && (
              <div className="border rounded-lg p-4 space-y-2">
                {testResult.error ? (
                  <div className="text-sm text-destructive">{testResult.error}</div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Check className="h-4 w-4" />
                      <span className="font-medium text-sm">Test Successful!</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><strong>Status:</strong> {testResult.execution?.status}</p>
                      <div className="mt-2 p-2 bg-muted rounded">
                        <p className="font-medium mb-1 text-xs">Message Preview:</p>
                        <p className="text-xs">{testResult.execution?.message}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{testResult.execution?.note}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function AddMessageForm({ campaignId, onChanged }: { campaignId: string; onChanged: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<MessageForm>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      campaignId,
      sequence: 1,
      delay: 0,
      message: "",
    },
  });

  async function onSubmit(values: MessageForm) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/sms/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to add message");
      toast.success("Message added");
      form.reset({ campaignId, sequence: values.sequence + 1, delay: values.delay, message: "" });
      onChanged();
    } catch (error: any) {
      toast.error(error?.message || "Error adding message");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <MessagesSquare className="h-4 w-4" />
        Add Message
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Sequence</label>
          <Input type="number" min={1} {...form.register("sequence", { valueAsNumber: true })} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Delay (hours)</label>
          <Input type="number" min={0} step={0.5} {...form.register("delay", { valueAsNumber: true })} />
        </div>
        <div className="space-y-1 md:col-span-3">
          <label className="text-sm font-medium">Message</label>
          <Textarea rows={3} {...form.register("message")} placeholder="Hi {{name}}, your appointment is on {{date}} at {{time}}." />
        </div>
      </div>
      <div className="flex justify-end">
        <Button size="sm" onClick={form.handleSubmit(onSubmit)} disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          <Plus className="h-4 w-4 mr-2" />
          Add Message
        </Button>
      </div>
    </div>
  );
}

