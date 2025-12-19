"use client";

import { useState } from "react";
import { Copy, Check, ShieldAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function SettingsSecurity({ organization, isReadOnly }: { organization: any; isReadOnly: boolean }) {
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);
  const [isActive, setIsActive] = useState(organization.isActive);
  const [isLoading, setIsLoading] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(organization.joinCode);
    setIsCopied(true);
    toast.success("Join code copied");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const toggleStatus = async (checked: boolean) => {
    if (isReadOnly) return;
    setIsActive(checked);
    setIsLoading(true);
    try {
      // Reuse the update API
      const res = await fetch(`/api/organization/${organization.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: checked }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      toast.success(checked ? "Organization activated" : "Organization deactivated");
      router.refresh();
    } catch (error) {
      setIsActive(!checked); // Revert on error
      toast.error("Error updating status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-none">
        <CardHeader className="px-6 pt-6 pb-4">
          <CardTitle>Access Credentials</CardTitle>
          <CardDescription>
            Use this code to invite new members to your organization.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="flex items-center gap-4">
            <code className="flex-1 bg-muted px-4 py-3 rounded-md border font-mono text-xl font-bold tracking-wider text-center select-all">
              {organization.joinCode}
            </code>
            <Button 
              size="icon" 
              variant="outline" 
              className="h-12 w-12"
              onClick={handleCopy}
            >
              {isCopied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10">
        <CardHeader className="px-6 pt-6 pb-4">
          <CardTitle className="text-red-900 dark:text-red-200 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-red-700 dark:text-red-300">
            Actions here can affect your entire organization's access.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">Organization Status</Label>
              <p className="text-sm text-muted-foreground">
                {isActive 
                  ? "Your organization is currently active." 
                  : "Your organization is currently deactivated. Access is blocked."}
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={toggleStatus}
              disabled={isReadOnly || isLoading}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

