# How to Test Your n8n Workflow

## Method 1: Using n8n's Built-in Test (Easiest)

### Step 1: Get Your Webhook URL
1. Open your workflow in n8n
2. Click on the **Webhook** node
3. Look for the **"Production URL"** or **"Test URL"** 
4. Copy the URL (it looks like: `https://your-n8n-instance.com/webhook/sms-reminder`)

### Step 2: Test in n8n
1. In the Webhook node, click **"Execute Node"** or **"Test URL"**
2. This will show you the webhook URL
3. Copy that URL

### Step 3: Send Test Request
You can use any of these methods:

---

## Method 2: Using Terminal (curl)

### Step 1: Open Terminal
Navigate to your project folder:
```bash
cd /Users/macuser/Downloads/next-shadcn-admin-dashboard-main
```

### Step 2: Send Test Request
Replace `YOUR_WEBHOOK_URL` with your actual n8n webhook URL:

```bash
curl -X POST YOUR_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "executionId": "test-exec-123",
    "phoneNumber": "+447911123456",
    "variables": {
      "name": "John Doe",
      "date": "2024-12-20",
      "time": "14:00",
      "service": "Dental Checkup",
      "phone": "+447911123456",
      "address": "123 Main St, London"
    },
    "messages": [
      {
        "sequence": 1,
        "delay": 0,
        "message": "Hi {{name}}, you have an appointment on {{date}} at {{time}} for {{service}}."
      },
      {
        "sequence": 2,
        "delay": 1,
        "message": "Reminder: Your {{service}} appointment is tomorrow at {{time}}. See you at {{address}}!"
      }
    ]
  }'
```

**Note**: I set `delay: 1` (1 hour) instead of 24 for faster testing. Change it back to 24 for production.

---

## Method 3: Using the Test Payload File

### Step 1: Use the Test File
```bash
curl -X POST YOUR_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d @n8n-workflows/TEST_PAYLOAD.json
```

---

## Method 4: Using Postman (Visual Tool)

### Step 1: Download Postman
- Download from: https://www.postman.com/downloads/

### Step 2: Create New Request
1. Click **"New"** → **"HTTP Request"**
2. Set method to **POST**
3. Paste your webhook URL in the URL field

### Step 3: Add Body
1. Click **"Body"** tab
2. Select **"raw"**
3. Select **"JSON"** from dropdown
4. Paste this:

```json
{
  "executionId": "test-exec-123",
  "phoneNumber": "+447911123456",
  "variables": {
    "name": "John Doe",
    "date": "2024-12-20",
    "time": "14:00",
    "service": "Dental Checkup",
    "phone": "+447911123456",
    "address": "123 Main St, London"
  },
  "messages": [
    {
      "sequence": 1,
      "delay": 0,
      "message": "Hi {{name}}, you have an appointment on {{date}} at {{time}} for {{service}}."
    },
    {
      "sequence": 2,
      "delay": 1,
      "message": "Reminder: Your {{service}} appointment is tomorrow at {{time}}. See you at {{address}}!"
    }
  ]
}
```

### Step 4: Send
Click **"Send"** button

---

## Method 5: Using Browser Extension (REST Client)

### Step 1: Install Extension
- Chrome: "REST Client" or "Talend API Tester"
- Firefox: "RESTClient"

### Step 2: Create Request
1. Method: **POST**
2. URL: Your webhook URL
3. Headers: `Content-Type: application/json`
4. Body: Paste the JSON payload above

---

## Quick Test Scripts

I've created test scripts you can use:

### Option A: Bash Script (Mac/Linux)
```bash
cd n8n-workflows
./test-workflow.sh YOUR_WEBHOOK_URL
```

### Option B: Node.js Script
```bash
node n8n-workflows/test-workflow.js YOUR_WEBHOOK_URL
```

---

## Step-by-Step: Easiest Method (Terminal)

### 1. Get Your Webhook URL from n8n
1. Open your workflow in n8n
2. Click the **Webhook** node
3. Copy the **"Production URL"** (looks like: `https://your-n8n.com/webhook/sms-reminder`)

### 2. Open Terminal
Press `Cmd + Space`, type "Terminal", press Enter

### 3. Navigate to Project
```bash
cd /Users/macuser/Downloads/next-shadcn-admin-dashboard-main
```

### 4. Run Test Script
```bash
./n8n-workflows/test-workflow.sh YOUR_WEBHOOK_URL_HERE
```

**Example:**
```bash
./n8n-workflows/test-workflow.sh https://my-n8n.com/webhook/sms-reminder
```

### 5. Check Results
- Go back to n8n
- Look at the workflow execution
- Each node should show green ✅ if successful
- Check the output of each node to see the data flow

---

## What to Look For

After sending the test:

1. **Webhook node** → Should show your payload
2. **Code in JavaScript** → Should show processed message with variables replaced
3. **Send an SMS** → Should show Vonage response (if credentials are set)
4. **HTTP Request** → Should show `{"success": true}` from your app
5. **Wait** → Will wait for the delay (1 hour in test, 24 hours in production)
6. **Code in JavaScript1** → Should process second message
7. **Send an SMS1** → Should send second SMS
8. **HTTP Request1** → Should callback status again

---

## Troubleshooting

### "Connection refused" or "Cannot connect"
- Make sure your n8n instance is running
- Check the webhook URL is correct
- If using localhost, make sure n8n is accessible

### "Workflow not active"
- Go to n8n workflow
- Toggle the **"Active"** switch ON (top right)

### No SMS sent
- Check Vonage credentials are configured in n8n
- Verify phone number format is correct (+447911123456)
- Check Vonage account has credits

### Status callback fails
- Make sure your Next.js app is running on `localhost:3000`
- Or update the URL in HTTP Request nodes to your production URL

