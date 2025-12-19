"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ isOpen, onClose }: BookingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 overflow-hidden bg-neutral-950 border-white/10">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl font-light text-white">
            <Calendar className="w-5 h-5 text-neutral-400" />
            <span>Schedule a Demo</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="w-full h-[600px] bg-neutral-950 relative">
          <iframe
            src="https://neocal.ai/wayne/meeting"
            className="w-full h-full border-none"
            allowFullScreen
            style={{ minHeight: '600px' }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

