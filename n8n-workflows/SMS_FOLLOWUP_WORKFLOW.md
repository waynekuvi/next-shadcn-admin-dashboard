# n8n Workflow: SMS Follow-up Campaign

## Step-by-Step Setup

### Step 1: Create New Workflow
1. Open n8n dashboard
2. Click **"Add workflow"**
3. Name it: **"SMS Follow-up Campaign"**

### Step 2: Add Webhook Trigger
1. Click **"+"** to add node
2. Search for **"Webhook"**
3. Select **"Webhook"** node
4. Configure:
   - **HTTP Method**: `POST`
   - **Path**: `sms-followup` (or any name you want)
   - **Response Mode**: "Respond When Last Node Finishes"
   - **Response Code**: `200`
5. Click **"Execute Node"** to activate
6. **Copy the webhook URL** - you'll need this!

### Step 3: Add Wait Node (24 Hour Delay)
1. Add **"Wait"** node
2. Connect it after Webhook
3. Configure:
   - **Amount**: `24`
   - **Unit**: `Hours`
   - Or use: `={{ $json.delayAfterTrigger || 24 }}` if delay is in payload

### Step 4: Add Function Node (Replace Variables)
1. Add **"Code"** node
2. Connect it after Wait
3. Paste this code:

```javascript
// Get the webhook data
const webhookData = $input.all()[0].json;

// Extract variables
const variables = webhookData.variables || {};
const messages = webhookData.messages || [];

// Process first message
const firstMessage = messages.find(m => m.sequence === 1);
if (!firstMessage) {
  return [];
}

// Replace variables in message
let messageText = firstMessage.message;
messageText = messageText.replace(/\{\{name\}\}/g, variables.name || '');
messageText = messageText.replace(/\{\{date\}\}/g, variables.date || '');
messageText = messageText.replace(/\{\{time\}\}/g, variables.time || '');
messageText = messageText.replace(/\{\{service\}\}/g, variables.service || 'appointment');
messageText = messageText.replace(/\{\{phone\}\}/g, variables.phone || '');
messageText = messageText.replace(/\{\{address\}\}/g, variables.address || '');

return [{
  json: {
    executionId: webhookData.executionId,
    phoneNumber: webhookData.phoneNumber,
    message: messageText,
    sequence: 1,
    totalMessages: messages.length,
    allMessages: messages,
    variables: variables
  }
}];
```

### Step 5: Add Vonage SMS Node
1. Add **"Vonage"** node
2. Connect it after Function node
3. Configure:
   - **Operation**: `Send SMS`
   - **From**: Your Vonage virtual number
   - **To**: `={{ $json.phoneNumber }}`
   - **Message**: `={{ $json.message }}`
4. **Authenticate** with your Vonage credentials

### Step 6: Add HTTP Request (Status Callback)
1. Add **"HTTP Request"** node
2. Connect it after Vonage SMS
3. Configure:
   - **Method**: `POST`
   - **URL**: `https://your-domain.com/api/webhooks/sms-status`
   - **Body**:
   ```json
   {
     "executionId": "={{ $('Replace Variables').item.json.executionId }}",
     "messageId": "={{ $json.messageId }}",
     "status": "sent",
     "timestamp": "={{ $now.toISO() }}"
   }
   ```

### Step 7: Handle Subsequent Messages (Optional)
1. Add **"Wait"** node for message 2 delay
2. Add **"Function"** node for message 2
3. Add **"Vonage SMS"** node for message 2
4. Repeat as needed

### Step 8: Save and Activate
1. Click **"Save"**
2. Toggle **"Active"** switch ON
3. **Copy the webhook URL** from Step 2

---

## Workflow JSON Export

Save this as `sms-followup-workflow.json` and import into n8n:

```json
{
  "name": "SMS Follow-up Campaign",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "sms-followup",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "webhook-trigger",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "webhookId": "sms-followup"
    },
    {
      "parameters": {
        "amount": 24,
        "unit": "hours"
      },
      "id": "wait-24h",
      "name": "Wait 24 Hours",
      "type": "n8n-nodes-base.wait",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "jsCode": "const webhookData = $input.all()[0].json;\nconst variables = webhookData.variables || {};\nconst messages = webhookData.messages || [];\nconst firstMessage = messages.find(m => m.sequence === 1);\nif (!firstMessage) return [];\n\nlet messageText = firstMessage.message;\nmessageText = messageText.replace(/\\{\\{name\\}\\}/g, variables.name || '');\nmessageText = messageText.replace(/\\{\\{date\\}\\}/g, variables.date || '');\nmessageText = messageText.replace(/\\{\\{time\\}\\}/g, variables.time || '');\nmessageText = messageText.replace(/\\{\\{service\\}\\}/g, variables.service || 'appointment');\nmessageText = messageText.replace(/\\{\\{phone\\}\\}/g, variables.phone || '');\nmessageText = messageText.replace(/\\{\\{address\\}\\}/g, variables.address || '');\n\nreturn [{\n  json: {\n    executionId: webhookData.executionId,\n    phoneNumber: webhookData.phoneNumber,\n    message: messageText,\n    sequence: 1,\n    allMessages: messages,\n    variables: variables\n  }\n}];"
      },
      "id": "function-replace-vars",
      "name": "Replace Variables",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [650, 300]
    },
    {
      "parameters": {
        "operation": "sendSMS",
        "from": "YOUR_VONAGE_NUMBER",
        "to": "={{ $json.phoneNumber }}",
        "text": "={{ $json.message }}"
      },
      "id": "vonage-sms",
      "name": "Send SMS",
      "type": "n8n-nodes-base.vonage",
      "typeVersion": 1,
      "position": [850, 300],
      "credentials": {
        "vonageApi": {
          "id": "YOUR_VONAGE_CREDENTIALS_ID",
          "name": "Vonage Account"
        }
      }
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://your-domain.com/api/webhooks/sms-status",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "executionId",
              "value": "={{ $('Replace Variables').item.json.executionId }}"
            },
            {
              "name": "messageId",
              "value": "={{ $json.messageId }}"
            },
            {
              "name": "status",
              "value": "sent"
            },
            {
              "name": "timestamp",
              "value": "={{ $now.toISO() }}"
            }
          ]
        }
      },
      "id": "status-callback",
      "name": "Status Callback",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [1050, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{"node": "Wait 24 Hours", "type": "main", "index": 0}]]
    },
    "Wait 24 Hours": {
      "main": [[{"node": "Replace Variables", "type": "main", "index": 0}]]
    },
    "Replace Variables": {
      "main": [[{"node": "Send SMS", "type": "main", "index": 0}]]
    },
    "Send SMS": {
      "main": [[{"node": "Status Callback", "type": "main", "index": 0}]]
    }
  }
}
```

---

## Quick Setup Checklist

- [ ] Create workflow in n8n
- [ ] Add Webhook trigger (POST)
- [ ] Add Wait node (24 hours)
- [ ] Add Function node to replace variables
- [ ] Add Vonage SMS node (configure credentials)
- [ ] Add HTTP Request for status callback
- [ ] Save and activate workflow
- [ ] Copy webhook URL
- [ ] Share URL with me to configure in app





