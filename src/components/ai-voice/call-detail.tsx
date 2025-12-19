import React, { useState, useEffect } from "react";
import Image from "next/image";
import { VoiceCall } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Phone, Clock, User, MapPin, Activity, CheckCircle2, XCircle, UserPlus, Loader2, Calendar, Wrench, Home, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Brand logo for AI Receptionist
const BRAND_LOGO = "https://www.brigstockdental.co.uk/wp-content/uploads/2023/08/brigstock-dental-implant-and-specialist-referral-clinic-logo1.svg";

interface CallDetailViewProps {
  call: VoiceCall | null;
  onLeadCreated?: () => void;
}

// Comprehensive caller info extraction
interface ExtractedCallerInfo {
  name: string | null;
  phone: string | null;
  address: string | null;
  serviceType: string | null;
  appointmentDate: string | null;
  appointmentTime: string | null;
  issue: string | null;
}

// Helper function to parse transcript into messages
function parseTranscript(transcript: string | null): { role: 'ai' | 'caller'; content: string }[] {
  if (!transcript) return [];
  
  const messages: { role: 'ai' | 'caller'; content: string }[] = [];
  
  // Split by newlines and parse each line
  const lines = transcript.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check for AI/Assistant prefix
    if (trimmedLine.startsWith('AI:') || trimmedLine.startsWith('Assistant:') || trimmedLine.startsWith('Sarah:') || trimmedLine.startsWith('assistant:')) {
      const content = trimmedLine.replace(/^(AI|Assistant|Sarah|assistant):\s*/i, '').trim();
      if (content) messages.push({ role: 'ai', content });
    }
    // Check for Caller/User prefix
    else if (trimmedLine.startsWith('Caller:') || trimmedLine.startsWith('User:') || trimmedLine.startsWith('user:') || trimmedLine.startsWith('Customer:')) {
      const content = trimmedLine.replace(/^(Caller|User|user|Customer):\s*/i, '').trim();
      if (content) messages.push({ role: 'caller', content });
    }
    // If no prefix, try to guess based on content or append to last message
    else if (trimmedLine.length > 0) {
      // If it's a continuation, append to last message
      if (messages.length > 0) {
        messages[messages.length - 1].content += ' ' + trimmedLine;
      }
    }
  }
  
  return messages;
}

