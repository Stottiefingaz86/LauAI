# Supabase Email Configuration Guide

## **Step 1: Configure Email Provider in Supabase**

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your LauAI project

2. **Navigate to Authentication Settings**
   - Go to: `Authentication` → `Settings` → `Email Templates`

3. **Configure Email Provider**
   - **Option A: Use Supabase's built-in email (limited)**
     - This works for testing but has low limits
   
   - **Option B: Use Resend (recommended)**
     - Go to: `Authentication` → `Settings` → `SMTP Settings`
     - Add your Resend API key
     - Configure SMTP settings

## **Step 2: Check Email Templates**

1. **Go to Email Templates**
   - `Authentication` → `Settings` → `Email Templates`

2. **Verify Templates Exist**
   - **Confirm Email** template should be present
   - **Magic Link** template should be present
   - **Change Email** template should be present

3. **Test Email Sending**
   - Go to: `Authentication` → `Users`
   - Find your test user
   - Click "Send email verification"

## **Step 3: Environment Variables**

Make sure these are set in your Supabase project:

```env
# In Supabase Dashboard → Settings → API
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# For email (if using Resend)
RESEND_API_KEY=your_resend_api_key
```

## **Step 4: Test Email Configuration**

1. **Create a test user**
2. **Check if email is sent**
3. **Check spam folder**
4. **Verify email template content**

## **Troubleshooting:**

### **If emails aren't sending:**
1. Check Supabase logs: `Logs` → `Auth`
2. Verify email provider configuration
3. Check if email templates are properly configured
4. Ensure domain is verified (if using custom domain)

### **If emails go to spam:**
1. Configure SPF/DKIM records
2. Use a reputable email provider (Resend, SendGrid)
3. Warm up your sending domain

### **Alternative: Manual Email Verification**

If email setup is complex, you can temporarily disable email verification:

1. Go to: `Authentication` → `Settings` → `Auth`
2. Disable "Enable email confirmations"
3. Users can sign in immediately after signup

**Note:** This is only for development/testing. Re-enable for production. 