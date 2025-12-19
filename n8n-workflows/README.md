# n8n SMS Workflows - Quick Import Guide

## 📦 Import Workflows (Fastest Method)

### Option 1: Import JSON Files (Recommended)

1. **Open n8n dashboard**
2. Click **"Workflows"** → **"Import from File"**
3. Select `sms-reminder-workflow.json`
4. **Configure**:
   - Update `YOUR_VONAGE_NUMBER` in Vonage node
   - Add your Vonage API credentials
   - Update status callback URL (if not using localhost)
5. **Activate** the workflow
6. **Copy the webhook URL** from the Webhook node

7. **Repeat** for `sms-followup-workflow.json`

---

### Option 2: Manual Setup (Step-by-Step)

Follow the detailed guides:
- `SMS_REMINDER_WORKFLOW.md` - For reminder campaigns
- `SMS_FOLLOWUP_WORKFLOW.md` - For follow-up campaigns
- `QUICK_START.md` - 5-minute quick setup

---

## 🔧 Configuration Checklist

### For Both Workflows:

- [ ] **Vonage Node**: 
  - Replace `YOUR_VONAGE_NUMBER` with your actual Vonage number
  - Add Vonage API credentials (API Key & Secret)
  
- [ ] **Status Callback URL**:
  - Local: `http://localhost:3000/api/webhooks/sms-status`
  - Production: `https://yourdomain.com/api/webhooks/sms-status`
  - Or use ngrok: `https://your-ngrok-url.ngrok.io/api/webhooks/sms-status`

- [ ] **Activate Workflows**: Toggle "Active" switch ON

- [ ] **Copy Webhook URLs**: 
  - Reminder: `https://your-n8n.com/webhook/sms-reminder`
  - Follow-up: `https://your-n8n.com/webhook/sms-followup`

---

## 📤 What to Share with Me

Once workflows are set up, share:

1. **Reminder Webhook URL**: `https://...`
2. **Follow-up Webhook URL**: `https://...`
3. **Your Organization ID** (or I can look it up)

I'll configure them in your app!

---

## 🧪 Testing

### Test Reminder Workflow:
```bash
curl -X POST https://your-n8n.com/webhook/sms-reminder \
  -H "Content-Type: application/json" \
  -d '{
    "executionId": "test-123",
    "phoneNumber": "+447911123456",
    "customerName": "Test User",
    "variables": {
      "name": "Test User",
      "date": "10th December 2025",
      "time": "2:00 PM",
      "service": "Test Service"
    },
    "messages": [{
      "sequence": 1,
      "delay": 0,
      "message": "Hi {{name}}, your appointment on {{date}} at {{time}} is confirmed!"
    }]
  }'
```

### Test Follow-up Workflow:
Same as above, but use `sms-followup` endpoint.

---

## 📋 Workflow Structure

### Reminder Workflow:
```
Webhook → Replace Variables → Send SMS → Status Callback → Respond
```

### Follow-up Workflow:
```
Webhook → Wait 24h → Replace Variables → Send SMS → Status Callback → Respond
```

---

## 🐛 Troubleshooting

**Webhook not receiving data?**
- Check n8n workflow is ACTIVE
- Verify webhook URL is correct
- Check n8n execution logs

**SMS not sending?**
- Verify Vonage credentials
- Check Vonage number format (E.164: +447911123456)
- Check Vonage account balance

**Status callback failing?**
- Verify your app is running
- Check URL is accessible from n8n
- Use ngrok for local testing

---

## 📞 Next Steps

1. ✅ Import/create workflows
2. ✅ Configure Vonage credentials
3. ✅ Activate workflows
4. ✅ Copy webhook URLs
5. ✅ Share URLs with me
6. ✅ I'll configure in app
7. ✅ Test with real appointment!





