# 🚀 Vercel Deployment Guide

This guide will help you deploy your Next.js admin dashboard to Vercel.

## Prerequisites

1. A Vercel account ([sign up here](https://vercel.com/signup))
2. A PostgreSQL database (recommended: [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres), [Supabase](https://supabase.com), or [Neon](https://neon.tech))
3. Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Your Repository

Make sure your code is pushed to a Git repository:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your Git repository
4. Vercel will auto-detect Next.js settings
5. Configure environment variables (see Step 3)
6. Click **"Deploy"**

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts to link your project

## Step 3: Configure Environment Variables

In your Vercel project settings, add the following environment variables:

### Required Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://your-app.vercel.app"

# Optional: Public URL (for chatbot widget, etc.)
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
```

### Optional Environment Variables

```bash
# Vapi Voice AI (if using voice features)
VAPI_API_KEY="your_vapi_api_key"

# Chatbot Widget URL (if using chatbot)
NEXT_PUBLIC_WIDGET_URL="https://your-app.vercel.app"

# Google Sheets (if using Google Sheets integration)
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### How to Add Environment Variables in Vercel

1. Go to your project dashboard on Vercel
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: The variable name (e.g., `DATABASE_URL`)
   - **Value**: The variable value
   - **Environment**: Select `Production`, `Preview`, and/or `Development`
4. Click **Save**

### Generate NEXTAUTH_SECRET

Generate a secure secret for NextAuth:

```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

## Step 4: Set Up Database

### Option A: Vercel Postgres (Recommended)

1. In your Vercel project, go to **Storage** → **Create Database**
2. Select **Postgres**
3. Choose a region close to your users
4. Create the database
5. Copy the connection string and add it as `DATABASE_URL` environment variable
6. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Option B: External Database (Supabase, Neon, etc.)

1. Create your PostgreSQL database
2. Get the connection string
3. Add it as `DATABASE_URL` in Vercel environment variables
4. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Run Database Migrations

After setting up your database, run migrations:

**Option 1: Via Vercel CLI**
```bash
vercel env pull .env.local
npx prisma migrate deploy
```

**Option 2: Via Vercel Build Command**
Add to your `package.json`:
```json
{
  "scripts": {
    "vercel-build": "prisma migrate deploy && prisma generate && next build"
  }
}
```

**Option 3: Manual Migration**
Connect to your production database and run:
```bash
DATABASE_URL="your-production-database-url" npx prisma migrate deploy
```

## Step 5: Configure Build Settings

Vercel should auto-detect Next.js, but verify these settings:

- **Framework Preset**: Next.js
- **Build Command**: `prisma generate && next build` (already configured in `package.json`)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)
- **Node.js Version**: 18.x or higher

These are already configured in `vercel.json`, so Vercel should pick them up automatically.

## Step 6: Update Webhook URLs

If you're using webhooks (Vapi, n8n, etc.), update them to point to your Vercel URL:

### Vapi Webhook
Update in Vapi Dashboard:
```
https://your-app.vercel.app/api/webhooks/vapi
```

### n8n Webhooks
Update your n8n workflow webhook URLs to:
```
https://your-app.vercel.app/api/...
```

## Step 7: Deploy and Verify

1. After deployment, visit your app URL: `https://your-app.vercel.app`
2. Test the login flow
3. Verify database connections work
4. Check Vercel logs for any errors

## Troubleshooting

### Build Fails with Prisma Error

**Error**: `Prisma Client has not been generated yet`

**Solution**: The `postinstall` script in `package.json` should handle this. If not, ensure `prisma generate` runs before `next build`.

### Database Connection Issues

**Error**: `Can't reach database server`

**Solutions**:
1. Verify `DATABASE_URL` is correct in Vercel environment variables
2. Check if your database allows connections from Vercel IPs
3. For Supabase, ensure you're using the connection pooler URL for serverless
4. For Vercel Postgres, the connection should work automatically

### NextAuth Errors

**Error**: `NEXTAUTH_SECRET is missing`

**Solution**: Add `NEXTAUTH_SECRET` environment variable in Vercel settings.

**Error**: `NEXTAUTH_URL is incorrect`

**Solution**: Set `NEXTAUTH_URL` to your Vercel deployment URL (e.g., `https://your-app.vercel.app`)

### Environment Variables Not Working

**Issue**: Variables not available at runtime

**Solutions**:
1. Ensure variables are added for the correct environment (Production/Preview/Development)
2. Redeploy after adding new variables
3. Variables prefixed with `NEXT_PUBLIC_` are available in the browser
4. Other variables are only available server-side

## Post-Deployment Checklist

- [ ] Database migrations run successfully
- [ ] Environment variables configured
- [ ] Login/authentication works
- [ ] Database connections work
- [ ] Webhook URLs updated (if applicable)
- [ ] Public URLs updated (chatbot widget, etc.)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Custom domain configured (optional)

## Custom Domain Setup

1. In Vercel project settings, go to **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (can take up to 48 hours)
5. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your custom domain

## Continuous Deployment

Vercel automatically deploys when you push to your main branch:
- **Production**: Deploys from `main` or `master` branch
- **Preview**: Deploys from other branches and pull requests

## Monitoring

- **Logs**: View in Vercel dashboard under **Deployments** → **View Function Logs**
- **Analytics**: Enable in Vercel dashboard for performance monitoring
- **Alerts**: Set up in Vercel dashboard for deployment failures

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

---

**🎉 Your app should now be live on Vercel!**

