# Workflow Test Guide

## ✅ Workflow Structure Verified

Your workflow is **correctly configured**! All issues have been fixed:

- ✅ HTTP Request nodes have correct node references (no backticks)
- ✅ Second Code node properly gets data from first Code node
- ✅ Sequence handling is correct (1 → 2)
- ✅ All connections are properly set up
- ✅ Status callbacks are configured correctly

---

## How to Test

### Step 1: Import & Activate Workflow

1. Copy your workflow JSON
2. In n8n: Click **"Import from File"** or paste JSON
3. **Activate** the workflow (toggle switch)
4. **Copy the webhook URL** from the Webhook node

### Step 2: Test with Sample Payload

Use this test payload (or use the one in `TEST_PAYLOAD.json`):

```json
{
  "executionId": "test-exec-123",
  "phoneNumber": "+447911123456",
  "variables": {
    "name": "John Doe",
    "date": "2024-12-20",
    "time": "14:00",
    "service": "Dental Checkup",
    "phone": "+447911123456",
    "address": "123 Main St, London"
  },
  "messages": [
    {
      "sequence": 1,
      "delay": 0,
      "message": "Hi {{name}}, you have an appointment on {{date}} at {{time}} for {{service}}."
    },
    {
      "sequence": 2,
      "delay": 24,
      "message": "Reminder: Your {{service}} appointment is tomorrow at {{time}}. See you at {{address}}!"
    }
  ]
}
```

### Step 3: Send Test Request

**Option A: Using curl**
```bash
curl -X POST http://your-n8n-url/webhook/sms-reminder \
  -H "Content-Type: application/json" \
  -d @TEST_PAYLOAD.json
```

**Option B: Using Postman/Insomnia**
- Method: `POST`
- URL: Your n8n webhook URL
- Body: JSON (paste the test payload above)

**Option C: Test in n8n**
1. Click **"Execute Workflow"** button
2. In the Webhook node, click **"Test URL"** or use the webhook URL
3. Send the payload

### Step 4: Verify Execution

Check each node's output:

1. **Webhook** → Should show incoming payload
2. **Code in JavaScript** → Should show:
   - `executionId`: "test-exec-123"
   - `phoneNumber`: "+447911123456"
   - `message`: "Hi John Doe, you have an appointment on 2024-12-20 at 14:00 for Dental Checkup."
   - `sequence`: 1
3. **Send an SMS** → Should show Vonage response with `messageId`
4. **HTTP Request** → Should show response from your app: `{"success": true}`
5. **Wait** → Will wait 24 hours (or delay from `allMessages[1].delay`)
6. **Code in JavaScript1** → Should show:
   - `message`: "Reminder: Your Dental Checkup appointment is tomorrow at 14:00. See you at 123 Main St, London!"
   - `sequence`: 2
7. **Send an SMS1** → Should send second message
8. **HTTP Request1** → Should callback status again

---

## Expected Behavior

### Immediate (Sequence 1)
1. ✅ First message sent immediately
2. ✅ Status callback sent to `http://localhost:3000/api/webhooks/sms-status`
3. ✅ Wait node starts (24 hours delay)

### After Delay (Sequence 2)
1. ✅ Second message sent after delay
2. ✅ Status callback sent again

---

## Troubleshooting

### Issue: "executionId is undefined" in HTTP Request
**Fix**: Make sure node name is exactly `"Code in JavaScript"` (case-sensitive)

### Issue: Second message not sending
**Fix**: Check that:
- Wait node is configured correctly
- Second Code node references `$('Code in JavaScript')`
- `allMessages[1]` exists and has a `delay` property

### Issue: Status callback fails
**Fix**: 
- Make sure your app is running on `localhost:3000`
- Or update URL to your production domain
- Check that `/api/webhooks/sms-status` endpoint exists

### Issue: Variables not replacing
**Fix**: Check that:
- Variables are in the payload: `variables.name`, `variables.date`, etc.
- Message text uses `{{variable}}` format (double curly braces)

---

## Integration with App

Once tested, configure in your app:

1. **Get webhook URL** from n8n Webhook node
2. **Update organization** in database:
   ```sql
   UPDATE "Organization" 
   SET "smsReminderWebhookUrl" = 'https://your-n8n-url/webhook/sms-reminder'
   WHERE id = 'your-org-id';
   ```
3. **Create SMS Campaign** with messages
4. **Book appointment** → Should trigger workflow automatically

---

## Next Steps

1. ✅ Test workflow with sample payload
2. ✅ Verify both messages send correctly
3. ✅ Check status callbacks are received
4. ✅ Configure webhook URL in app
5. ✅ Test with real appointment booking





