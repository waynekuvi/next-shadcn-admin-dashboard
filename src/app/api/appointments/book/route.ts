import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { triggerSMSCampaign } from "@/lib/sms-campaigns";

/**
 * Vapi Function Endpoint: bookAppointment
 * 
 * This endpoint is called by Vapi during a phone call when the AI
 * needs to book an appointment for a customer.
 * 
 * Vapi sends a POST request with the function call details.
 */

// Helper to parse date/time from natural language
function parseDateTime(dateStr: string, timeStr?: string): Date | null {
  const now = new Date();
  let targetDate = new Date();
  
  // Parse date
  const dateLower = dateStr.toLowerCase();
  if (dateLower.includes('today')) {
    // Keep today
  } else if (dateLower.includes('tomorrow')) {
    targetDate.setDate(targetDate.getDate() + 1);
  } else if (dateLower.includes('monday')) {
    targetDate = getNextWeekday(now, 1);
  } else if (dateLower.includes('tuesday')) {
    targetDate = getNextWeekday(now, 2);
  } else if (dateLower.includes('wednesday')) {
    targetDate = getNextWeekday(now, 3);
  } else if (dateLower.includes('thursday')) {
    targetDate = getNextWeekday(now, 4);
  } else if (dateLower.includes('friday')) {
    targetDate = getNextWeekday(now, 5);
  } else if (dateLower.includes('saturday')) {
    targetDate = getNextWeekday(now, 6);
  } else if (dateLower.includes('sunday')) {
    targetDate = getNextWeekday(now, 0);
  } else {
    // Try to parse date like "5th", "the 5th", "December 5th"
    const dayMatch = dateLower.match(/(\d{1,2})(?:st|nd|rd|th)?/);
    if (dayMatch) {
      const day = parseInt(dayMatch[1]);
      targetDate.setDate(day);
      // If the day has passed this month, assume next month
      if (targetDate < now) {
        targetDate.setMonth(targetDate.getMonth() + 1);
      }
    }
  }
  
  // Parse time
  if (timeStr) {
    const timeLower = timeStr.toLowerCase().replace(/\s+/g, '');
    const timeMatch = timeLower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const period = timeMatch[3];
      
      if (period === 'pm' && hours !== 12) {
        hours += 12;
      } else if (period === 'am' && hours === 12) {
        hours = 0;
      }
      
      targetDate.setHours(hours, minutes, 0, 0);
    }
  }
  
  return targetDate;
}

function getNextWeekday(fromDate: Date, targetDay: number): Date {
  const result = new Date(fromDate);
  const currentDay = result.getDay();
  let daysToAdd = targetDay - currentDay;
  if (daysToAdd <= 0) {
    daysToAdd += 7;
  }
  result.setDate(result.getDate() + daysToAdd);
  return result;
}

