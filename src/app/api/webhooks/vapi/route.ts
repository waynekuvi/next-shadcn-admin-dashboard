import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Vapi Server URL endpoint
// Receives real-time conversation events from Vapi
// Events: status-update, transcript-update, function-call, end-of-call-report, hang

interface VapiEvent {
  type: string;
  call?: {
    id: string;
    status: string;
    startedAt?: string;
    endedAt?: string;
    duration?: number;
    cost?: number;
    from?: string;
    to?: string;
    assistantId?: string;
    assistantName?: string;
  };
  transcript?: string;
  transcriptId?: string;
  functionCall?: {
    name: string;
    parameters: any;
  };
  message?: {
    role: string;
    content: string;
  };
  endOfCallReport?: {
    summary?: string;
    outcome?: string;
    cost?: number;
    duration?: number;
  };
  organizationId?: string;
  [key: string]: any;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    console.log("📥 Raw webhook body:", rawBody.substring(0, 500)); // Log first 500 chars
    
    if (!rawBody || rawBody.trim() === '') {
      console.warn("⚠️ Empty webhook body received");
      return NextResponse.json({ success: true, message: "Empty body received" });
    }
    
    const body: any = JSON.parse(rawBody);
    console.log("📦 Parsed webhook body keys:", Object.keys(body));
    
    // Vapi sends data nested in "message" object
    // Structure: { message: { type: "...", call: { id: "..." }, ... } }
    const message = body.message || body;
    
    // Extract event type and call ID from Vapi's structure
    const eventType = message.type || body.type || 'unknown';
    const callData = message.call || body.call;
    const callId = callData?.id || message.callId;
    // For status-update events, status is at message.status, not message.call.status
    const callStatus = message.status || callData?.status;
    
    console.log("🔍 Event type:", eventType, "| Call ID:", callId, "| Status:", callStatus);

    // Normalize the body structure to match our VapiEvent interface
    const normalizedBody: VapiEvent = {
      type: eventType,
      call: callData ? {
        id: callId || callData.id,
        status: callStatus || callData.status || 'unknown',
        startedAt: callData.createdAt || callData.startedAt,
        endedAt: callData.endedAt,
        duration: callData.duration,
        cost: callData.cost || message.cost,
        from: callData.from || callData.fromNumber,
        to: callData.to || callData.toNumber,
        assistantId: callData.assistantId || message.assistant?.id,
        assistantName: message.assistant?.name,
      } : (callId ? {
        id: callId,
        status: callStatus || 'unknown',
        assistantId: message.assistant?.id,
        assistantName: message.assistant?.name,
      } : undefined),
      transcript: message.transcript || message.artifact?.messages?.find((m: any) => m.role === 'user')?.message,
      functionCall: message.functionCall || message.function_call,
      endOfCallReport: message.analysis ? {
        summary: message.analysis.summary,
        outcome: message.analysis.successEvaluation === 'true' ? 'success' : 'failed',
      } : message.endOfCallReport || message.end_of_call_report,
      ...message,
    };

    // Handle different event types
    let savedCall: any = null;
    
    switch (normalizedBody.type) {
      case "status-update":
        savedCall = await handleStatusUpdate(normalizedBody);
        break;
      
      case "transcript":
      case "transcript-update":
        await handleTranscriptUpdate(normalizedBody);
        break;
      
      case "function-call":
      case "tool-calls":
        await handleFunctionCall(normalizedBody);
        break;
      
      case "end-of-call-report":
        savedCall = await handleEndOfCallReport(normalizedBody);
        // Process automation rules after call ends
        if (savedCall) {
          await processAutomationRules(savedCall, normalizedBody);
        }
        break;
      
      case "hang":
        await handleHang(normalizedBody);
        break;
      
      case "speech-update":
      case "conversation-update":
        // These are informational events, we can log but don't need to process
        console.log("ℹ️ Informational event:", normalizedBody.type);
        break;
      
      default:
        console.log("⚠️ Unknown event type:", normalizedBody.type);
        console.log("📋 Full event data:", JSON.stringify(normalizedBody, null, 2));
    }

    // Process automation rules for status updates (for keyword matching on transcript)
    if (normalizedBody.type === "status-update" && savedCall && normalizedBody.transcript) {
      await processAutomationRules(savedCall, normalizedBody);
    }