// Comprehensive helper function to extract all caller info from transcript
function extractCallerInfo(transcript: string | null, summary: string | null): ExtractedCallerInfo {
  const textToSearch = `${transcript || ''} ${summary || ''}`;
  const lowerText = textToSearch.toLowerCase();
  
  // Extract phone number
  let phone: string | null = null;
  const phonePatterns = [
    /\b0\s*7\s*[0-9\s]{7,}/g,
    /\b(\+?44|0)[\s.-]?7[\d\s.-]{8,}/g,
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  ];
  for (const pattern of phonePatterns) {
    const match = textToSearch.match(pattern);
    if (match) {
      phone = match[0].replace(/\s+/g, '').replace(/[^\d+]/g, '');
      if (phone.length >= 10) break;
    }
  }
  
  // Extract name from summary (most reliable)
  let name: string | null = null;
  if (summary) {
    const summaryNameMatch = summary.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:called|booked|requested|wanted)/);
    if (summaryNameMatch) {
      name = summaryNameMatch[1];
    }
  }
  
  // Extract address - look for postcode patterns and street names
  let address: string | null = null;
  // UK postcode pattern with street
  const postcodeMatch = textToSearch.match(/\d+\s+[\w\s]+(?:Avenue|Street|Road|Lane|Drive|Close|Way|Court|Place|Gardens|Crescent|Terrace|Grove|Park|Square|Hill|View|Rise|Row|Mews)\s*[A-Z]{1,2}\d{1,2}\s*\d?[A-Z]{0,2}/i);
  if (postcodeMatch) {
    address = postcodeMatch[0].trim();
  }
  // Try to extract from summary if not found
  if (!address && summary) {
    const addressMatch = summary.match(/(?:address\s+(?:as|is)?|located at)\s+(\d+\s+[\w\s]+(?:Avenue|Street|Road|Lane|Drive|Close|Way|Court|Place)\s*[A-Z0-9\s]+)/i);
    if (addressMatch) {
      address = addressMatch[1].trim();
    }
  }
  
  // Extract service type
  let serviceType: string | null = null;
  const serviceKeywords = [
    { keywords: ['boiler', 'heating', 'radiator', 'central heating'], type: 'Boiler/Heating' },
    { keywords: ['leak', 'leaking', 'water damage', 'burst pipe'], type: 'Leak Repair' },
    { keywords: ['blocked', 'drain', 'clog', 'blockage'], type: 'Blocked Drain' },
    { keywords: ['tap', 'faucet', 'mixer'], type: 'Tap Repair' },
    { keywords: ['toilet', 'cistern', 'flush'], type: 'Toilet Repair' },
    { keywords: ['shower', 'bath'], type: 'Bathroom' },
    { keywords: ['emergency', 'urgent'], type: 'Emergency' },
    { keywords: ['quote', 'estimate', 'pricing'], type: 'Quote Request' },
    { keywords: ['dental', 'teeth', 'tooth', 'cleaning', 'checkup', 'check-up'], type: 'Dental Appointment' },
  ];
  for (const { keywords, type } of serviceKeywords) {
    if (keywords.some(k => lowerText.includes(k))) {
      serviceType = type;
      break;
    }
  }
  
  // Extract appointment date
  let appointmentDate: string | null = null;
  const datePatterns = [
    /tomorrow/i,
    /today/i,
    /(?:on|for)\s+(?:the\s+)?(\d{1,2})(?:st|nd|rd|th)?(?:\s+(?:of\s+)?(?:January|February|March|April|May|June|July|August|September|October|November|December))?/i,
    /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i,
  ];
  for (const pattern of datePatterns) {
    const match = textToSearch.match(pattern);
    if (match) {
      if (match[0].toLowerCase() === 'tomorrow') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        appointmentDate = tomorrow.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
      } else if (match[0].toLowerCase() === 'today') {
        appointmentDate = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
      } else {
        appointmentDate = match[0];
      }
      break;
    }
  }
  
  // Extract appointment time - be more specific to avoid false matches
  let appointmentTime: string | null = null;
  const timeMatch = textToSearch.match(/(?:at|for)\s+(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm|a\.m\.|p\.m\.)/i);
  if (timeMatch) {
    const hour = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] || '00';
    const period = timeMatch[3]?.replace('.', '').toUpperCase() || 'AM';
    if (hour >= 1 && hour <= 12) {
      appointmentTime = `${hour}:${minutes} ${period}`;
    }
  }
  
  // Extract issue description from summary
  let issue: string | null = null;
  if (summary) {
    // Get the main issue from summary
    const issueMatch = summary.match(/(?:for|regarding|about)\s+(?:a\s+)?(.+?)(?:\.|He|She|They|The caller)/i);
    if (issueMatch) {
      issue = issueMatch[1].trim();
    }
  }
  
  return { name, phone, address, serviceType, appointmentDate, appointmentTime, issue };
}

