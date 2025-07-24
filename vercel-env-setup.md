# Vercel Environment Variables Setup

## **Step 1: Get Your Supabase Environment Variables**

### **From Supabase Dashboard:**
1. Go to: https://supabase.com/dashboard
2. Select your LauAI project
3. Go to: `Settings` → `API`
4. Copy these values:
   - **Project URL**: `https://ycmiaagfyszjqmfhsgqb.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljbWlhYWdmeXN6anFtZmhzZ3FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTU1MDcsImV4cCI6MjA2ODg3MTUwN30.vQyLQ07UGBf_25Xcy4qo3WEaw3voB_nWnCqhKcaldFQ`

## **Step 2: Set Environment Variables on Vercel**

### **Method A: Vercel Dashboard**
1. Go to: https://vercel.com/dashboard
2. Select your LauAI project
3. Go to: `Settings` → `Environment Variables`
4. Add these variables:

```
Name: REACT_APP_SUPABASE_URL
Value: https://ycmiaagfyszjqmfhsgqb.supabase.co
Environment: Production, Preview, Development

Name: REACT_APP_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljbWlhYWdmeXN6anFtZmhzZ3FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTU1MDcsImV4cCI6MjA2ODg3MTUwN30.vQyLQ07UGBf_25Xcy4qo3WEaw3voB_nWnCqhKcaldFQ
Environment: Production, Preview, Development

Name: REACT_APP_PRODUCTION_URL
Value: https://lau-46d8zbbem-chris-projects-e99bc8f6.vercel.app
Environment: Production, Preview, Development
```

### **Method B: Vercel CLI**
```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add REACT_APP_SUPABASE_URL
vercel env add REACT_APP_SUPABASE_ANON_KEY
vercel env add REACT_APP_PRODUCTION_URL

# Deploy with new environment variables
vercel --prod
```

## **Step 3: Verify Environment Variables**

### **Check in Browser Console:**
1. Open your deployed app
2. Open browser console (F12)
3. Look for these logs:
   ```
   Supabase URL: Set
   Supabase Key: Set
   ```

### **Check in Vercel Dashboard:**
1. Go to your project settings
2. Check `Environment Variables` section
3. Verify all variables are set for all environments

## **Step 4: Redeploy After Setting Variables**

```bash
# Redeploy to apply environment variables
vercel --prod
```

## **Troubleshooting:**

### **If variables aren't working:**
1. **Check naming**: Must start with `REACT_APP_`
2. **Check environments**: Set for Production, Preview, Development
3. **Redeploy**: Variables only apply to new deployments
4. **Check console**: Look for environment variable logs

### **Common Issues:**
- **Variables not showing**: Redeploy after adding them
- **Wrong values**: Double-check from Supabase dashboard
- **Build errors**: Check variable names and values

## **Environment Variables Summary:**

| Variable | Value | Purpose |
|----------|-------|---------|
| `REACT_APP_SUPABASE_URL` | `https://ycmiaagfyszjqmfhsgqb.supabase.co` | Supabase project URL |
| `REACT_APP_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase anonymous key |
| `REACT_APP_PRODUCTION_URL` | `https://lau-46d8zbbem-chris-projects-e99bc8f6.vercel.app` | Your app URL |

## **Next Steps:**
1. Set environment variables in Vercel dashboard
2. Redeploy the application
3. Test the signup/login flow
4. Check browser console for environment variable logs 