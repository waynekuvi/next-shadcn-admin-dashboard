# Vapi Webhook Setup Guide

## Quick Setup

### 1. Start ngrok (in a separate terminal)

```bash
ngrok http 3000
```

This will give you a public URL like: `https://abc123.ngrok.io`

### 2. Get your ngrok URL

Once ngrok is running, you'll see:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

Copy the HTTPS URL (the one starting with `https://`)

### 3. Configure in Vapi Dashboard

1. Go to: https://dashboard.vapi.ai/settings/organization
2. Find "Server URL" section
3. Enter your ngrok URL + endpoint:
   ```
   https://your-ngrok-url.ngrok.io/api/webhooks/vapi
   ```
4. Set Timeout: `20` seconds
5. Click "Save"

### 4. Environment Variables

Add to your `.env.local` file:

```env
VAPI_API_KEY=your_private_api_key_here
```

### 5. Run Database Migration

```bash
npx prisma migrate dev
```

This will create the `VoiceCall` table in your database.

## Testing

1. Make a test call through Vapi
2. Check your server logs - you should see webhook events
3. Check the database - calls should be stored automatically

## Production

For production, replace ngrok URL with your actual domain:
```
https://yourdomain.com/api/webhooks/vapi
```

