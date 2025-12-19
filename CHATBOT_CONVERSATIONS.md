# Chatbot Conversations Feature

The chatbot page now has a fully functional inbox interface to view and manage chatbot conversations.

## Features Implemented

### 1. **Conversation List**
- Displays all chatbot conversations from your organization
- Real-time updates (refreshes every 10 seconds)
- Search functionality to filter conversations
- Filter options: All, Open, Unassigned, Mentions, Created by you

### 2. **Conversation View**
- Click on any conversation to view its messages
- Toggle between conversation view and chatbot preview
- Messages display with timestamps and sender information

### 3. **API Endpoints**

#### GET `/api/chatbot/conversations`
Fetches chatbot conversations for your organization.

**Query Parameters:**
- `organizationId` (optional): Filter by organization (for admins)
- `filter` (optional): Filter type - "all", "open", "unassigned", etc.

**Response:**
```json
{
  "conversations": [
    {
      "id": "channel_id",
      "customerName": "John Doe",
      "avatar": null,
      "lastMessage": "Hello, I need help...",
      "lastMessageTime": "2024-01-01T12:00:00Z",
      "unreadCount": 2,
      "metadata": "Order #12345",
      "messageCount": 10,
      "organizationId": "org_id",
      "organizationName": "My Organization"
    }
  ],
  "counts": {
    "inbox": 5,
    "mentions": 0,
    "created": 0,
    "all": 10,
    "unassigned": 8
  }
}
```

#### POST `/api/chatbot/webhook`
Webhook endpoint to receive chatbot conversations from your chatbot widget.

**Request Body:**
```json
{
  "organizationId": "org_id",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "message": "Hello, I need help with my order",
  "metadata": "Order #12345",
  "conversationId": "optional_conversation_id"
}
```

**Response:**
```json
{
  "success": true,
  "channelId": "channel_id",
  "message": "Conversation created/updated successfully"
}
```

### 4. **Database Schema**

Chatbot conversations use the existing `Channel` model with `type: "CHATBOT"`:
- Channel name format: `"{customerName} - {metadata}"` or `"{customerName} - Chatbot Conversation"`
- Messages are stored in the `Message` table linked to the channel

## How to Use

### Viewing Conversations
1. Navigate to the Chatbot page in your dashboard
2. Conversations will load automatically in the left sidebar
3. Click on any conversation to view its messages
4. Use the search box to find specific conversations
5. Use filter options in the sidebar to view different conversation sets

### Setting Up Webhook Integration

To automatically import conversations from your chatbot widget:

1. **Configure your chatbot webhook** to send POST requests to:
   ```
   https://your-domain.com/api/chatbot/webhook
   ```

2. **Webhook payload should include:**
   - `organizationId`: Your organization ID
   - `customerName`: Name of the customer
   - `message`: (optional) Initial message
   - `metadata`: (optional) Additional context (e.g., "Order #12345")

3. **Example webhook configuration:**
   ```javascript
   // In your chatbot widget configuration
   webhookUrl: 'https://your-domain.com/api/chatbot/webhook',
   webhookData: {
     organizationId: 'your-org-id',
     // Additional data will be sent automatically
   }
   ```

### Manual Conversation Import

You can also create conversations manually using the API:

```javascript
// POST to /api/chatbot/conversations
fetch('/api/chatbot/conversations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customerName: 'John Doe',
    organizationId: 'your-org-id',
    metadata: 'Order #12345'
  })
});
```

## Notes

- Conversations are stored as `Channel` records with `type: "CHATBOT"`
- Messages require a sender, so chatbot messages from webhooks currently update the channel's last message but don't create message records
- To fully support chatbot messages, you may want to:
  1. Create a system user for chatbot messages, or
  2. Modify the Message model to allow optional senderId

## Future Enhancements

- [ ] Create system user for chatbot messages
- [ ] Add ability to reply to conversations from the inbox
- [ ] Add conversation assignment functionality
- [ ] Add conversation tags/labels
- [ ] Add conversation export functionality
- [ ] Add conversation analytics
