# Quick Start: n8n SMS Workflows Setup

## 🚀 5-Minute Setup Guide

### Prerequisites
- n8n account (cloud or self-hosted)
- Vonage account with API credentials
- Vonage virtual number

---

## Step 1: Create Reminder Workflow (2 minutes)

1. **Create new workflow** → Name: "SMS Reminder"
2. **Add Webhook node**:
   - Method: `POST`
   - Path: `sms-reminder`
   - Click "Execute Node" → **Copy the webhook URL** 📋
3. **Add Code node** (paste the code from `SMS_REMINDER_WORKFLOW.md`)
4. **Add Vonage node**:
   - Operation: Send SMS
   - From: Your Vonage number
   - To: `={{ $json.phoneNumber }}`
   - Message: `={{ $json.message }}`
   - Add your Vonage API credentials
5. **Add HTTP Request node**:
   - Method: POST
   - URL: `http://localhost:3000/api/webhooks/sms-status` (or your domain)
   - Body: JSON with `executionId`, `messageId`, `status`, `timestamp`
6. **Save & Activate** ✅

---

## Step 2: Create Follow-up Workflow (2 minutes)

1. **Create new workflow** → Name: "SMS Follow-up"
2. **Add Webhook node**:
   - Method: `POST`
   - Path: `sms-followup`
   - Click "Execute Node" → **Copy the webhook URL** 📋
3. **Add Wait node**:
   - Amount: `24`
   - Unit: `Hours`
4. **Add Code node** (same as reminder, from `SMS_FOLLOWUP_WORKFLOW.md`)
5. **Add Vonage node** (same config as reminder)
6. **Add HTTP Request node** (same as reminder)
7. **Save & Activate** ✅

---

## Step 3: Configure in App (1 minute)

Once you have both webhook URLs, share them with me:

1. **Reminder Webhook URL**: `https://your-n8n.com/webhook/sms-reminder`
2. **Follow-up Webhook URL**: `https://your-n8n.com/webhook/sms-followup`

I'll configure them in your organization settings.

---

## 📋 What You'll Get from n8n

After creating the webhooks, you'll get URLs like:
- `https://your-n8n-instance.com/webhook/sms-reminder`
- `https://your-n8n-instance.com/webhook/sms-followup`

**Share these URLs with me and I'll configure everything!**

---

## 🧪 Testing

After configuration:
1. Book a test appointment → Should trigger reminder webhook
2. Check n8n → Should see webhook received
3. Check phone → Should receive SMS
4. Mark appointment as completed → Should trigger follow-up (24h delay)

---

## 📝 Notes

- **Local testing**: Use ngrok for webhook URLs if testing locally
- **Vonage credentials**: Add them in n8n credentials (Vonage API Key & Secret)
- **Status callback**: Make sure your app is accessible from n8n (use ngrok for local)

---

## Need Help?

If you get stuck:
1. Check n8n execution logs
2. Verify Vonage credentials
3. Test webhook with Postman/curl first
4. Share error messages and I'll help debug!





