"use client";

import { useState } from "react";
import { User, Shield, Bell, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountProfile } from "./account-profile";
import { AccountSecurity } from "./account-security";

interface AccountSettingsShellProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    emailVerified: Date | null;
    role: string;
    orgRole: string;
  };
}

type Section = "profile" | "security" | "notifications" | "preferences";

export function AccountSettingsShell({ user }: AccountSettingsShellProps) {
  const [activeSection, setActiveSection] = useState<Section>("profile");

  const NavButton = ({ section, label, icon: Icon }: { section: Section; label: string; icon: any }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setActiveSection(section)}
      className={`w-full justify-start gap-2 px-2 ${
        activeSection === section 
          ? "bg-muted font-medium text-primary" 
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1 space-y-6 px-2">
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase px-3">
            Account Settings
          </h4>
          <div className="space-y-1">
            <NavButton section="profile" label="Profile" icon={User} />
            <NavButton section="security" label="Security" icon={Shield} />
            <NavButton section="notifications" label="Notifications" icon={Bell} />
            <NavButton section="preferences" label="Preferences" icon={Globe} />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="lg:col-span-4">
        {activeSection === "profile" && (
          <AccountProfile user={user} />
        )}

        {activeSection === "security" && (
          <AccountSecurity user={user} />
        )}

        {(activeSection === "notifications" || activeSection === "preferences") && (
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-2 capitalize">{activeSection}</h3>
            <p className="text-sm text-muted-foreground">This feature is coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}

