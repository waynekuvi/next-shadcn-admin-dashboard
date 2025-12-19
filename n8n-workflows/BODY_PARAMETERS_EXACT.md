# Exact Body Parameters Configuration

## For HTTP Request Node - Status Callback

### Method 1: Using Fields Below (What you see in the image)

Click **"Add Parameter"** 4 times, then fill in exactly:

#### Parameter 1:
```
Name:  executionId
Value: ={{ $('Code').item.json.executionId }}
```

#### Parameter 2:
```
Name:  messageId
Value: ={{ $json.messageId }}
```

#### Parameter 3:
```
Name:  status
Value: sent
```

#### Parameter 4:
```
Name:  timestamp
Value: ={{ $now.toISO() }}
```

---

### Method 2: Using JSON (Easier - Recommended)

1. Change **"Specify Body"** dropdown to: **"JSON"**
2. Paste this in the JSON field:

```json
{
  "executionId": "={{ $('Code').item.json.executionId }}",
  "messageId": "={{ $json.messageId }}",
  "status": "sent",
  "timestamp": "={{ $now.toISO() }}"
}
```

---

## Important Notes

### Node Name Reference
- If your Code/Function node is named **"Code"**: Use `$('Code')`
- If it's named **"Replace Variables"**: Use `$('Replace Variables')`
- If it's named something else: Use that exact name

### How to Find Your Node Name
1. Look at the node before HTTP Request
2. The name is shown at the top of that node
3. Use that exact name in the expression

### Testing
After adding parameters:
1. Click **"Execute step"** (orange button)
2. Check OUTPUT panel
3. Should see response: `{"success": true}`

---

## Common Issues

**Issue**: "executionId is undefined"
**Fix**: Check the node name - it must match exactly (case-sensitive)

**Issue**: "messageId is undefined"  
**Fix**: Vonage might use different field. Check Vonage node output, might be `message-id` or `message_id`

**Issue**: Connection refused
**Fix**: 
- Make sure your app is running on localhost:3000
- Or use ngrok: `ngrok http 3000` then use ngrok URL





