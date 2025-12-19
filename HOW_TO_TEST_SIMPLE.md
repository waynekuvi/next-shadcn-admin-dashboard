# How to Test the Widget - Simple Guide

## 🎯 The Goal
Make sure your widget works correctly before putting it on real client websites.

---

## 📝 Step 1: Open the Test Page

1. Make sure your dashboard is running: `npm run dev` (should be on `http://localhost:3000`)
2. Open your browser
3. Go to: `http://localhost:3000/test-chatbot.html`
4. You should see the test page with a "Chatbot Widget Test Page" title

---

## ✅ Step 2: Check if Widget Appears

**What to look for:**
- Do you see a chatbot widget somewhere on the page?
- It might be a floating button or a chat window
- It should have colors (probably blue/purple gradient)

**If you see it:** ✅ Good! Widget is loading
**If you don't see it:** Check browser console for errors (press F12)

---

## 🔍 Step 3: Check the Logs

On the test page, look at the black log box at the bottom.

**What you should see:**
- `✅ Widget script loaded`
- `✅ UplinqChatWidget found on window object`
- `✅ Widget mount called successfully`
- `✅ API Response:` followed by colors/data

**If you see all these:** ✅ Everything is working!
**If you see errors (red text):** Something needs fixing

---

## 🧪 Step 4: Test the API Button

1. Click the blue button that says **"Test Customization API"**
2. Look at the log box
3. You should see:
   - `Testing Customization API...`
   - `✅ API Response:`
   - A bunch of JSON with colors and data

**If you see this:** ✅ API is working perfectly!

---

## 🎨 Step 5: Change Colors and Test

1. **Go to your dashboard:** `http://localhost:3000/dashboard/chatbot`
2. **Change the colors:**
   - Look at the right side
   - Try a different color preset (like "Sunset Bloom" or "Aurora Mint")
   - Or click "Custom colors" and change a color manually
3. **Click "Publish" button**
4. **Go back to test page:** `http://localhost:3000/test-chatbot.html`
5. **Refresh the page** (press F5 or Cmd+R)
6. **Check if colors changed**

**If colors changed:** ✅ Dynamic updates working!
**If colors didn't change:** Widget might be using cached data (wait 1 minute and try again)

---

## 🔧 Step 6: Test What Happens If API Breaks

This tests if the widget still works when something goes wrong.

### Option A: Use Wrong Organization ID
1. Open browser console (press F12)
2. Paste this code:
```javascript
window.UplinqChatWidget.mount('#test-broken', {
  organizationId: 'this-is-wrong-id-12345',
  apiBaseUrl: 'http://localhost:3000',
  webhookUrl: 'https://uplinq.app.n8n.cloud/webhook/chatbot-enterprise'
});
```
3. Check if widget still appears (should use default colors)

**If widget appears with default colors:** ✅ Error handling works!
**If widget breaks or shows error:** Needs fixing

### Option B: Turn Off Your Server
1. Stop your dashboard server (Ctrl+C in terminal)
2. Refresh test page
3. Widget should still appear (with default colors)

**If widget appears:** ✅ Good fallback!
**If widget breaks:** Needs fixing

---

## 📊 Step 7: Check Browser Developer Tools

This is like a doctor's checkup for your website.

1. **Open Developer Tools:** Press F12 (or right-click → Inspect)
2. **Click "Console" tab**
3. **Look for errors** (red text)

**What's OK:**
- Warnings (yellow text) - these are fine
- Blue info messages - these are fine

**What's NOT OK:**
- Red error messages - these need fixing
- "Failed to fetch" - might be CORS or API issue

4. **Click "Network" tab**
5. **Refresh the page**
6. **Look for:** `customization/cmixfcoka0001sbdt935dus65`
7. **Click on it**
8. **Check "Response" tab** - should show colors/data

**If you see the API call and response:** ✅ Everything connected correctly!

---

## ✅ Step 8: Final Checklist

Before you deploy, make sure:

- [ ] Widget appears on test page
- [ ] No red errors in console
- [ ] API test button works
- [ ] Colors change when you publish new ones
- [ ] Widget works even if API fails (uses defaults)
- [ ] Widget works even with wrong organization ID

**If all checked:** ✅ Ready to deploy!
**If any unchecked:** Fix those issues first

---

## 🚀 Step 9: Test with Real Embed Code

1. **Go to admin portal:** `/admin/create-client` or edit existing client
2. **Generate embed code** (click "Generate Embed Code" button)
3. **Copy the embed code**
4. **Create a new HTML file:**
   ```html
   <!DOCTYPE html>
   <html>
   <head><title>Test</title></head>
   <body>
       <h1>My Test Site</h1>
       <!-- PASTE EMBED CODE HERE -->
   </body>
   </html>
   ```
5. **Open that HTML file in browser**
6. **Check if widget appears and has correct colors**

**If it works:** ✅ Ready for real clients!

---

## 🆘 Common Problems & Solutions

### Problem: Widget doesn't appear
**Fix:** Check console for errors. Make sure dashboard server is running.

### Problem: Colors don't change after publish
**Fix:** Wait 1 minute (API caches for 60 seconds). Or clear browser cache.

### Problem: Red errors in console
**Fix:** Check if API endpoint is correct. Make sure server is running.

### Problem: "Failed to fetch" error
**Fix:** Check CORS headers are set. Make sure API URL is correct.

---

## 💡 Quick Test (2 Minutes)

If you're in a hurry:

1. Open `http://localhost:3000/test-chatbot.html`
2. Click "Test Customization API" button
3. Check if you see ✅ green checkmarks in logs
4. Check if widget appears on page

**All green?** ✅ Good to go!
**Any red?** Fix those issues first.

---

## 🎉 Success Looks Like This

When everything works:
- ✅ Test page shows widget
- ✅ Logs show green checkmarks
- ✅ API button returns data
- ✅ Colors change when you publish
- ✅ Widget works even if API fails
- ✅ No red errors in console

**That's it!** Simple enough? 😊

