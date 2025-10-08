# Vercel Deployment Guide

## 📦 Deployment Steps

### Prerequisites
- GitHub repository: ✅ Already pushed
- Vercel account: Sign up at https://vercel.com
- PostgreSQL database: Neon/Railway/Supabase (recommended)

### Method 1: Deploy via Vercel CLI (Current Method)

```bash
# 1. Login to Vercel
vercel login

# 2. Deploy (follow prompts)
vercel

# 3. Deploy to production
vercel --prod
```

### Method 2: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/new
   - Login with GitHub

2. **Import Repository**
   - Click "Add New Project"
   - Select: `AsifIqbal-debug/New-Doctor-s-Appointment-Solution`
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave as default)
   - Build Command: `prisma generate && next build`
   - Output Directory: `.next` (auto-detected)

4. **Add Environment Variables**
   Click "Environment Variables" and add:

   ```env
   # Database
   DATABASE_URL=your_postgresql_connection_string
   
   # NextAuth
   NEXTAUTH_SECRET=your_generated_secret_key
   NEXTAUTH_URL=https://your-app.vercel.app
   ```

5. **Click Deploy**
   - Vercel will build and deploy your app
   - Wait 2-5 minutes for completion

## 🔐 Environment Variables Setup

### 1. Database URL (PostgreSQL)

**Option A: Neon (Recommended - Free Tier)**
- Visit: https://neon.tech
- Create account and new project
- Copy connection string
- Add to Vercel: `DATABASE_URL`

**Option B: Railway**
- Visit: https://railway.app
- Create PostgreSQL database
- Copy connection string

**Option C: Supabase**
- Visit: https://supabase.com
- Create project
- Get connection string from Settings > Database

### 2. NextAuth Secret

Generate a secure secret:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using OpenSSL
openssl rand -base64 32
```

### 3. NextAuth URL

After first deployment, update this to your actual Vercel URL:
```
NEXTAUTH_URL=https://your-app-name.vercel.app
```

## 🗄️ Database Migration

After deployment, run migrations:

```bash
# Option 1: Via Vercel CLI
npx prisma migrate deploy --preview-feature

# Option 2: Via Prisma Data Platform
# - Visit: https://cloud.prisma.io
# - Connect your database
# - Run migrations from dashboard

# Option 3: Run manually
# - Connect to your database
# - Run the SQL from prisma/migrations folder
```

## 📝 Post-Deployment Checklist

### 1. Verify Deployment
- [ ] Visit your Vercel URL
- [ ] Check if site loads
- [ ] Test login page

### 2. Run Database Setup
```bash
# Connect to production database and run:
npx prisma migrate deploy
npx prisma db seed
```

### 3. Test Core Features
- [ ] Login with demo accounts
- [ ] Create appointment
- [ ] Upload image
- [ ] Create board card

### 4. Update Environment Variables
- [ ] Update `NEXTAUTH_URL` with actual Vercel URL
- [ ] Redeploy if needed

## 🔧 Common Issues & Solutions

### Issue 1: Build Fails - Prisma Error
**Solution**: Ensure `postinstall` script in package.json:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Issue 2: Database Connection Error
**Solution**: Check DATABASE_URL format:
```
postgresql://username:password@host:5432/database?sslmode=require
```

### Issue 3: NextAuth Error
**Solution**: Ensure NEXTAUTH_URL matches your domain:
```
NEXTAUTH_URL=https://your-app.vercel.app
```

### Issue 4: Images Not Uploading
**Solution**: Vercel doesn't support file uploads to filesystem. Options:
1. Use Vercel Blob Storage
2. Use Cloudinary
3. Use AWS S3
4. Use Uploadthing

## 📊 Monitoring & Analytics

### Enable Vercel Analytics
1. Go to your project settings
2. Enable "Analytics"
3. Enable "Speed Insights"

### Enable Vercel Logs
1. Go to "Deployments"
2. Click on latest deployment
3. View "Runtime Logs"

## 🚀 Continuous Deployment

Once connected to GitHub:
1. Every push to `main` branch = automatic deployment
2. Pull requests = preview deployments
3. View deployment status in GitHub

## 🔄 Redeployment

### Redeploy Latest
```bash
vercel --prod
```

### Rollback to Previous
1. Go to Vercel Dashboard
2. Click "Deployments"
3. Find previous working deployment
4. Click "..." → "Promote to Production"

## 📱 Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` to custom domain

## 🎯 Performance Optimization

### 1. Enable Edge Functions
Add to next.config.js:
```js
export const config = {
  runtime: 'edge',
}
```

### 2. Enable Image Optimization
Already configured with Next.js Image component

### 3. Enable Caching
Configure in vercel.json (already added)

## 📞 Support Resources

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Prisma Deployment: https://www.prisma.io/docs/guides/deployment
- Community: https://github.com/vercel/vercel/discussions

## 🎉 Success Indicators

Your deployment is successful when:
- ✅ Build completes without errors
- ✅ Site loads at Vercel URL
- ✅ Login page works
- ✅ Database connection established
- ✅ No runtime errors in logs

---

**Deployment Status**: 🚀 Ready to Deploy
**Last Updated**: October 9, 2025
