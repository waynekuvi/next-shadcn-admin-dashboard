# 🧪 Testing Your Vapi Webhook - Quick Guide

## ✅ Pre-Test Status

Run this to check everything:
```bash
./test-webhook.sh
```

---

## 🎯 How to Test

### Step 1: Make a Test Call

1. Go to your Vapi Dashboard
2. Navigate to your Assistant
3. Click "Test" or make a real call
4. Have a conversation

### Step 2: Watch Your Server Console

You should see logs like:
```
Vapi webhook received: status-update call_abc123
Vapi webhook received: transcript-update call_abc123
Vapi webhook received: end-of-call-report call_abc123
```

### Step 3: Check Vapi Webhook Logs

1. Go to: **https://dashboard.vapi.ai/webhooks** (or Webhook Logs)
2. Look for recent webhook deliveries
3. Check status codes (should be 200)

### Step 4: Verify Database

After a call, check if data was stored:
- Calls should appear in your `VoiceCall` table
- Transcripts should be saved
- Appointment bookings should create leads

---

## 🔍 What to Look For

### ✅ Success Signs

- Server console shows webhook events
- No errors in logs
- Vapi dashboard shows successful deliveries (200 status)
- Database has new records

### ❌ If Something's Wrong

**No webhooks arriving?**
- Check ngrok is still running
- Verify URL in Vapi dashboard matches exactly
- Check Vapi webhook logs for errors

**Errors in console?**
- Check database connection
- Verify `VAPI_API_KEY` is set
- Check Prisma client is generated

---

## 📊 Test Webhook Manually

You can also test the endpoint directly:

```bash
curl -X POST http://localhost:3000/api/webhooks/vapi \
  -H "Content-Type: application/json" \
  -d '{
    "type": "status-update",
    "call": {
      "id": "test-call-123",
      "status": "in-progress",
      "assistantId": "test-assistant",
      "startedAt": "2024-12-04T08:00:00Z"
    }
  }'
```

Expected response: `{"success":true,"received":true}`

---

## 🚀 After Testing

Once webhooks are working:
1. ✅ I'll build the dashboard UI
2. ✅ Add real-time call monitoring
3. ✅ Create call statistics
4. ✅ Build transcript viewer

Make a test call and let me know what you see! 🎉