    // Always return success to acknowledge receipt
    return NextResponse.json({ 
      success: true,
      received: true 
    });
  } catch (error: any) {
    console.error("Error processing Vapi webhook:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Handle call status updates
async function handleStatusUpdate(event: VapiEvent) {
  if (!event.call?.id) {
    console.log("⚠️ No call ID in status-update event");
    return null;
  }

  // Safety check for prisma
  if (!prisma) {
    console.error("❌ Prisma client is not initialized");
    return null;
  }

  // Find or create call record
  const callId = event.call.id;
  const callStatus = event.call.status;
  console.log("📞 Processing status-update for call:", callId, "Status:", callStatus);
  
  const existingCall = await prisma.voiceCall.findUnique({
    where: { vapiCallId: callId },
  });

  const callData: any = {
    vapiCallId: callId,
    status: callStatus,
    assistantId: event.call.assistantId,
    assistantName: event.call.assistantName,
    fromNumber: event.call.from || event.call.fromNumber,
    toNumber: event.call.to || event.call.toNumber,
  };

  if (event.call.startedAt) {
    callData.startedAt = new Date(event.call.startedAt);
  }

  if (event.call.endedAt) {
    callData.endedAt = new Date(event.call.endedAt);
  }

  if (event.call.duration) {
    callData.duration = event.call.duration;
  }

  if (event.call.cost) {
    callData.cost = event.call.cost;
  }

  if (existingCall) {
    const updated = await prisma.voiceCall.update({
      where: { id: existingCall.id },
      data: callData,
    });
    return updated;
  } else {
    // Try to find organization by assistant ID or use a default
    // You may need to map assistantId to organizationId
    const organization = await findOrganizationByAssistant(event.call.assistantId);
    
    if (organization) {
      const created = await prisma.voiceCall.create({
        data: {
          ...callData,
          organizationId: organization.id,
        },
      });
      return created;
    }
  }
  
  return null;
}

// Handle transcript updates
async function handleTranscriptUpdate(event: VapiEvent) {
  if (!event.call?.id || !event.transcript) return;

  const call = await prisma.voiceCall.findUnique({
    where: { vapiCallId: event.call.id },
  });

  if (call) {
    // Append transcript or update
    const existingTranscript = call.transcript || "";
    const newTranscript = existingTranscript 
      ? `${existingTranscript}\n${event.transcript}`
      : event.transcript;

    await prisma.voiceCall.update({
      where: { id: call.id },
      data: {
        transcript: newTranscript,
        lastTranscriptUpdate: new Date(),
      },
    });
  }
}

// Handle function calls (e.g., booking appointments)
async function handleFunctionCall(event: VapiEvent) {
  if (!event.call?.id || !event.functionCall) return;

  const call = await prisma.voiceCall.findUnique({
    where: { vapiCallId: event.call.id },
  });

  if (call) {
    // Store function call in metadata
    const metadata = (call.metadata as any) || {};
    const functionCalls = metadata.functionCalls || [];
    
    functionCalls.push({
      name: event.functionCall.name,
      parameters: event.functionCall.parameters,
      timestamp: new Date().toISOString(),
    });

    await prisma.voiceCall.update({
      where: { id: call.id },
      data: {
        metadata: {
          ...metadata,
          functionCalls,
        },
      },
    });

    // If it's a booking function, create a lead or appointment
    if (event.functionCall.name === "book_appointment" || event.functionCall.name.includes("book")) {
      await handleAppointmentBooking(call, event.functionCall.parameters);
    }
  }
}

// Handle end of call report
async function handleEndOfCallReport(event: VapiEvent) {
  const callId = event.call?.id;
  
  if (!callId) {
    console.log("⚠️ No call ID in end-of-call-report event");
    return null;
  }

  console.log("📊 Processing end-of-call-report for call:", callId);

  // Extract transcript from various possible locations in the Vapi response
  const rawEvent = event as any;
  let transcript = null;
  
  // Try to get transcript from artifact messages
  if (rawEvent.message?.artifact?.messages) {
    const messages = rawEvent.message.artifact.messages;
    transcript = messages.map((m: any) => {
      const role = m.role === 'assistant' ? 'AI' : m.role === 'user' ? 'Caller' : m.role;
      return `${role}: ${m.message || m.content || ''}`;
    }).filter((m: string) => m.length > 5).join('\n');
  }
  
  // Fallback to artifact.transcript if available
  if (!transcript && rawEvent.message?.artifact?.transcript) {
    transcript = rawEvent.message.artifact.transcript;
  }
  
  // Fallback to direct transcript field
  if (!transcript && rawEvent.transcript) {
    transcript = rawEvent.transcript;
  }

  const call = await prisma.voiceCall.findUnique({
    where: { vapiCallId: callId },
  });

  if (call) {
    const updated = await prisma.voiceCall.update({
      where: { id: call.id },
      data: {
        status: "ended",
        endedAt: new Date(),
        duration: event.endOfCallReport?.duration || call.duration,
        cost: event.endOfCallReport?.cost || call.cost,
        summary: event.endOfCallReport?.summary,
        outcome: event.endOfCallReport?.outcome || (event.endOfCallReport?.summary ? 'completed' : undefined),
        transcript: transcript || call.transcript,
        lastTranscriptUpdate: transcript ? new Date() : call.lastTranscriptUpdate,
        metadata: {
          ...((call.metadata as any) || {}),
          endOfCallReport: event.endOfCallReport,
          analysis: (event as any).message?.analysis,
        },
      },
    });
    console.log("✅ Updated call record with end-of-call-report, transcript:", !!transcript);
    return updated;
  } else {
    console.log("⚠️ Call not found for end-of-call-report:", callId);
    // Try to create the call record if it doesn't exist
    const organization = await findOrganizationByAssistant(event.call?.assistantId);
    if (organization) {
      const created = await prisma.voiceCall.create({
        data: {
          vapiCallId: callId,
          status: "ended",
          endedAt: new Date(),
          summary: event.endOfCallReport?.summary,
          outcome: event.endOfCallReport?.outcome || 'completed',
          transcript: transcript,
          lastTranscriptUpdate: transcript ? new Date() : null,
          assistantId: event.call?.assistantId,
          assistantName: event.call?.assistantName,
          organizationId: organization.id,
          metadata: {
            endOfCallReport: event.endOfCallReport,
            analysis: (event as any).message?.analysis,
          },
        },
      });
      console.log("✅ Created call record from end-of-call-report, transcript:", !!transcript);
      return created;
    }
  }
  
  return null;
}

// Handle hang events
async function handleHang(event: VapiEvent) {
  if (!event.call?.id) return;

  const call = await prisma.voiceCall.findUnique({
    where: { vapiCallId: event.call.id },
  });

  if (call) {
    await prisma.voiceCall.update({
      where: { id: call.id },
      data: {
        status: "hung",
        endedAt: new Date(),
      },
    });
  }
}

// Helper: Find organization by assistant ID
async function findOrganizationByAssistant(assistantId?: string) {
  if (!assistantId) {
    // If no assistant ID, return the first organization with voice AI enabled
    const org = await prisma.organization.findFirst({
      where: { voiceAiEnabled: true }
    });
    return org;
  }
  
  // Find organization that has this assistant ID configured
  const org = await prisma.organization.findFirst({
    where: { 
      vapiAssistantId: assistantId,
      voiceAiEnabled: true
    }
  });
  
  // If not found by assistant ID, return first org with voice AI enabled as fallback
  if (!org) {
    const fallbackOrg = await prisma.organization.findFirst({
      where: { voiceAiEnabled: true }
    });
    return fallbackOrg;
  }
  
  return org;
}

// Helper: Handle appointment booking from function call
async function handleAppointmentBooking(call: any, parameters: any) {
  if (!call.organizationId) return;

  // Extract appointment details from function call parameters
  const { name, phone, email, date, time, service } = parameters || {};

  // Create a lead from the appointment booking
  if (name && (phone || email)) {
    try {
      await prisma.lead.create({
        data: {
          name: name,
          email: email || "",
          phone: phone || "",
          source: "AI Voice Call",
          status: "NEW",
          category: "SALES",
          score: 80, // High score for voice call bookings
          organizationId: call.organizationId,
          sourceCallId: call.id,
        },
      });
    } catch (error) {
      console.error("Error creating lead from appointment booking:", error);
    }
  }
}

// Process automation rules for a call
async function processAutomationRules(call: any, event: VapiEvent) {
  try {
    if (!call.organizationId) return;

    // Get enabled automation rules for this organization
    const rules = await prisma.callAutomationRule.findMany({
      where: {
        organizationId: call.organizationId,
        enabled: true
      }
    });

    const transcript = call.transcript || event.transcript || '';
    const summary = call.summary || '';
    const outcome = call.outcome || '';
    const duration = call.duration || 0;

    for (const rule of rules) {
      const conditions = rule.conditions as any;
      const actions = rule.actions as any;
      let shouldExecute = false;

      // Check trigger conditions
      switch (rule.triggerType) {
        case 'keyword_match':
          if (conditions.keywords && Array.isArray(conditions.keywords)) {
            const textToSearch = `${transcript} ${summary}`.toLowerCase();
            shouldExecute = conditions.keywords.some((keyword: string) =>
              textToSearch.includes(keyword.toLowerCase())
            );
          }
          break;

        case 'outcome_match':
          if (conditions.outcomes && Array.isArray(conditions.outcomes)) {
            shouldExecute = conditions.outcomes.includes(outcome);
          }
          break;

        case 'duration_threshold':
          if (conditions.minDuration && duration >= conditions.minDuration) {
            shouldExecute = true;
          }
          if (conditions.maxDuration && duration <= conditions.maxDuration) {
            shouldExecute = true;
          }
          break;

        case 'status_change':
          if (conditions.statuses && Array.isArray(conditions.statuses)) {
            shouldExecute = conditions.statuses.includes(call.status);
          }
          break;
      }

      if (shouldExecute) {
        // Execute actions
        await executeRuleActions(call, actions);
      }
    }
  } catch (error) {
    console.error("Error processing automation rules:", error);
  }
}

// Execute automation rule actions
async function executeRuleActions(call: any, actions: any) {
  try {
    if (actions.type === 'tag' && actions.tagId) {
      // Apply tag
      await prisma.callTagAssignment.create({
        data: {
          callId: call.id,
          tagId: actions.tagId
        }
      }).catch(() => {
        // Tag already applied, ignore
      });
    }

    if (actions.type === 'assign' && actions.userId) {
      // Assign call
      await prisma.callAssignment.upsert({
        where: { callId: call.id },
        update: {
          assignedToId: actions.userId,
          assignedById: actions.userId // System assignment
        },
        create: {
          callId: call.id,
          assignedToId: actions.userId,
          assignedById: actions.userId
        }
      });
    }

    if (actions.type === 'create_lead') {
      // Extract contact info and create lead
      await handleCallToLead(call);
    }

    if (actions.type === 'webhook' && actions.webhookId) {
      // Trigger custom webhook
      await triggerCustomWebhook(call, actions.webhookId);
    }
  } catch (error) {
    console.error("Error executing rule actions:", error);
  }
}

// Extract contact info from call and create lead
async function handleCallToLead(call: any) {
  if (!call.organizationId) return;

  // Try to extract name, phone, email from transcript or metadata
  const transcript = call.transcript || '';
  const metadata = call.metadata as any;
  
  // Simple extraction (can be enhanced with AI/NLP)
  const phoneMatch = transcript.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const emailMatch = transcript.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  
  // Extract name (look for patterns like "my name is X" or "I'm X")
  let name = '';
  const namePatterns = [
    /(?:my name is|i'm|i am|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /(?:name|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = transcript.match(pattern);
    if (match && match[1]) {
      name = match[1].trim();
      break;
    }
  }

  // Use metadata if available
  const extractedName = metadata?.contactInfo?.name || name;
  const extractedPhone = metadata?.contactInfo?.phone || phoneMatch?.[0] || call.fromNumber;
  const extractedEmail = metadata?.contactInfo?.email || emailMatch?.[0];

  if (extractedName && (extractedPhone || extractedEmail)) {
    try {
      await prisma.lead.create({
        data: {
          name: extractedName,
          email: extractedEmail || "",
          phone: extractedPhone || "",
          source: "AI Voice Call",
          status: "NEW",
          category: "SALES",
          score: 75,
          organizationId: call.organizationId,
          sourceCallId: call.id,
        },
      });
      console.log("✅ Created lead from call:", call.id);
    } catch (error) {
      console.error("Error creating lead from call:", error);
    }
  }
}

// Trigger custom webhook
async function triggerCustomWebhook(call: any, webhookId: string) {
  try {
    const webhook = await prisma.callWebhook.findUnique({
      where: { id: webhookId }
    });

    if (!webhook || !webhook.enabled) return;

    // Check if this event type should trigger the webhook
    const events = webhook.events as string[];
    // For now, trigger on all events (can be filtered later)

    const payload = {
      event: 'call_updated',
      call: {
        id: call.id,
        vapiCallId: call.vapiCallId,
        status: call.status,
        fromNumber: call.fromNumber,
        toNumber: call.toNumber,
        duration: call.duration,
        cost: call.cost,
        summary: call.summary,
        outcome: call.outcome,
        startedAt: call.startedAt,
        endedAt: call.endedAt,
      },
      timestamp: new Date().toISOString()
    };

    // Send webhook (fire and forget)
    fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': webhook.secret || '',
      },
      body: JSON.stringify(payload)
    }).catch(error => {
      console.error("Error sending webhook:", error);
    });
  } catch (error) {
    console.error("Error triggering webhook:", error);
  }
}

// GET endpoint for webhook verification/health check
export async function GET(req: Request) {
  return NextResponse.json({ 
    status: "ok", 
    message: "Vapi webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}