// Format date for response
function formatAppointmentDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Vapi sends function calls in this format
    // The actual parameters are in message.functionCall.parameters
    const { message } = body;
    
    // Handle Vapi function call format
    if (message?.type === 'function-call' || message?.functionCall) {
      const functionCall = message.functionCall || message;
      const { name, parameters } = functionCall;
      
      if (name === 'bookAppointment') {
        return handleBookAppointment(parameters, body);
      }
      
      if (name === 'checkAvailability') {
        return handleCheckAvailability(parameters, body);
      }
    }
    
    // Direct API call format (for testing or portal use)
    if (body.customerName || body.date) {
      return handleBookAppointment(body, body);
    }
    
    return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
    
  } catch (error: any) {
    console.error("Appointment booking error:", error);
    return NextResponse.json(
      { 
        error: "Failed to book appointment",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

async function handleBookAppointment(params: any, fullBody: any) {
  const {
    customerName,
    customerPhone,
    customerEmail,
    date,
    time,
    serviceType,
    address,
    notes,
    organizationId,
  } = params;
  
  // Get organization ID from call metadata or use default
  const orgId = organizationId || fullBody.call?.assistantId || await getDefaultOrganizationId();
  
  if (!customerName) {
    return NextResponse.json({
      result: "I need the customer's name to book the appointment. Could you please provide it?"
    });
  }
  
  if (!date) {
    return NextResponse.json({
      result: "I need to know when you'd like the appointment. What date works for you?"
    });
  }
  
  // Parse the date and time
  const appointmentDate = parseDateTime(date, time);
  
  if (!appointmentDate || isNaN(appointmentDate.getTime())) {
    return NextResponse.json({
      result: "I couldn't understand the date. Could you please tell me the date again, like 'tomorrow at 9 AM' or 'Monday at 2 PM'?"
    });
  }
  
  // Check if the time is in the past
  if (appointmentDate < new Date()) {
    return NextResponse.json({
      result: "That time has already passed. Could you give me a future date and time?"
    });
  }
  
  // Check for conflicting appointments
  const startWindow = new Date(appointmentDate);
  startWindow.setMinutes(startWindow.getMinutes() - 30);
  const endWindow = new Date(appointmentDate);
  endWindow.setMinutes(endWindow.getMinutes() + 60);
  
  const conflictingAppointment = await prisma.appointment.findFirst({
    where: {
      organizationId: orgId,
      date: {
        gte: startWindow,
        lte: endWindow,
      },
      status: {
        not: 'CANCELLED'
      }
    }
  });
  
  if (conflictingAppointment) {
    return NextResponse.json({
      result: `I'm sorry, we already have an appointment at that time. Would ${getAlternativeTime(appointmentDate)} work for you instead?`
    });
  }
  
  // Create the appointment
  const appointment = await prisma.appointment.create({
    data: {
      customerName,
      customerPhone: customerPhone || null,
      customerEmail: customerEmail || null,
      date: appointmentDate,
      serviceType: serviceType || null,
      address: address || null,
      notes: notes || null,
      organizationId: orgId,
      bookedVia: 'AI_RECEPTIONIST',
      sourceCallId: fullBody.call?.id || null,
    }
  });
  
  const formattedDate = formatAppointmentDate(appointmentDate);

  // Trigger SMS reminder campaign (immediate)
  try {
    await triggerSMSCampaign({
      type: "REMINDER",
      trigger: "APPOINTMENT_BOOKED",
      appointmentId: appointment.id,
      organizationId: orgId,
      delayHours: 0,
    });
  } catch (err) {
    console.error("Failed to trigger SMS reminder campaign", err);
  }
  
  // Return success message for Vapi to speak
  return NextResponse.json({
    result: `Perfect! I've booked ${customerName} in for ${formattedDate}${serviceType ? ` for ${serviceType}` : ''}. They'll receive a confirmation shortly. Is there anything else I can help with?`,
    appointment: {
      id: appointment.id,
      date: appointmentDate.toISOString(),
      customerName,
      serviceType,
    }
  });
}

async function handleCheckAvailability(params: any, fullBody: any) {
  const { date, time } = params;
  const orgId = params.organizationId || fullBody.call?.assistantId || await getDefaultOrganizationId();
  
  if (!date) {
    return NextResponse.json({
      result: "What date would you like me to check availability for?"
    });
  }
  
  const checkDate = parseDateTime(date, time);
  if (!checkDate) {
    return NextResponse.json({
      result: "I couldn't understand that date. Could you try again?"
    });
  }
  
  // Get start and end of the requested day
  const dayStart = new Date(checkDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(checkDate);
  dayEnd.setHours(23, 59, 59, 999);
  
  // Find all appointments for that day
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      organizationId: orgId,
      date: {
        gte: dayStart,
        lte: dayEnd,
      },
      status: {
        not: 'CANCELLED'
      }
    },
    orderBy: { date: 'asc' }
  });
  
  if (existingAppointments.length === 0) {
    return NextResponse.json({
      result: `We're wide open on ${checkDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}. What time would work best for you?`,
      available: true
    });
  }
  
  // Find available slots (assuming 9 AM - 5 PM working hours, 1-hour appointments)
  const workingHours = { start: 9, end: 17 };
  const bookedHours = existingAppointments.map(apt => new Date(apt.date).getHours());
  const availableSlots = [];
  
  for (let hour = workingHours.start; hour < workingHours.end; hour++) {
    if (!bookedHours.includes(hour)) {
      availableSlots.push(`${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'PM' : 'AM'}`);
    }
  }
  
  if (availableSlots.length === 0) {
    return NextResponse.json({
      result: `I'm sorry, we're fully booked on that day. Would you like me to check another date?`,
      available: false
    });
  }
  
  return NextResponse.json({
    result: `On ${checkDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}, we have availability at ${availableSlots.slice(0, 3).join(', ')}${availableSlots.length > 3 ? ' and more' : ''}. Which time works for you?`,
    available: true,
    slots: availableSlots
  });
}

function getAlternativeTime(date: Date): string {
  const alternative = new Date(date);
  alternative.setHours(alternative.getHours() + 1);
  return alternative.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

async function getDefaultOrganizationId(): Promise<string> {
  const org = await prisma.organization.findFirst();
  if (!org) throw new Error("No organization found");
  return org.id;
}

