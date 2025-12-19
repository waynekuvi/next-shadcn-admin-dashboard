"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  User, 
  Settings2, 
  Users, 
  ShieldCheck, 
  CreditCard, 
  Bell, 
  Globe 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { SettingsProfile } from "./settings-profile";
import { SettingsIntegrations } from "./settings-integrations";
import { SettingsSecurity } from "./settings-security";
import { MembersTable } from "./members-table";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SettingsShellProps {
  organization: any;
  isOwner: boolean;
}

type Section = "general" | "integrations" | "notifications" | "language" | "members" | "security" | "billing";

export function SettingsShell({ organization, isOwner }: SettingsShellProps) {
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get("section") as Section | null;
  const validSections: Section[] = ["general", "integrations", "notifications", "language", "members", "security", "billing"];
  const initialSection = sectionParam && validSections.includes(sectionParam) ? sectionParam : "general";
  
  const [activeSection, setActiveSection] = useState<Section>(initialSection);
  const isReadOnly = !isOwner;

  // Update section when URL param changes
  useEffect(() => {
    if (sectionParam && validSections.includes(sectionParam)) {
      setActiveSection(sectionParam);
    }
  }, [sectionParam]);

  const NavButton = ({ section, label, icon: Icon }: { section: Section; label: string; icon: any }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setActiveSection(section)}
      className={cn(
        "w-full justify-start gap-2 px-2",
        activeSection === section 
          ? "bg-muted font-medium text-primary" 
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-5">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1 space-y-6 px-2">
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase px-3">
            General Settings
          </h4>
          <div className="space-y-1">
            <NavButton section="general" label="Profile" icon={User} />
            <NavButton section="integrations" label="Integrations" icon={Settings2} />
            <NavButton section="notifications" label="Notification" icon={Bell} />
            <NavButton section="language" label="Language & Region" icon={Globe} />
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase px-3">
            Workspace Settings
          </h4>
          <div className="space-y-1">
            <NavButton section="members" label="Members" icon={Users} />
            <NavButton section="security" label="Security & Access" icon={ShieldCheck} />
            <NavButton section="billing" label="Billing" icon={CreditCard} />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="lg:col-span-4">
        {activeSection === "general" && (
          <SettingsProfile organization={organization} isReadOnly={isReadOnly} />
        )}

        {activeSection === "integrations" && (
          <SettingsIntegrations organization={organization} isReadOnly={isReadOnly} />
        )}

        {activeSection === "members" && (
          <Card className="border-none shadow-none">
            <CardHeader className="px-6 pt-6 pb-4">
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage who has access to this organization.</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <MembersTable members={organization.users} />
            </CardContent>
          </Card>
        )}

        {activeSection === "security" && (
          <SettingsSecurity organization={organization} isReadOnly={isReadOnly} />
        )}

        {/* Placeholders for future features */}
        {(activeSection === "notifications" || activeSection === "language" || activeSection === "billing") && (
          <Card className="border-none shadow-none">
             <CardHeader className="px-6 pt-6 pb-4">
              <CardTitle className="capitalize">{activeSection}</CardTitle>
              <CardDescription>This feature is coming soon.</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6 py-12 flex items-center justify-center border rounded-lg border-dashed">
               <p className="text-muted-foreground text-sm">Feature under development</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

