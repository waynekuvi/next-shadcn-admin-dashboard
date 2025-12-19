# ✅ Your Vapi Webhook URL is Ready!

## Your Complete Webhook URL

```
https://anthroponomical-ammie-xerographically.ngrok-free.dev/api/webhooks/vapi
```

---

## Configure in Vapi Dashboard

### Step 1: Go to Vapi Settings
Visit: **https://dashboard.vapi.ai/settings/organization**

### Step 2: Configure Server URL
1. Scroll to the **"Server URL"** section
2. Paste this URL in the "Server URL" field:
   ```
   https://anthroponomical-ammie-xerographically.ngrok-free.dev/api/webhooks/vapi
   ```
3. Set **Timeout**: `20` seconds
4. Click **"Save"**

---

## Testing

After saving:
1. Make a test call through Vapi
2. Check your server console - you should see:
   ```
   Vapi webhook received: status-update <call-id>
   ```
3. Check your database - calls will be stored automatically

---

## Keep ngrok Running

**Important:** Keep the terminal where ngrok is running open. If you close it, the webhook will stop working.

---

## Next Steps

Once webhooks are working:
1. ✅ Run database migration: `npx prisma migrate dev`
2. ✅ Test with a real call
3. ✅ I can build the dashboard UI to display all call data

---

## Production

When deploying to production, replace ngrok URL with your actual domain:
```
https://yourdomain.com/api/webhooks/vapi
```

