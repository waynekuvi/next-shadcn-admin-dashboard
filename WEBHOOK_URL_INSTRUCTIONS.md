# ✅ Ngrok Authtoken Configured!

## Next Steps to Get Your Webhook URL

### Step 1: Start ngrok (in a NEW terminal window)

**Important:** Open a completely new terminal window (keep your dev server running in the other one)

Run:
```bash
ngrok http 3000
```

You'll see output like:
```
Session Status                online
Account                       Your Account
Forwarding                    https://abc123def456.ngrok.io -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

### Step 2: Copy the HTTPS URL

Look for the line that says `Forwarding` and copy the **HTTPS URL** (starts with `https://`)

Example: `https://abc123def456.ngrok.io`

### Step 3: Create Your Webhook URL

Add `/api/webhooks/vapi` to the end:

**Your Vapi Webhook URL:**
```
https://abc123def456.ngrok.io/api/webhooks/vapi
```

### Step 4: Configure in Vapi Dashboard

1. Go to: **https://dashboard.vapi.ai/settings/organization**
2. Scroll to **"Server URL"** section
3. Paste: `https://your-ngrok-url.ngrok.io/api/webhooks/vapi`
4. Set **Timeout**: `20` seconds
5. Click **"Save"**

---

## Alternative: Use ngrok Web Interface

While ngrok is running, you can also:
1. Open: **http://localhost:4040** in your browser
2. See the ngrok dashboard with your URL
3. Copy the HTTPS URL
4. Add `/api/webhooks/vapi` to it

---

## Testing

After configuring:
1. Make a test call through Vapi
2. Check your server console - you should see: `"Vapi webhook received: ..."`
3. Check your database - calls will be stored automatically

---

## Keep ngrok Running

**Important:** Keep the ngrok terminal window open while testing. If you close it, the webhook URL will stop working.

For production, you'll use your actual domain instead of ngrok.

---

Once you have the webhook URL configured, let me know and I can help test it or build the dashboard UI! 🚀

