# Vercel Deploy Hook Setup Guide

## Step 1: Create Deploy Hook in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your `uplinq-chat-widget` project
3. Click on **Settings** (gear icon in the top right)
4. Go to **Git** section in the left sidebar
5. Scroll down to **Deploy Hooks** section
6. Click **Create Hook**
7. Enter a name: `Chatbot Customization Deploy`
8. Select branch: `main` (or your production branch)
9. Click **Create Hook**
10. **Copy the generated URL** - it will look like:
    ```
    https://api.vercel.com/v1/integrations/deploy/...
    ```

## Step 2: Add to Environment Variables

### Option A: Local Development (.env.local)

1. Create or edit `.env.local` in the project root
2. Add the Deploy Hook URL:
   ```
   VERCEL_DEPLOY_HOOK_URL=https://api.vercel.com/v1/integrations/deploy/...
   ```
3. Restart your development server

### Option B: Vercel Production Environment

1. Go to your **main dashboard project** (not the widget project)
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   - **Key**: `VERCEL_DEPLOY_HOOK_URL`
   - **Value**: (paste the Deploy Hook URL)
   - **Environment**: Production, Preview, Development (select all)
4. Click **Save**

## Step 3: Test

1. Go to the Chatbot customization page
2. Make a change (e.g., change a gradient color)
3. Click **Publish**
4. Check the Vercel dashboard - you should see a new deployment triggered!

## Troubleshooting

- **Deployment not triggering?** Check that the Deploy Hook URL is correct in your environment variables
- **Still using API method?** The code will fall back to API if Deploy Hook is not configured
- **Need to update the hook?** Just update the environment variable and restart the server

