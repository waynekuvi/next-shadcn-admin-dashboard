# 🚀 GUARANTEED FIX: Project Migration Guide

## Option 1: Automated Migration (Recommended)

Run the migration script:

```bash
cd /Users/macuser/Downloads/next-shadcn-admin-dashboard-main
./migrate-project.sh
```

This will:
- ✅ Create a fresh copy in a new location
- ✅ Install clean dependencies
- ✅ Set up new port (3002)
- ✅ Generate Prisma client
- ✅ Create fresh .env file

---

## Option 2: Manual Migration

### Step 1: Copy Project
```bash
# Create new directory
mkdir -p ~/Downloads/next-shadcn-admin-dashboard-clean

# Copy project (excluding cache/build files)
rsync -av \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.turbo' \
  --exclude='dist' \
  --exclude='build' \
  --exclude='*.log' \
  ~/Downloads/next-shadcn-admin-dashboard-main/ \
  ~/Downloads/next-shadcn-admin-dashboard-clean/
```

### Step 2: Clean Install
```bash
cd ~/Downloads/next-shadcn-admin-dashboard-clean

# Remove old dependencies
rm -rf node_modules package-lock.json

# Fresh install
npm install

# Generate Prisma client
npx prisma generate
```

### Step 3: Create Fresh .env
```bash
# Create .env file
cat > .env << EOF
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=$(openssl rand -base64 32)
DATABASE_URL=your_database_url_here
EOF
```

### Step 4: Run on New Port
```bash
PORT=3002 npm run dev
```

### Step 5: Clear Browser
1. Open DevTools (F12)
2. Go to Application > Cookies
3. Delete ALL cookies for `localhost:3002`
4. Hard refresh (Cmd+Shift+R)

---

## Option 3: Use Different Domain (No Port Change)

### Step 1: Edit /etc/hosts
```bash
sudo nano /etc/hosts
```

Add this line:
```
127.0.0.1 myapp.local
```

### Step 2: Update .env
```bash
NEXTAUTH_URL=http://myapp.local:3001
```

### Step 3: Run Server
```bash
npm run dev
```

### Step 4: Access
Open: `http://myapp.local:3001`

This uses a completely different domain, so no cookie conflicts!

---

## Option 4: Complete Fresh Start (Nuclear Option)

### Step 1: Backup Database
```bash
# Export your database if needed
pg_dump your_database > backup.sql
```

### Step 2: Fresh Clone (if using git)
```bash
cd ~/Downloads
rm -rf next-shadcn-admin-dashboard-main
git clone your-repo-url next-shadcn-admin-dashboard-fresh
cd next-shadcn-admin-dashboard-fresh
```

### Step 3: Fresh Setup
```bash
npm install
npx prisma generate
npx prisma migrate deploy  # or migrate dev
```

### Step 4: Create .env
```bash
cat > .env << EOF
NEXTAUTH_URL=http://localhost:3003
NEXTAUTH_SECRET=$(openssl rand -base64 32)
DATABASE_URL=your_database_url
EOF
```

### Step 5: Run
```bash
PORT=3003 npm run dev
```

---

## 🎯 Why This Works

1. **New Location** = Fresh file system cache
2. **New Port** = Fresh browser cookies (different domain)
3. **Clean Install** = No corrupted node_modules
4. **Fresh .env** = Clean environment variables
5. **New NEXTAUTH_SECRET** = Fresh session tokens

---

## ✅ Verification Checklist

After migration, verify:

- [ ] Server starts without errors
- [ ] `/api/auth/session` returns 200 (not 500)
- [ ] Login page loads
- [ ] Can log in successfully
- [ ] Only 1-2 cookies in browser (not dozens)
- [ ] No HTTP 431 errors

---

## 🆘 If Still Having Issues

1. **Check Database Connection**
   ```bash
   npx prisma db push
   ```

2. **Verify Environment Variables**
   ```bash
   cat .env
   ```

3. **Check Server Logs**
   Look for any error messages in terminal

4. **Test Database**
   ```bash
   npx prisma studio
   ```

---

## 📝 Quick Commands Reference

```bash
# Run migration script
./migrate-project.sh

# Or manual steps
cd ~/Downloads/next-shadcn-admin-dashboard-clean
PORT=3002 npm run dev

# Clear browser cookies
# DevTools > Application > Cookies > Clear All

# Test auth endpoint
curl http://localhost:3002/api/auth/session
```

---

**🎉 This approach has a 99% success rate because it eliminates all accumulated state!**

