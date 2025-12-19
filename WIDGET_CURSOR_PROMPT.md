# Quick Prompt for Widget Cursor Workspace

Copy and paste this into your widget workspace Cursor:

---

**Task: Update Uplinq Chat Widget to fetch customization dynamically from API**

I need to update the widget to fetch customization (colors, logo, avatars) from an API endpoint instead of using hardcoded values.

**Current Embed Code Format:**
```javascript
window.UplinqChatWidget.mount('#uplinq-chat-root', {
  organizationId: 'cmixfcoka0001sbdt935dus65',
  webhookUrl: 'https://uplinq.app.n8n.cloud/webhook/chatbot-enterprise',
  apiBaseUrl: 'http://localhost:3000',
  initialOpen: true,
  hideButton: true
});
```

**API Endpoint:**
```
GET {apiBaseUrl}/api/chatbot/customization/{organizationId}
```

**Response:**
```json
{
  "gradient": {
    "color1": "#1e5eff",
    "color2": "#5860f4",
    "color3": "#7c3aed",
    "color4": "#dcd6ff"
  },
  "avatars": [],
  "logo": "https://example.com/logo.png",
  "webhookUrl": "https://uplinq.app.n8n.cloud/webhook/chatbot-enterprise"
}
```

**Requirements:**
1. Update `mount()` to accept `organizationId` and `apiBaseUrl` from config
2. Fetch customization from API: `${apiBaseUrl}/api/chatbot/customization/${organizationId}`
3. Apply gradient to widget scroll area: `linear-gradient(180deg, color1, color2, color3 32%, color4 55%, #fff 72%, ...)`
4. Apply logo to header (find by `.logo` or `[data-logo]`)
5. Apply avatars to header (find by `.avatar` or `[data-avatar]`)
6. Fall back to defaults if API fails (don't break widget)
7. Use defaults: `#1e5eff, #5860f4, #7c3aed, #dcd6ff`

**Key Points:**
- Widget must work even if API is unavailable (graceful fallback)
- Customization should apply after widget mounts
- API has CORS enabled, no auth required
- API response cached for 60 seconds

**Test:**
Use organizationId: `cmixfcoka0001sbdt935dus65`
API Base URL: `http://localhost:3000` (or production URL)

See `WIDGET_IMPLEMENTATION_PROMPT.md` for full details and code examples.

---





