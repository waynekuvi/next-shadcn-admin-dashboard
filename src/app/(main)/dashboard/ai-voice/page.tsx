import { AIVoiceTabs } from "@/components/ai-voice/tabs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Voice Dashboard | Atliso",
  description: "Monitor your AI Voice Assistant calls and analytics.",
};

export default function AIVoicePage() {
  return <AIVoiceTabs />;
}

