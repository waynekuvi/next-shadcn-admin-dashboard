"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMemo, useState } from "react";
import { Loader2, Copy, Check, AlertCircle, Image as ImageIcon, Globe, Mail, Building2, Link2, Phone, Calendar, Plug, Settings, Smartphone } from "lucide-react";
import { toast } from "sonner";

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  googleSheetId: z.string().optional().or(z.literal("")),
  logo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  contactEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  timezone: z.string().optional(),
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
  // Chatbot Embed Code
  chatbotEmbedCode: z.string().optional().or(z.literal("")),
});

export default function CreateClientPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [createdOrg, setCreatedOrg] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEmbed, setGeneratedEmbed] = useState("");
  const [generatorWebhook, setGeneratorWebhook] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      googleSheetId: "",
      logo: "",
      contactEmail: "",
      timezone: "UTC",
      vapiApiKey: "",
      vapiAssistantId: "",
      voiceAiEnabled: false,
      googleCalendarId: "",
      googleCalendarEnabled: false,
      smsEnabled: false,
      smsReminderWebhookUrl: "",
      smsFollowUpWebhookUrl: "",
      chatbotWebhookUrl: "",
      chatbotEmbedCode: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/organization/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create organization");
      }

      setCreatedOrg(data.organization);
      setGeneratorWebhook(data.organization.chatbotWebhookUrl || "");
      setGeneratedEmbed(data.organization.chatbotEmbedCode || "");
      toast.success("Organization created successfully!");
      form.reset();
    } catch (error: any) {
      toast.error(error.message || "Error creating organization");
    } finally {
      setIsLoading(false);
    }
  }

  const apiBaseUrl = useMemo(() => {
    if (typeof window !== "undefined") return window.location.origin;
    return process.env.NEXT_PUBLIC_APP_URL || "";
  }, []);

  const handleGenerateEmbed = async () => {
    if (!createdOrg) {
      toast.error("Create the organization first");
      return;
    }
    const webhookUrl = generatorWebhook || createdOrg.chatbotWebhookUrl;
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
          organizationId: createdOrg.id,
          webhookUrl,
          apiBaseUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to generate embed code");
      }
      setGeneratedEmbed(data.embedCode || "");
      toast.success("Embed code generated");
    } catch (error: any) {
      toast.error(error?.message || "Error generating embed code");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Onboard New Client</h1>
        <p className="text-muted-foreground mt-2">Configure workspace settings and generate access credentials.</p>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Organization Profile</CardTitle>
              <CardDescription>
                Define the identity and data source for the client.
              </CardDescription>
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
                  {/* Section 1: Identity */}
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
                              <Input placeholder="e.g. Acme Dental Solutions" {...field} />
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
                              <Input placeholder="admin@acmedental.com" {...field} />
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
                                <Input className="pl-9" placeholder="https://..." {...field} />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Enter a direct URL to the client's logo (PNG/SVG) for custom branding.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                      {/* Section 2: Config */}
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
                                <SelectItem value="UTC">UTC (Universal)</SelectItem>
                                <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                                <SelectItem value="America/New_York">New York (EST)</SelectItem>
                                <SelectItem value="America/Los_Angeles">Los Angeles (PST)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
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

                      {/* Data Sync */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                          <Link2 className="h-4 w-4" />
                          <h3>Data Sync</h3>
                        </div>
                        <Separator />
                        <div className="grid gap-4">
                          <FormField
                            control={form.control}
                            name="googleSheetId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Google Sheet ID (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="1BxiM..." {...field} className="font-mono" />
                                </FormControl>
                                <FormDescription>
                                  Optional: For legacy data synchronization with Google Sheets.
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
                                <FormLabel>Chatbot Webhook URL (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://n8n.example.com/webhook/..." {...field} className="font-mono" />
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
                                <FormLabel>Chatbot Embed Code (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="<div id='uplinq-chat-root'></div>&#10;<script>...</script>"
                                    {...field} 
                                    className="font-mono text-xs min-h-[200px]" 
                                  />
                                </FormControl>
                                <FormDescription>
                                  Paste your chatbot embed code here. This will be available to all users in this organization on the Chatbot page.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-end gap-4 pt-4 border-t">
                    <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Client Organization
                  </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Success / Preview */}
        <div className="lg:col-span-1 space-y-6 sticky top-20">
          {createdOrg ? (
            <>
              <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900 animate-in fade-in zoom-in-95 duration-300">
                <CardHeader>
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <Check className="h-5 w-5" />
                    <CardTitle className="text-lg">Success!</CardTitle>
                  </div>
                  <CardDescription>Client organization active.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Join Code</div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white dark:bg-black px-3 py-2 rounded border border-green-200 dark:border-green-800 font-mono text-xl font-bold tracking-wide text-center">
                        {createdOrg.joinCode}
                      </code>
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="shrink-0"
                        onClick={() => {
                          navigator.clipboard.writeText(createdOrg.joinCode);
                          toast.success("Copied to clipboard");
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Alert className="bg-white/50 dark:bg-black/20">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Next Steps</AlertTitle>
                    <AlertDescription className="mt-2 text-xs list-disc pl-4 space-y-1">
                      <li>Share this code with the client.</li>
                      <li>Direct them to <strong>/onboarding</strong>.</li>
                      <li>Verify data sync in "Clients" tab.</li>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Chatbot Embed</CardTitle>
                  <CardDescription>Generate embed code for this organization.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Webhook URL</div>
                    <Input
                      value={generatorWebhook}
                      onChange={(e) => setGeneratorWebhook(e.target.value)}
                      placeholder="https://n8n.example.com/webhook/..."
                      className="font-mono text-xs"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Uses this webhook and the org ID to generate an embed that fetches the latest customization dynamically.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isGenerating}
                    onClick={handleGenerateEmbed}
                    className="w-full"
                  >
                    {isGenerating ? "Generating..." : "Generate Embed Code"}
                  </Button>

                  {generatedEmbed && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-muted-foreground">Embed Code</div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(generatedEmbed);
                            toast.success("Embed code copied");
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                      <Textarea
                        value={generatedEmbed}
                        onChange={(e) => setGeneratedEmbed(e.target.value)}
                        className="font-mono text-xs min-h-[200px]"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="hidden lg:block space-y-6">
              <div className="rounded-xl border bg-muted/40 p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold">Ready to Onboard</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Fill out the form to generate a unique access code for your new client.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
