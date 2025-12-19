# 🔐 Ngrok Authentication Required

## Quick Setup (2 minutes)

### Step 1: Sign up for ngrok (free)

1. Go to: **https://dashboard.ngrok.com/signup**
2. Sign up with your email (free account is fine)
3. You'll be redirected to your dashboard

### Step 2: Get your authtoken

1. In ngrok dashboard, go to: **https://dashboard.ngrok.com/get-started/your-authtoken**
2. Copy your authtoken (it's a long string like: `2abc123def456ghi789jkl012mno345pqr678stu901vwx234yz`)

### Step 3: Configure ngrok

Run this command in your terminal (replace `YOUR_AUTHTOKEN` with your actual token):

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN
```

### Step 4: Start ngrok

Now you can start ngrok:

```bash
ngrok http 3000
```

You'll see output like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

### Step 5: Get your webhook URL

Copy the HTTPS URL and add `/api/webhooks/vapi`:

**Example:**
```
https://abc123.ngrok.io/api/webhooks/vapi
```

---

## Quick Command Reference

```bash
# 1. Add authtoken (one time only)
ngrok config add-authtoken YOUR_AUTHTOKEN

# 2. Start ngrok (every time you need it)
ngrok http 3000

# 3. Get URL from output or visit: http://localhost:4040
```

---

## After Setup

Once ngrok is authenticated and running:
1. Copy the HTTPS URL from ngrok output
2. Add `/api/webhooks/vapi` to it
3. Paste in Vapi Dashboard → Settings → Organization → Server URL
4. Save!

Then you're all set! 🎉

