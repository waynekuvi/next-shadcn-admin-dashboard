# 🚨 Disk Space Issue - Quick Fix Guide

## Your disk is full! Here's how to free up space:

### Option 1: Clean npm cache (Quick - Frees ~1-5GB)
```bash
npm cache clean --force
```

### Option 2: Remove old node_modules (Frees ~500MB-2GB per project)
```bash
# Remove node_modules from old projects
find ~/Downloads -name "node_modules" -type d -exec du -sh {} \; | sort -h
# Then delete the largest ones you don't need
```

### Option 3: Clean system cache (Frees ~5-20GB)
```bash
# macOS system cleanup
sudo rm -rf ~/Library/Caches/*
# Or use CleanMyMac / similar tool
```

### Option 4: Delete old Downloads (Frees variable space)
```bash
# Check what's taking space
du -sh ~/Downloads/* | sort -h | tail -10
# Delete old/unused files
```

### Option 5: Use existing project (No migration needed!)
Since disk is full, let's just fix the current project in place:

```bash
cd ~/Downloads/next-shadcn-admin-dashboard-main

# 1. Clean npm cache
npm cache clean --force

# 2. Remove and reinstall (if needed)
rm -rf node_modules .next
npm install

# 3. Update .env
echo "NEXTAUTH_URL=http://localhost:3002" >> .env

# 4. Run on new port
PORT=3002 npm run dev
```

## 🎯 Recommended: Fix Current Project (No Migration)

Since you're out of disk space, the best option is to fix the current project:

1. **Free up some space first:**
   ```bash
   npm cache clean --force
   ```

2. **Use a different port** (avoids cookie conflicts):
   ```bash
   cd ~/Downloads/next-shadcn-admin-dashboard-main
   PORT=3002 npm run dev
   ```

3. **Clear browser cookies** for `localhost:3002`

4. **Test** - should work!

This avoids needing to copy the entire project.

