# Vapi Real-Time Appointment Booking Setup

This guide shows how to enable your AI Receptionist to book appointments directly during phone calls.

## How It Works

```
Customer: "I need a plumber tomorrow at 9 AM"
         ↓
AI Receptionist: "Let me book that for you..."
         ↓
[Vapi calls your bookAppointment function]
         ↓
[Appointment saved to database]
         ↓
AI Receptionist: "Perfect! I've booked you in for tomorrow at 9 AM."
```

## Step 1: Add Functions to Your Vapi Assistant

In your Vapi Dashboard, go to your Assistant and add these functions:

### Function 1: Book Appointment

```json
{
  "name": "bookAppointment",
  "description": "Book an appointment for a customer. Use this when the customer wants to schedule a service visit, meeting, or appointment.",
  "parameters": {
    "type": "object",
    "properties": {
      "customerName": {
        "type": "string",
        "description": "The customer's full name"
      },
      "customerPhone": {
        "type": "string",
        "description": "The customer's phone number"
      },
      "date": {
        "type": "string",
        "description": "The appointment date (e.g., 'tomorrow', 'Monday', 'December 5th')"
      },
      "time": {
        "type": "string",
        "description": "The appointment time (e.g., '9 AM', '2:30 PM')"
      },
      "serviceType": {
        "type": "string",
        "description": "Type of service needed (e.g., 'boiler repair', 'dental checkup', 'consultation')"
      },
      "address": {
        "type": "string",
        "description": "Customer's address for service calls"
      }
    },
    "required": ["customerName", "date"]
  },
  "server": {
    "url": "https://YOUR_DOMAIN/api/appointments/book"
  }
}
```

### Function 2: Check Availability (Optional)

```json
{
  "name": "checkAvailability",
  "description": "Check available appointment slots for a specific date. Use this when the customer asks about availability.",
  "parameters": {
    "type": "object",
    "properties": {
      "date": {
        "type": "string",
        "description": "The date to check (e.g., 'tomorrow', 'next Monday')"
      },
      "time": {
        "type": "string",
        "description": "Optional specific time to check"
      }
    },
    "required": ["date"]
  },
  "server": {
    "url": "https://YOUR_DOMAIN/api/appointments/book"
  }
}
```

## Step 2: Update Assistant Prompt

Add this to your assistant's system prompt:

```
APPOINTMENT BOOKING:
When a customer wants to book an appointment:
1. Get their name if you don't have it
2. Ask what service they need
3. Ask when they'd like to come in
4. Collect their phone number for confirmation
5. Use the bookAppointment function to book it
6. Confirm the booking details with them

If they ask about availability:
1. Use checkAvailability to see open slots
2. Suggest available times

Example:
Customer: "I need to book an appointment"
You: "Of course! What's your name, please?"
Customer: "John Smith"
You: "Thanks John. What service do you need?"
Customer: "Boiler repair"
You: "Got it. When would you like us to come out?"
Customer: "Tomorrow at 9 AM"
You: [Call bookAppointment with collected details]
You: "Perfect, John! I've booked you in for tomorrow at 9 AM for boiler repair. Someone will call to confirm. Anything else?"
```

## Step 3: Configure Server URL

Replace `YOUR_DOMAIN` with your actual domain:

- **Production**: `https://yourdomain.com/api/appointments/book`
- **Development/Testing**: Use ngrok to expose localhost
  ```bash
  ngrok http 3000
  # Then use the ngrok URL in Vapi
  ```

## Testing

Test the booking flow:

1. Call your Vapi phone number
2. Say: "I need to book an appointment"
3. Provide: Name, service type, date/time
4. Check that the appointment appears in your portal

## Supported Date/Time Formats

The system understands:
- "today", "tomorrow"
- Days: "Monday", "Tuesday", etc.
- Dates: "the 5th", "December 5th"
- Times: "9 AM", "2:30 PM", "9 o'clock"

## View Booked Appointments

All appointments booked by the AI Receptionist appear in:
- **Portal**: /dashboard/appointments
- **API**: GET /api/appointments

## Webhook Events

Appointments trigger these activities:
- Lead auto-created if customer is new
- Activity logged
- (Future) Calendar sync with Google Calendar

