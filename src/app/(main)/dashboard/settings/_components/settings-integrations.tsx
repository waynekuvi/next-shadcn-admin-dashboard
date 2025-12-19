"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const configSchema = z.object({
  googleSheetId: z.string().min(5, "Google Sheet ID is required"),
  timezone: z.string().optional(),
  chatbotEmbedCode: z.string().optional(),
  // SMS Settings
  smsEnabled: z.boolean().default(false),
  smsReminderWebhookUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  smsFollowUpWebhookUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export function SettingsIntegrations({ organization, isReadOnly }: { organization: any; isReadOnly: boolean }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof configSchema>>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      googleSheetId: organization.googleSheetId,
      timezone: organization.timezone || "UTC",
      chatbotEmbedCode: organization.chatbotEmbedCode || "",
      smsEnabled: organization.smsEnabled || false,
      smsReminderWebhookUrl: organization.smsReminderWebhookUrl || "",
      smsFollowUpWebhookUrl: organization.smsFollowUpWebhookUrl || "",
    },
  });

  async function onSubmit(values: z.infer<typeof configSchema>) {
    if (isReadOnly) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/organization/${organization.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to update configuration");

      toast.success("Configuration updated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Error updating configuration");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-6 pt-6 pb-4">
        <CardTitle>Integrations & Configuration</CardTitle>
        <CardDescription>
          Manage external connections and regional settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <FormField
              control={form.control}
              name="googleSheetId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Sheet ID</FormLabel>
                  <FormControl>
                    <Input {...field} className="font-mono" disabled={isReadOnly} />
                  </FormControl>
                  <FormDescription>
                    The ID of the Google Sheet used for data synchronization.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem className="sm:w-1/2">
                  <FormLabel>Timezone</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="America/New_York">New York</SelectItem>
                      <SelectItem value="America/Los_Angeles">Los Angeles</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Used for accurate reporting and notifications.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="chatbotEmbedCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chatbot Embed Code</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      className="font-mono text-xs min-h-[150px]" 
                      disabled={isReadOnly}
                      placeholder="<div id='uplinq-chat-root'></div>&#10;<script>...</script>"
                    />
                  </FormControl>
                  <FormDescription>
                    Paste your chatbot embed code here. This will be available to all users in your organization on the Chatbot page.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Smartphone className="h-4 w-4" />
                <h3>SMS Campaigns</h3>
              </div>

              <FormField
                control={form.control}
                name="smsEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable SMS Campaigns</FormLabel>
                      <FormDescription>
                        Allow appointment reminders and follow-ups via SMS.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isReadOnly} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("smsEnabled") && (
                <div className="space-y-4 pl-4 border-l-2">
                  <FormField
                    control={form.control}
                    name="smsReminderWebhookUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reminder Webhook URL</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="font-mono text-xs"
                            disabled={isReadOnly}
                            placeholder="https://your-n8n.com/webhook/sms-reminder"
                          />
                        </FormControl>
                        <FormDescription>n8n webhook URL for appointment reminder campaigns.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="smsFollowUpWebhookUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Follow-up Webhook URL</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="font-mono text-xs"
                            disabled={isReadOnly}
                            placeholder="https://your-n8n.com/webhook/sms-followup"
                          />
                        </FormControl>
                        <FormDescription>n8n webhook URL for appointment follow-up campaigns.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {!isReadOnly && (
              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

