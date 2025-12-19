# SMS Campaign Test Mode

## Overview

Test your SMS campaigns **without creating n8n workflows or spending SMS credits**. The test mode simulates the entire workflow execution so you can see exactly how your campaigns will work.

## How to Use

### Step 1: Create a Campaign
1. Go to **Dashboard → SMS**
2. Create a new campaign (Reminder or Follow-up)
3. Add messages with variables like `{{name}}`, `{{date}}`, `{{time}}`, etc.

### Step 2: Create a Test Appointment
1. Go to **Dashboard → Appointments**
2. Create a test appointment with:
   - Customer name
   - Phone number (can be fake for testing)
   - Date/time
   - Service type

### Step 3: Test the Campaign
1. Go back to **Dashboard → SMS**
2. Find your campaign
3. Click the **"Test"** button
4. Select an appointment from the dropdown
5. Click **"Run Test"**

## What Happens During Test

✅ **Simulated Execution:**
- Creates an execution record in the database
- Processes variables and replaces them in messages
- Shows you the final message that would be sent
- Updates execution status to "SENT"

❌ **What Doesn't Happen:**
- No actual SMS is sent
- No n8n webhook is called
- No SMS credits are used
- No external API calls

## Test Results

After running a test, you'll see:
- **Execution ID** - The database record ID
- **Status** - "SENT" (simulated)
- **Message Preview** - The final message with variables replaced
- **Note** - Confirmation that no SMS was sent

## Example Test Flow

1. **Create Campaign:**
   - Name: "Appointment Reminder"
   - Type: Reminder
   - Trigger: Appointment Booked

2. **Add Message:**
   ```
   Hi {{name}}, you have an appointment on {{date}} at {{time}} for {{service}}.
   ```

3. **Create Test Appointment:**
   - Name: John Doe
   - Date: Tomorrow at 2 PM
   - Service: Dental Checkup

4. **Run Test:**
   - Result: "Hi John Doe, you have an appointment on 12/21/2024 at 2:00 PM for Dental Checkup."

## Benefits

- ✅ Test message formatting
- ✅ Verify variable replacement
- ✅ Check campaign logic
- ✅ No cost or setup required
- ✅ Instant feedback

## API Endpoint

You can also test programmatically:

```bash
POST /api/sms/test
{
  "appointmentId": "appt_123",
  "type": "REMINDER"
}
```

## Next Steps

Once you're happy with the test results:
1. Set up your n8n workflows (when ready)
2. Add webhook URLs in Settings → Integrations
3. Enable SMS in Settings → Integrations
4. Real campaigns will trigger automatically!





