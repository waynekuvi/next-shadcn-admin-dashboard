'use client';

import React, { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function RuleBuilder() {
  const { data: session } = useSWR('/api/auth/session', fetcher);
  const organizationId = session?.user?.organizationId;
  
  const { data: rulesData, mutate } = useSWR(
    organizationId ? `/api/voice-calls/automation/rules?organizationId=${organizationId}` : null,
    fetcher
  );

  const [ruleName, setRuleName] = useState("");
  const [triggerType, setTriggerType] = useState("keyword_match");
  const [keywords, setKeywords] = useState("");
  const [actionType, setActionType] = useState("tag");
  const [isCreating, setIsCreating] = useState(false);

  const rules = rulesData?.rules || [];

  const handleCreateRule = async () => {
    if (!ruleName.trim()) {
      toast.error("Rule name is required");
      return;
    }

    setIsCreating(true);
    try {
      const conditions: any = {};
      if (triggerType === 'keyword_match') {
        conditions.keywords = keywords.split(',').map(k => k.trim()).filter(Boolean);
      }

      const actions: any = {};
      if (actionType === 'tag') {
        actions.type = 'tag';
        actions.tagId = ''; // Will be selected from tag list
      }

      const response = await fetch('/api/voice-calls/automation/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ruleName.trim(),
          triggerType,
          conditions,
          actions,
          organizationId,
          enabled: true
        })
      });

      if (response.ok) {
        toast.success("Rule created");
        setRuleName("");
        setKeywords("");
        mutate();
      } else {
        throw new Error('Failed to create rule');
      }
    } catch (error) {
      toast.error('Failed to create rule');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/voice-calls/automation/rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ruleId,
          enabled: !enabled
        })
      });

      if (response.ok) {
        mutate();
      } else {
        throw new Error('Failed to update rule');
      }
    } catch (error) {
      toast.error('Failed to update rule');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;

    try {
      const response = await fetch(`/api/voice-calls/automation/rules?id=${ruleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success("Rule deleted");
        mutate();
      } else {
        throw new Error('Failed to delete rule');
      }
    } catch (error) {
      toast.error('Failed to delete rule');
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Rule Form */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-4">Create Automation Rule</h3>
        <div className="space-y-3">
          <Input
            placeholder="Rule name"
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
          />
          <Select value={triggerType} onValueChange={setTriggerType}>
            <SelectTrigger>
              <SelectValue placeholder="Trigger type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="keyword_match">Keyword Match</SelectItem>
              <SelectItem value="outcome_match">Outcome Match</SelectItem>
              <SelectItem value="duration_threshold">Duration Threshold</SelectItem>
            </SelectContent>
          </Select>
          {triggerType === 'keyword_match' && (
            <Input
              placeholder="Keywords (comma-separated)"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          )}
          <Select value={actionType} onValueChange={setActionType}>
            <SelectTrigger>
              <SelectValue placeholder="Action type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tag">Tag Call</SelectItem>
              <SelectItem value="assign">Assign to User</SelectItem>
              <SelectItem value="create_lead">Create Lead</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleCreateRule} disabled={isCreating}>
            <Plus className="w-4 h-4 mr-2" />
            Create Rule
          </Button>
        </div>
      </Card>

      {/* Rules List */}
      <div>
        <h3 className="text-sm font-semibold mb-4">Active Rules ({rules.length})</h3>
        {rules.length === 0 ? (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground text-center">
              No automation rules created yet
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {rules.map((rule: any) => (
              <Card key={rule.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className={cn(
                        "w-4 h-4",
                        rule.enabled ? "text-green-500" : "text-muted-foreground"
                      )} />
                      <h4 className="text-sm font-semibold">{rule.name}</h4>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded",
                        rule.enabled 
                          ? "bg-green-500/10 text-green-600" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Trigger: {rule.triggerType} | Action: {rule.actions?.type || 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleRule(rule.id, rule.enabled)}
                    >
                      {rule.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRule(rule.id)}
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

