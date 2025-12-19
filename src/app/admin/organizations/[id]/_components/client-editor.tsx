"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Image as ImageIcon, Building2, Link2, Copy, Settings, Plug, Phone, Calendar, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  name: z.string().min(2, "Organization name is required"),
  logo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  contactEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  timezone: z.string().optional(),
  isActive: z.boolean().default(true),
  googleSheetId: z.string().optional().or(z.literal("")),
  chatbotEmbedCode: z.string().optional().or(z.literal("")),
  // Vapi Integration
  vapiApiKey: z.string().optional().or(z.literal("")),
  vapiAssistantId: z.string().optional().or(z.literal("")),
  voiceAiEnabled: z.boolean().default(false),
  // Google Calendar Integration
  googleCalendarId: z.string().optional().or(z.literal("")),
  googleCalendarEnabled: z.boolean().default(false),
  // SMS
  smsEnabled: z.boolean().default(false),
  smsReminderWebhookUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  smsFollowUpWebhookUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  // Chatbot Webhook
  chatbotWebhookUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export function ClientEditor({ organization }: { organization: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: organization.name,
      logo: organization.logo || "",
      contactEmail: organization.contactEmail || "",
      timezone: organization.timezone || "UTC",
      isActive: organization.isActive,
      googleSheetId: organization.googleSheetId || "",
      chatbotEmbedCode: organization.chatbotEmbedCode || "",
      vapiApiKey: organization.vapiApiKey || "",
      vapiAssistantId: organization.vapiAssistantId || "",
      voiceAiEnabled: organization.voiceAiEnabled || false,
      googleCalendarId: organization.googleCalendarId || "",
      googleCalendarEnabled: organization.googleCalendarEnabled || false,
      smsEnabled: organization.smsEnabled || false,
      smsReminderWebhookUrl: organization.smsReminderWebhookUrl || "",
      smsFollowUpWebhookUrl: organization.smsFollowUpWebhookUrl || "",
      chatbotWebhookUrl: organization.chatbotWebhookUrl || "",
    },
  });

  const apiBaseUrl = useMemo(() => {
    if (typeof window !== "undefined") return window.location.origin;
    return process.env.NEXT_PUBLIC_APP_URL || "";
  }, []);

  const handleGenerateEmbed = async () => {
    const webhookUrl = form.getValues("chatbotWebhookUrl") || organization.chatbotWebhookUrl;
    if (!webhookUrl) {
      toast.error("Webhook URL is required to generate embed code");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/chatbot/generate-embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: organization.id,
          webhookUrl,
          apiBaseUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to generate embed code");
      }

      form.setValue("chatbotEmbedCode", data.embedCode || "");
      toast.success("Embed code generated and filled in");
    } catch (error: any) {
      toast.error(error?.message || "Error generating embed code");
    } finally {
      setIsGenerating(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/organization/${organization.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Failed to update organization");
      }

      toast.success("Organization updated successfully");
      router.refresh();
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error?.message || "Error updating organization");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Organization Settings</CardTitle>
            <CardDescription>Manage identity, configuration, and integrations.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="general">
                      <Settings className="h-4 w-4 mr-2" />
                      General
                    </TabsTrigger>
                    <TabsTrigger value="integrations">
                      <Plug className="h-4 w-4 mr-2" />
                      Integrations
                    </TabsTrigger>
                  </TabsList>

                  {/* General Tab */}
                  <TabsContent value="general" className="space-y-8 mt-6">
                    {/* Identity */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <Building2 className="h-4 w-4" />
                        <h3>Identity</h3>
                      </div>
                      <Separator />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem className="col-span-2 sm:col-span-1">
                              <FormLabel>Practice Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="contactEmail"
                          render={({ field }) => (
                            <FormItem className="col-span-2 sm:col-span-1">
                              <FormLabel>Contact Email</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="logo"
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Brand Logo URL</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <ImageIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input className="pl-9" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Configuration */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <Link2 className="h-4 w-4" />
                        <h3>Configuration</h3>
                      </div>
                      <Separator />
                      <div className="grid gap-4">
                        <FormField
                          control={form.control}
                          name="timezone"
                          render={({ field }) => (
                            <FormItem className="sm:w-1/2">
                              <FormLabel>Timezone</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Active Status</FormLabel>
                                <FormDescription>
                                  Disable to temporarily block access for all users in this org.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Integrations Tab */}
                  <TabsContent value="integrations" className="space-y-8 mt-6">
                    {/* Voice AI Integration */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <Phone className="h-4 w-4" />
                        <h3>Voice AI (Vapi)</h3>
                      </div>
                      <Separator />
                      <div className="grid gap-4">
                        <FormField
                          control={form.control}
                          name="voiceAiEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Enable Voice AI</FormLabel>
                                <FormDescription>
                                  Allow this organization to use AI Receptionist features.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        {form.watch("voiceAiEnabled") && (
                          <>
                            <FormField
                              control={form.control}
                              name="vapiApiKey"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Vapi API Key</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="password"
                                      placeholder="vapi_..." 
                                      {...field} 
                                      className="font-mono" 
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    The organization's Vapi API key for voice calls.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="vapiAssistantId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Default Assistant ID</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="asst_..." 
                                      {...field} 
                                      className="font-mono" 
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    The default Vapi assistant to handle calls.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}
                      </div>
                    </div>

                    {/* Google Calendar Integration */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <Calendar className="h-4 w-4" />
                        <h3>Google Calendar</h3>
                      </div>
                      <Separator />
                      <div className="grid gap-4">
                        <FormField
                          control={form.control}
                          name="googleCalendarEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Enable Calendar Sync</FormLabel>
                                <FormDescription>
                                  Sync appointments with Google Calendar.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        {form.watch("googleCalendarEnabled") && (
                          <FormField
                            control={form.control}
                            name="googleCalendarId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Calendar ID</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="primary or calendar@group.calendar.google.com" 
                                    {...field} 
                                    className="font-mono" 
                                  />
                                </FormControl>
                                <FormDescription>
                                  The Google Calendar ID for appointment booking.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </div>

                    {/* SMS Campaigns */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <Smartphone className="h-4 w-4" />
                        <h3>SMS Campaigns</h3>
                      </div>
                      <Separator />
                      <div className="grid gap-4">
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
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {form.watch("smsEnabled") && (
                          <>
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
                                      placeholder="https://your-n8n.com/webhook/sms-reminder"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    n8n webhook URL for appointment reminder campaigns.
                                  </FormDescription>
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
                                      placeholder="https://your-n8n.com/webhook/sms-followup"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    n8n webhook URL for appointment follow-up campaigns.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}
                      </div>
                    </div>

                    {/* Data Sync & Chatbot */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <Plug className="h-4 w-4" />
                        <h3>Data Sync & Chatbot</h3>
                      </div>
                      <Separator />
                      <div className="grid gap-6">
                        <FormField
                          control={form.control}
                          name="googleSheetId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Google Sheet ID (Optional)</FormLabel>
                              <FormControl>
                                <Input {...field} className="font-mono" />
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
                          name="chatbotWebhookUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Chatbot Webhook URL</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://n8n.example.com/webhook/..." 
                                  {...field} 
                                  className="font-mono" 
                                />
                              </FormControl>
                              <FormDescription>
                                n8n or custom webhook URL for chatbot integrations.
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
                                  className="font-mono text-xs min-h-[200px]" 
                                  placeholder="<div id='uplinq-chat-root'></div>&#10;<script>...</script>"
                                />
                              </FormControl>
                              <FormDescription>
                                Paste your chatbot embed code here. This will be available to all users in this organization on the Chatbot page.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex flex-col gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={isGenerating}
                            onClick={handleGenerateEmbed}
                          >
                            {isGenerating ? "Generating..." : "Generate Embed Code"}
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Uses the webhook URL above and this organization ID to create an embed code that fetches the latest customization dynamically.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Info Panel */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Join Code</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-3 py-2 rounded border font-mono text-lg font-bold text-center">
                  {organization.joinCode}
                </code>
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={() => {
                    navigator.clipboard.writeText(organization.joinCode);
                    toast.success("Copied");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

