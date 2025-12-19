# 🧪 Testing Your Vapi Webhook

## Quick Test Checklist

### ✅ Pre-Test Verification

1. **Ngrok is running** - Check your ngrok terminal window
2. **Dev server is running** - Check port 3000 is active
3. **Webhook URL configured in Vapi** - Should be saved in dashboard
4. **Environment variable set** - `VAPI_API_KEY` in `.env.local`

---

## Test Methods

### Method 1: Make a Real Call (Recommended)

1. **Make a test call** through your Vapi assistant
2. **Watch your server console** - You should see:
   ```
   Vapi webhook received: status-update <call-id>
   Vapi webhook received: transcript-update <call-id>
   Vapi webhook received: end-of-call-report <call-id>
   ```
3. **Check your database** - Call should be stored automatically

### Method 2: Check Webhook Logs in Vapi

1. Go to: **https://dashboard.vapi.ai/webhooks** (or check Webhook Logs)
2. Look for recent webhook attempts
3. Check if they're successful (200 status) or failing

### Method 3: Manual Webhook Test

You can test the endpoint directly:

```bash
curl -X POST http://localhost:3000/api/webhooks/vapi \
  -H "Content-Type: application/json" \
  -d '{
    "type": "status-update",
    "call": {
      "id": "test-call-123",
      "status": "in-progress",
      "assistantId": "test-assistant"
    }
  }'
```

---

## What to Look For

### ✅ Success Indicators

- **Server console shows:** `"Vapi webhook received: ..."`
- **No errors** in server logs
- **Database has records** - Check `VoiceCall` table
- **Vapi dashboard shows** successful webhook deliveries

### ❌ Troubleshooting

**If webhooks aren't arriving:**
1. Check ngrok is still running
2. Verify URL in Vapi dashboard matches exactly
3. Check server console for errors
4. Verify `VAPI_API_KEY` is set

**If you see errors:**
- Check database connection
- Verify Prisma client is generated
- Check server logs for specific error messages

---

## Database Check

After a test call, verify data was stored:

```bash
# Check if calls are being stored (you can add this to your API later)
```

Or check your database directly - you should see records in the `VoiceCall` table.

---

## Next Steps After Testing

Once webhooks are working:
1. ✅ I'll build the dashboard UI
2. ✅ Add call statistics cards
3. ✅ Create call logs viewer
4. ✅ Build transcript viewer
5. ✅ Add real-time updates

Ready to test! Make a call and let me know what you see in the console! 🚀

