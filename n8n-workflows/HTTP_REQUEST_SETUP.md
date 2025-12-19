# How to Configure HTTP Request Node (Status Callback)

## Step-by-Step Visual Guide

### Step 1: Add HTTP Request Node
1. Click the **"+"** button after your Vonage SMS node
2. Search for **"HTTP Request"**
3. Click to add it

---

### Step 2: Configure Basic Settings

In the **Parameters** tab:

1. **Method**: Select `POST` (should already be set)

2. **URL**: Enter your callback URL
   - **Local testing**: `http://localhost:3000/api/webhooks/sms-status`
   - **Production**: `https://yourdomain.com/api/webhooks/sms-status`
   - **With ngrok**: `https://your-ngrok-url.ngrok.io/api/webhooks/sms-status`

3. **Authentication**: Leave as `None` (unless your API requires auth)

4. **Send Body**: Toggle this **ON** (green) ✅

5. **Body Content Type**: Select `JSON`

6. **Specify Body**: Select `Using Fields Below`

---

### Step 3: Add Body Parameters

Click **"Add Parameter"** button 4 times to create 4 parameters:

#### Parameter 1: executionId
- **Name**: `executionId`
- **Value**: `={{ $('Replace Variables').item.json.executionId }}`
  - Or if your function node is named differently: `={{ $('Code').item.json.executionId }}`
  - This gets the executionId from the previous node

#### Parameter 2: messageId
- **Name**: `messageId`
- **Value**: `={{ $json.messageId }}`
  - This gets the messageId from the Vonage SMS response

#### Parameter 3: status
- **Name**: `status`
- **Value**: `sent`
  - Or use: `={{ $json.status || 'sent' }}` if Vonage returns status

#### Parameter 4: timestamp
- **Name**: `timestamp`
- **Value**: `={{ $now.toISO() }}`
  - This creates current timestamp in ISO format

---

### Step 4: Alternative Method (Using JSON Body)

Instead of "Using Fields Below", you can use **"JSON"** mode:

1. **Specify Body**: Select `JSON`

2. **JSON**: Paste this:
```json
{
  "executionId": "={{ $('Replace Variables').item.json.executionId }}",
  "messageId": "={{ $json.messageId }}",
  "status": "sent",
  "timestamp": "={{ $now.toISO() }}"
}
```

---

### Step 5: Test the Configuration

1. Click **"Execute step"** button (orange button, top right)
2. Check the **OUTPUT** panel on the right
3. You should see the response from your app
4. If successful, you'll see: `{"success": true}`

---

## Visual Reference

```
HTTP Request Node Configuration:
┌─────────────────────────────────────┐
│ Method: POST                        │
│ URL: http://localhost:3000/...     │
│                                     │
│ ☑ Send Body                         │
│ Body Content Type: JSON             │
│ Specify Body: Using Fields Below   │
│                                     │
│ Body Parameters:                    │
│ ┌─────────────────────────────────┐│
│ │ Name: executionId                ││
│ │ Value: ={{ $('Code').item... }}  ││
│ └─────────────────────────────────┘│
│ ┌─────────────────────────────────┐│
│ │ Name: messageId                  ││
│ │ Value: ={{ $json.messageId }}   ││
│ └─────────────────────────────────┘│
│ ┌─────────────────────────────────┐│
│ │ Name: status                     ││
│ │ Value: sent                      ││
│ └─────────────────────────────────┘│
│ ┌─────────────────────────────────┐│
│ │ Name: timestamp                  ││
│ │ Value: ={{ $now.toISO() }}      ││
│ └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

## Troubleshooting

### If you get "executionId is undefined":
- Check the node name before HTTP Request
- Use: `={{ $('Code').item.json.executionId }}` (if your Code node is named "Code")
- Or: `={{ $('Replace Variables').item.json.executionId }}` (if named "Replace Variables")

### If you get "messageId is undefined":
- Vonage might return it in a different field
- Try: `={{ $json['message-id'] }}` or `={{ $json.message_id }}`
- Check Vonage node output to see actual field name

### If callback fails:
- Make sure your app is running
- Check the URL is correct
- For localhost, make sure n8n can reach it (use ngrok if needed)
- Check browser console for errors

---

## Quick Copy-Paste Values

**For "Using Fields Below" mode:**

```
executionId = {{ $('Code').item.json.executionId }}
messageId = {{ $json.messageId }}
status = sent
timestamp = {{ $now.toISO() }}
```

**For JSON mode:**
```json
{
  "executionId": "={{ $('Code').item.json.executionId }}",
  "messageId": "={{ $json.messageId }}",
  "status": "sent",
  "timestamp": "={{ $now.toISO() }}"
}
```

---

## Next Steps

After configuring:
1. ✅ Click "Execute step" to test
2. ✅ Check OUTPUT panel for success
3. ✅ Save the workflow
4. ✅ Activate the workflow
5. ✅ Copy the webhook URL from the Webhook node





