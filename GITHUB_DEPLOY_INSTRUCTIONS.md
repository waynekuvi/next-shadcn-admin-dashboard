# Deploy to GitHub - Manual Instructions

## Step 1: Initialize Git Repository (if not already done)

```bash
git init
```

## Step 2: Add All Files

```bash
git add .
```

## Step 3: Commit Changes

```bash
git commit -m "Deploy: Restore chatbot customization features and fix TypeScript errors

- Restored full chatbot customization UI (gradient, logo, avatars)
- Fixed DataTablePagination props in CRM table
- Fixed checkbox checked prop type errors in multiple columns
- Added missing Lead, Reminder, PracticeSettings type exports
- Ready for production deployment"
```

## Step 4: Add GitHub Remote

**If you already have a GitHub repository:**

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

Or using SSH:
```bash
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
```

**If you need to create a new GitHub repository:**
1. Go to https://github.com/new
2. Create a new repository (don't initialize with README, .gitignore, or license)
3. Copy the repository URL
4. Run the `git remote add origin` command above with your URL

## Step 5: Push to GitHub

```bash
git branch -M main
git push -u origin main
```

## Step 6: Connect Vercel to GitHub (Optional but Recommended)

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will automatically deploy on every push to main branch

## Troubleshooting

### Xcode License Error
If you see "You have not agreed to the Xcode license agreements", run:
```bash
sudo xcodebuild -license
```
Accept the license, then try the git commands again.

### Remote Already Exists
If you get "remote origin already exists", you can either:
- Update it: `git remote set-url origin YOUR_NEW_URL`
- Or remove and re-add: `git remote remove origin` then `git remote add origin YOUR_URL`

