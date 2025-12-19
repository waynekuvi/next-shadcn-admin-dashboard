"use client";

import { useState } from "react";
import { Check, Copy, Code } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface EmbedCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  embedCode: string;
}

export function EmbedCodeModal({ isOpen, onClose, embedCode }: EmbedCodeModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success("Embed code copied to clipboard!");
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-green-500" />
            Customization Saved!
          </DialogTitle>
          <DialogDescription>
            Copy this embed code and paste it into your website. The chatbot will display with your custom branding.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Textarea
              className="min-h-[200px] font-mono text-xs p-4 resize-none bg-muted/30 w-full break-all whitespace-pre-wrap"
              value={embedCode}
              readOnly
            />
            <Button
              size="icon"
              variant="outline"
              className="absolute top-2 right-2 h-8 w-8 bg-background shadow-sm hover:bg-muted"
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleCopy}>
              {copied ? "Copied!" : "Copy Embed Code"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


