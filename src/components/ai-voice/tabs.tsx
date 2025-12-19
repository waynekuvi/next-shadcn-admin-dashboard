'use client';

import React, { useState } from "react";
import { AIVoiceDashboard } from "./dashboard";

export function AIVoiceTabs() {
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full">
      <AIVoiceDashboard onCallSelect={setSelectedCallId} selectedCallId={selectedCallId} />
      </div>
  );
}