export function CallDetailView({ call, onLeadCreated }: CallDetailViewProps) {
  const [isCreatingLead, setIsCreatingLead] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [autoCapturing, setAutoCapturing] = useState(false);

  // Extract caller info from transcript and summary
  const callerInfo = call ? extractCallerInfo(call.transcript, call.summary) : null;
  
  // Detect if this call has enough info to auto-capture
  const hasEnoughInfo = callerInfo && (callerInfo.name || callerInfo.phone);
  const isCompletedCall = call?.status === 'ended';
  const isBookingCall = call?.summary?.toLowerCase().includes('book') || 
                        call?.summary?.toLowerCase().includes('appointment') ||
                        call?.outcome === 'success';

  // Auto-capture lead when call ends with sufficient info
  useEffect(() => {
    if (!call || !isCompletedCall || leadCaptured || autoCapturing) return;
    if (!hasEnoughInfo) return;
    
    // Check if lead already exists for this call
    const checkAndCreateLead = async () => {
      setAutoCapturing(true);
      try {
        // First check if lead already exists
        const checkResponse = await fetch(`/api/voice-calls/${call.id}/lead-status`);
        if (checkResponse.ok) {
          const { exists } = await checkResponse.json();
          if (exists) {
            setLeadCaptured(true);
            setAutoCapturing(false);
            return;
          }
        }
        
        // Auto-create lead if it doesn't exist and we have good info
        if (isBookingCall || callerInfo?.name) {
          const response = await fetch(`/api/voice-calls/${call.id}/create-lead`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: callerInfo?.name || 'Unknown Caller',
              phone: callerInfo?.phone || call.fromNumber || '',
              email: '',
              source: 'AI Voice Call',
              notes: [
                callerInfo?.serviceType && `Service: ${callerInfo.serviceType}`,
                callerInfo?.address && `Address: ${callerInfo.address}`,
                callerInfo?.appointmentDate && `Appointment: ${callerInfo.appointmentDate}`,
                callerInfo?.appointmentTime && `Time: ${callerInfo.appointmentTime}`,
                callerInfo?.issue && `Issue: ${callerInfo.issue}`,
              ].filter(Boolean).join('\n'),
            }),
          });
          
          if (response.ok) {
            setLeadCaptured(true);
            toast.success('Lead automatically captured!', {
              description: `${callerInfo?.name || 'Caller'} added to your leads`,
              icon: <Sparkles className="w-4 h-4" />,
            });
            onLeadCreated?.();
          }
        }
      } catch (error) {
        console.error('Auto-capture failed:', error);
      } finally {
        setAutoCapturing(false);
      }
    };
    
    checkAndCreateLead();
  }, [call?.id, isCompletedCall, hasEnoughInfo, isBookingCall]);

  if (!call) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Activity className="w-12 h-12 mb-4 opacity-20" />
        <p>Select a call to view details</p>
      </div>
    );
  }

  // Parse the transcript into structured messages
  const parsedMessages = parseTranscript(call.transcript);
  const hasMessages = parsedMessages.length > 0;

  // Handle manual create lead
  const handleCreateLead = async () => {
    if (!call || leadCaptured) return;
    
    setIsCreatingLead(true);
    try {
      const response = await fetch(`/api/voice-calls/${call.id}/create-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: callerInfo?.name || 'Unknown Caller',
          phone: callerInfo?.phone || call.fromNumber || '',
          email: '',
          source: 'AI Voice Call',
          notes: [
            callerInfo?.serviceType && `Service: ${callerInfo.serviceType}`,
            callerInfo?.address && `Address: ${callerInfo.address}`,
            callerInfo?.appointmentDate && `Appointment: ${callerInfo.appointmentDate}`,
            callerInfo?.appointmentTime && `Time: ${callerInfo.appointmentTime}`,
            callerInfo?.issue && `Issue: ${callerInfo.issue}`,
          ].filter(Boolean).join('\n'),
        }),
      });
      
      if (response.ok) {
        setLeadCaptured(true);
        toast.success('Lead created successfully!');
        onLeadCreated?.();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create lead');
      }
    } catch (error) {
      toast.error('Failed to create lead');
    } finally {
      setIsCreatingLead(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground font-sans">
      {/* Top Stats Bar - Mimicking Vapi's Cost/Latency bar */}
      <div className="flex items-center gap-6 p-6 border-b border-border bg-muted/30">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cost</span>
            <span className="text-sm font-mono text-emerald-600 dark:text-emerald-400">
              ${(call.cost || 0).toFixed(2)}
            </span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 w-[20%]" />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Duration</span>
            <span className="text-sm font-mono text-blue-600 dark:text-blue-400">
              {call.duration ? `${(call.duration / 60).toFixed(1)} min` : '0s'}
            </span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400" 
              style={{ width: `${Math.min(((call.duration || 0) / 300) * 100, 100)}%` }} 
            />
          </div>
        </div>

        <div className="flex-1">
           <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</span>
            <Badge variant="outline" className={cn(
              "text-xs capitalize border-0",
              call.status === 'ended' 
                ? "bg-muted text-muted-foreground" 
                : "bg-green-500/10 text-green-600 dark:text-green-400"
            )}>
              {call.status}
            </Badge>
          </div>
           <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
             <div className={cn(
               "h-full w-full", 
               call.status === 'ended' ? "bg-muted-foreground/30" : "bg-green-500 animate-pulse"
             )} />
           </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Column: Call Intelligence (Replacing 'Model' config) */}
        <div className="w-1/3 border-r border-border bg-muted/30 p-6 overflow-y-auto">
          <div className="space-y-8">
            
            {/* Section: Analysis */}
            <div>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="w-3 h-3 text-purple-500 dark:text-purple-400" />
                Call Analysis
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-border bg-card">
                  <label className="text-[10px] uppercase text-muted-foreground font-semibold block mb-2">Summary</label>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {call.summary || "No summary available."}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                   <div className="p-3 rounded-lg border border-border bg-card">
                    <label className="text-[10px] uppercase text-muted-foreground font-semibold block mb-1">Outcome</label>
                    <p className="text-xs font-mono text-purple-600 dark:text-purple-300">
                      {call.outcome || "N/A"}
                    </p>
                  </div>
                   <div className="p-3 rounded-lg border border-border bg-card">
                    <label className="text-[10px] uppercase text-muted-foreground font-semibold block mb-1">Success</label>
                    <div className="flex items-center gap-2">
                       {(call.metadata as any)?.endOfCallReport?.successEvaluation === 'true' ? (
                         <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                           <CheckCircle2 className="w-3 h-3" /> True
                         </span>
                       ) : (
                         <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                           <XCircle className="w-3 h-3" /> False
                         </span>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Section: Lead Capture Status */}
            {(leadCaptured || autoCapturing) && (
              <div className={cn(
                "p-4 rounded-lg border-2",
                leadCaptured 
                  ? "bg-emerald-500/10 border-emerald-500/30" 
                  : "bg-blue-500/10 border-blue-500/30"
              )}>
                <div className="flex items-center gap-3">
                  {leadCaptured ? (
                    <>
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Lead Captured</p>
                        <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">Automatically added to your leads</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Capturing Lead...</p>
                        <p className="text-xs text-blue-600/80 dark:text-blue-400/80">Extracting details from call</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {(leadCaptured || autoCapturing) && <Separator className="bg-border" />}

            {/* Section: Captured Details */}
            <div>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                Captured Details
              </h3>
              <div className="space-y-3">
                 {/* Name */}
                 <div className="flex items-center justify-between p-2.5 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                   <div className="flex items-center gap-2">
                     <User className="w-4 h-4 text-blue-500" />
                     <span className="text-xs text-muted-foreground">Name</span>
                   </div>
                   <span className={cn(
                     "text-sm font-medium",
                     callerInfo?.name ? "text-foreground" : "text-muted-foreground"
                   )}>
                     {callerInfo?.name || "—"}
                   </span>
                 </div>
                 
                 {/* Phone */}
                 <div className="flex items-center justify-between p-2.5 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                   <div className="flex items-center gap-2">
                     <Phone className="w-4 h-4 text-emerald-500" />
                     <span className="text-xs text-muted-foreground">Phone</span>
                   </div>
                   <span className={cn(
                     "text-sm font-mono",
                     callerInfo?.phone ? "text-foreground font-medium" : "text-muted-foreground"
                   )}>
                     {callerInfo?.phone || call.fromNumber || "—"}
                   </span>
                 </div>
                 
                 {/* Address */}
                 <div className="flex items-center justify-between p-2.5 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                   <div className="flex items-center gap-2">
                     <Home className="w-4 h-4 text-purple-500" />
                     <span className="text-xs text-muted-foreground">Address</span>
                   </div>
                   <span className={cn(
                     "text-sm text-right max-w-[60%]",
                     callerInfo?.address ? "text-foreground" : "text-muted-foreground"
                   )}>
                     {callerInfo?.address || "—"}
                   </span>
                 </div>
                 
                 {/* Service Type */}
                 <div className="flex items-center justify-between p-2.5 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                   <div className="flex items-center gap-2">
                     <Wrench className="w-4 h-4 text-orange-500" />
                     <span className="text-xs text-muted-foreground">Service</span>
                   </div>
                   {callerInfo?.serviceType ? (
                     <Badge variant="secondary" className="text-xs">
                       {callerInfo.serviceType}
                     </Badge>
                   ) : (
                     <span className="text-sm text-muted-foreground">—</span>
                   )}
                 </div>
                 
                 {/* Appointment Date */}
                 <div className="flex items-center justify-between p-2.5 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                   <div className="flex items-center gap-2">
                     <Calendar className="w-4 h-4 text-rose-500" />
                     <span className="text-xs text-muted-foreground">Appointment</span>
                   </div>
                   <span className={cn(
                     "text-sm",
                     callerInfo?.appointmentDate ? "text-foreground" : "text-muted-foreground"
                   )}>
                     {callerInfo?.appointmentDate 
                       ? `${callerInfo.appointmentDate}${callerInfo.appointmentTime ? ` at ${callerInfo.appointmentTime}` : ''}`
                       : "—"
                     }
                   </span>
                 </div>
                 
                 {/* Issue/Notes */}
                 {callerInfo?.issue && (
                   <div className="p-2.5 rounded-lg border bg-card">
                     <div className="flex items-center gap-2 mb-1.5">
                       <Activity className="w-4 h-4 text-cyan-500" />
                       <span className="text-xs text-muted-foreground">Issue</span>
                     </div>
                     <p className="text-sm text-foreground/90 leading-relaxed">
                       {callerInfo.issue}
                     </p>
                   </div>
                 )}
              </div>
            </div>

            <Separator className="bg-border" />
            
            {/* Manual Create Lead (if not auto-captured) */}
            {!leadCaptured && !autoCapturing && (
              <div>
                <Button 
                  onClick={handleCreateLead}
                  disabled={isCreatingLead}
                  className="w-full"
                  variant={isBookingCall ? "default" : "outline"}
                >
                  {isCreatingLead ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Lead...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Capture Lead
                    </>
                  )}
                </Button>
                {isBookingCall && (
                  <p className="text-[10px] text-center text-emerald-600 dark:text-emerald-400 mt-2">
                    ✓ Booking detected - recommended to capture
                  </p>
                )}
              </div>
            )}
            
             <Separator className="bg-border" />
             
             {/* Section: System Info */}
            <div>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Clock className="w-3 h-3 text-orange-500 dark:text-orange-400" />
                 Timeline
              </h3>
              <div className="space-y-3 pl-2 border-l border-border ml-1">
                 <div className="relative">
                    <div className="absolute -left-[13px] top-1 w-2 h-2 rounded-full bg-green-500 ring-4 ring-background" />
                    <p className="text-[10px] text-muted-foreground mb-0.5">Started</p>
                    <p className="text-xs text-foreground/90">
                      {call.startedAt ? new Date(call.startedAt).toLocaleString() : '-'}
                    </p>
                 </div>
                 <div className="relative pb-2">
                    <div className="absolute -left-[13px] top-1 w-2 h-2 rounded-full bg-muted-foreground ring-4 ring-background" />
                    <p className="text-[10px] text-muted-foreground mb-0.5">Ended</p>
                    <p className="text-xs text-foreground/90">
                      {call.endedAt ? new Date(call.endedAt).toLocaleString() : '-'}
                    </p>
                 </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Transcript (Chat UI) */}
        <div className="flex-1 bg-background flex flex-col relative">
           <div className="absolute top-4 right-4 z-10">
              <Badge variant="outline" className="bg-card/80 backdrop-blur text-muted-foreground border-border">
                Transcript
              </Badge>
           </div>
           
           <ScrollArea className="flex-1 p-8">
             <div className="max-w-3xl mx-auto space-y-4">
               {!hasMessages && (
                 <div className="p-4 rounded-lg bg-muted/50 border border-border text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                   {call.transcript || "No transcript available."}
                 </div>
               )}

               {hasMessages && parsedMessages.map((msg, idx) => (
                 <div key={idx} className={cn(
                   "flex gap-3",
                   msg.role === 'caller' ? "flex-row-reverse" : "flex-row"
                 )}>
                   {/* Avatar */}
                   <div className={cn(
                     "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center overflow-hidden",
                     msg.role === 'ai' 
                       ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 ring-1 ring-blue-500/30"
                       : "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 ring-1 ring-emerald-500/30"
                   )}>
                     {msg.role === 'ai' ? (
                       <Image 
                         src={BRAND_LOGO} 
                         alt="AI Receptionist" 
                         width={24} 
                         height={24}
                         className="w-6 h-6 object-contain"
                       />
                     ) : (
                       <User className="w-4 h-4" />
                     )}
                   </div>
                   
                   {/* Message Bubble */}
                   <div className={cn(
                     "flex flex-col max-w-[80%]",
                     msg.role === 'caller' ? "items-end" : "items-start"
                 )}>
                     <div className="flex items-center gap-2 mb-1">
                     <span className={cn(
                       "text-[10px] uppercase font-bold tracking-wider",
                         msg.role === 'ai' 
                         ? "text-blue-600 dark:text-blue-400" 
                         : "text-emerald-600 dark:text-emerald-400"
                     )}>
                         {msg.role === 'ai' ? 'AI Receptionist' : 'Caller'}
                     </span>
                   </div>
                   <div className={cn(
                       "px-4 py-3 text-sm leading-relaxed shadow-sm",
                       msg.role === 'ai' 
                         ? "bg-blue-500/10 text-foreground rounded-2xl rounded-tl-sm border border-blue-500/20 dark:bg-blue-500/10 dark:border-blue-500/30" 
                         : "bg-emerald-500/10 text-foreground rounded-2xl rounded-tr-sm border border-emerald-500/20 dark:bg-emerald-500/10 dark:border-emerald-500/30"
                   )}>
                       {msg.content}
                     </div>
                   </div>
                 </div>
               ))}
               
               {call.status === 'ended' && hasMessages && (
                 <div className="flex items-center justify-center gap-2 my-8 opacity-50">
                    <div className="h-px w-12 bg-border" />
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Call Ended</span>
                    <div className="h-px w-12 bg-border" />
                 </div>
               )}
             </div>
           </ScrollArea>
        </div>
      </div>
    </div>
  );
}

