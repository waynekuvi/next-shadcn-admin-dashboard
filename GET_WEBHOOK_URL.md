# 🚀 Get Your Vapi Webhook URL

## Quick Method (Recommended)

### Step 1: Start ngrok in a NEW Terminal Window

**Open a completely new terminal window** (don't use the one running your dev server) and run:

```bash
ngrok http 3000
```

You'll see output like this:
```
Session Status                online
Account                       Your Account
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123def456.ngrok.io -> http://localhost:3000
```

### Step 2: Copy the HTTPS URL

Look for the line that says `Forwarding` and copy the **HTTPS URL** (the one starting with `https://`)

Example: `https://abc123def456.ngrok.io`

### Step 3: Add the Endpoint Path

Add `/api/webhooks/vapi` to the end:

**Final Webhook URL:**
```
https://abc123def456.ngrok.io/api/webhooks/vapi
```

### Step 4: Configure in Vapi Dashboard

1. Go to: **https://dashboard.vapi.ai/settings/organization**
2. Scroll to **"Server URL"** section
3. Paste your webhook URL: `https://your-ngrok-url.ngrok.io/api/webhooks/vapi`
4. Set **Timeout**: `20` seconds
5. Click **"Save"**

---

## Alternative: Get URL from ngrok Web Interface

If ngrok is running, you can also:

1. Open: **http://localhost:4040** in your browser
2. You'll see the ngrok dashboard
3. Copy the HTTPS URL shown
4. Add `/api/webhooks/vapi` to it

---

## Troubleshooting

**If ngrok says "port 3000 is already in use":**
- Your dev server is running (that's good!)
- Make sure ngrok is pointing to port 3000: `ngrok http 3000`

**If you get "tunnel not found":**
- Wait a few seconds for ngrok to fully start
- Check the ngrok output for any errors

**To stop ngrok:**
- Press `Ctrl+C` in the terminal where ngrok is running
- Or run: `pkill ngrok`

---

## Once You Have the URL

After configuring in Vapi Dashboard:
1. Make a test call through Vapi
2. Check your server console - you should see webhook events
3. Check your database - calls will be stored automatically

Then I can build the dashboard UI! 🎉

