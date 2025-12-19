"use client";

import { useState } from "react";
import {
  Zap,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit,
  Calendar,
  MessageSquare,
  Mail,
  Bell,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

const automationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  trigger: z.enum(["APPOINTMENT_BOOKED", "APPOINTMENT_COMPLETED", "LEAD_CREATED", "MESSAGE_RECEIVED"]),
  action: z.enum(["SEND_SMS", "SEND_EMAIL", "CREATE_TASK", "ASSIGN_TO_TEAM"]),
  delay: z.number().min(0).optional(),
  enabled: z.boolean().default(true),
});

type Automation = {
  id: string;
  name: string;
  trigger: string;
  action: string;
  delay?: number;
  enabled: boolean;
  lastRun?: string;
  runCount: number;
  status: "active" | "paused" | "error";
};

const mockAutomations: Automation[] = [
  {
    id: "1",
    name: "Appointment Reminder SMS",
    trigger: "APPOINTMENT_BOOKED",
    action: "SEND_SMS",
    delay: 24,
    enabled: true,
    lastRun: new Date(Date.now() - 3600000).toISOString(),
    runCount: 42,
    status: "active",
  },
  {
    id: "2",
    name: "Follow-up Email",
    trigger: "APPOINTMENT_COMPLETED",
    action: "SEND_EMAIL",
    delay: 24,
    enabled: true,
    lastRun: new Date(Date.now() - 7200000).toISOString(),
    runCount: 18,
    status: "active",
  },
  {
    id: "3",
    name: "New Lead Assignment",
    trigger: "LEAD_CREATED",
    action: "ASSIGN_TO_TEAM",
    enabled: false,
    runCount: 0,
    status: "paused",
  },
];

const triggerIcons = {
  APPOINTMENT_BOOKED: Calendar,
  APPOINTMENT_COMPLETED: CheckCircle2,
  LEAD_CREATED: Plus,
  MESSAGE_RECEIVED: MessageSquare,
};

const actionIcons = {
  SEND_SMS: MessageSquare,
  SEND_EMAIL: Mail,
  CREATE_TASK: Zap,
  ASSIGN_TO_TEAM: Bell,
};

const statusColors = {
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
};

export function AutomationsClient() {
  const [automations, setAutomations] = useState<Automation[]>(mockAutomations);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);

  const form = useForm<z.infer<typeof automationSchema>>({
    resolver: zodResolver(automationSchema),
    defaultValues: {
      name: "",
      trigger: "APPOINTMENT_BOOKED",
      action: "SEND_SMS",
      delay: 0,
      enabled: true,
    },
  });

  const onSubmit = (values: z.infer<typeof automationSchema>) => {
    if (editingAutomation) {
      setAutomations(automations.map(a => a.id === editingAutomation.id ? {
        ...a,
        ...values,
        status: values.enabled ? "active" : "paused",
      } as Automation : a));
      toast.success("Automation updated successfully");
    } else {
      const newAutomation: Automation = {
        id: Date.now().toString(),
        ...values,
        status: values.enabled ? "active" : "paused",
        runCount: 0,
      };
      setAutomations([...automations, newAutomation]);
      toast.success("Automation created successfully");
    }
    setIsDialogOpen(false);
    setEditingAutomation(null);
    form.reset();
  };

  const handleToggle = (id: string) => {
    setAutomations(automations.map(a => {
      if (a.id === id) {
        const newEnabled = !a.enabled;
        return {
          ...a,
          enabled: newEnabled,
          status: newEnabled ? "active" : "paused",
        };
      }
      return a;
    }));
    toast.success("Automation status updated");
  };

  const handleDelete = (id: string) => {
    setAutomations(automations.filter(a => a.id !== id));
    toast.success("Automation deleted");
  };

  const handleEdit = (automation: Automation) => {
    setEditingAutomation(automation);
    form.reset({
      name: automation.name,
      trigger: automation.trigger as any,
      action: automation.action as any,
      delay: automation.delay || 0,
      enabled: automation.enabled,
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {automations.filter(a => a.enabled).length} active automations
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingAutomation(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Automation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAutomation ? "Edit Automation" : "Create Automation"}</DialogTitle>
              <DialogDescription>
                Set up automated workflows that trigger actions based on events.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Automation Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Appointment Reminder" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trigger"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trigger Event</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select trigger" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="APPOINTMENT_BOOKED">Appointment Booked</SelectItem>
                          <SelectItem value="APPOINTMENT_COMPLETED">Appointment Completed</SelectItem>
                          <SelectItem value="LEAD_CREATED">New Lead Created</SelectItem>
                          <SelectItem value="MESSAGE_RECEIVED">Message Received</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="action"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Action</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select action" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SEND_SMS">Send SMS</SelectItem>
                          <SelectItem value="SEND_EMAIL">Send Email</SelectItem>
                          <SelectItem value="CREATE_TASK">Create Task</SelectItem>
                          <SelectItem value="ASSIGN_TO_TEAM">Assign to Team</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="delay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delay (hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          min={0}
                          placeholder="0"
                        />
                      </FormControl>
                      <FormDescription>
                        How many hours to wait before executing the action (0 = immediate)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Automation</FormLabel>
                        <FormDescription>
                          Turn this automation on or off
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
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingAutomation(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingAutomation ? "Update" : "Create"} Automation
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Automations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{automations.length}</div>
            <p className="text-xs text-muted-foreground">Created automations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {automations.filter(a => a.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">Running automations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {automations.reduce((sum, a) => sum + a.runCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Times executed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Automations</CardTitle>
          <CardDescription>
            Manage your automated workflows and their execution status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {automations.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No automations created yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Delay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Executions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {automations.map((automation) => {
                  const TriggerIcon = triggerIcons[automation.trigger as keyof typeof triggerIcons];
                  const ActionIcon = actionIcons[automation.action as keyof typeof actionIcons];
                  return (
                    <TableRow key={automation.id}>
                      <TableCell className="font-medium">{automation.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {TriggerIcon && <TriggerIcon className="h-4 w-4 text-muted-foreground" />}
                          <span className="text-sm">
                            {automation.trigger.replace(/_/g, " ")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {ActionIcon && <ActionIcon className="h-4 w-4 text-muted-foreground" />}
                          <span className="text-sm">
                            {automation.action.replace(/_/g, " ")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {automation.delay ? `${automation.delay}h` : "Immediate"}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[automation.status]}>
                          {automation.status === "active" && <Play className="mr-1 h-3 w-3" />}
                          {automation.status === "paused" && <Pause className="mr-1 h-3 w-3" />}
                          {automation.status === "error" && <XCircle className="mr-1 h-3 w-3" />}
                          {automation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{automation.runCount}</span>
                          {automation.lastRun && (
                            <span className="text-xs text-muted-foreground">
                              ({new Date(automation.lastRun).toLocaleDateString()})
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Switch
                            checked={automation.enabled}
                            onCheckedChange={() => handleToggle(automation.id)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(automation)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(automation.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

