# LauAI Custom Email Templates

## **Email Verification Template**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your LauAI Account</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: #ffffff;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #9ca3af;
            font-size: 16px;
        }
        .card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 40px;
            margin-bottom: 30px;
        }
        .title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 20px;
            text-align: center;
        }
        .message {
            font-size: 16px;
            line-height: 1.6;
            color: #d1d5db;
            margin-bottom: 30px;
            text-align: center;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
        }
        .footer {
            text-align: center;
            color: #9ca3af;
            font-size: 14px;
            margin-top: 40px;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .feature {
            text-align: center;
            padding: 20px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .feature-icon {
            font-size: 24px;
            margin-bottom: 10px;
        }
        .feature-title {
            font-weight: 600;
            margin-bottom: 5px;
        }
        .feature-desc {
            font-size: 12px;
            color: #9ca3af;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">LauAI</div>
            <div class="subtitle">Transform your team management</div>
        </div>
        
        <div class="card">
            <h1 class="title">Verify Your Email</h1>
            <p class="message">
                Welcome to LauAI! Please verify your email address to complete your account setup and start transforming your team management.
            </p>
            
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">
                    Verify Email Address
                </a>
            </div>
            
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">📊</div>
                    <div class="feature-title">Team Analytics</div>
                    <div class="feature-desc">Real-time insights</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">🎯</div>
                    <div class="feature-title">Smart Surveys</div>
                    <div class="feature-desc">Engage your team</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">🚀</div>
                    <div class="feature-title">Performance</div>
                    <div class="feature-desc">Boost productivity</div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>If you didn't create this account, you can safely ignore this email.</p>
            <p>© 2024 LauAI. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

## **Welcome Email Template**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to LauAI</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: #ffffff;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #9ca3af;
            font-size: 16px;
        }
        .card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 40px;
            margin-bottom: 30px;
        }
        .title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 20px;
            text-align: center;
        }
        .message {
            font-size: 16px;
            line-height: 1.6;
            color: #d1d5db;
            margin-bottom: 30px;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
        }
        .footer {
            text-align: center;
            color: #9ca3af;
            font-size: 14px;
            margin-top: 40px;
        }
        .steps {
            margin: 30px 0;
        }
        .step {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .step-number {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 20px;
            flex-shrink: 0;
        }
        .step-content h3 {
            margin: 0 0 5px 0;
            font-size: 16px;
        }
        .step-content p {
            margin: 0;
            color: #9ca3af;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">LauAI</div>
            <div class="subtitle">Transform your team management</div>
        </div>
        
        <div class="card">
            <h1 class="title">Welcome to LauAI! 🎉</h1>
            <p class="message">
                Hi {{ .FirstName }},<br><br>
                Welcome to LauAI! Your account has been successfully created and you're ready to start transforming your team management experience.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ .SiteURL }}/app/dashboard" class="button">
                    Get Started
                </a>
            </div>
            
            <div class="steps">
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h3>Create Your Team</h3>
                        <p>Set up your first team and invite members</p>
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h3>Send Surveys</h3>
                        <p>Create engaging surveys to gather insights</p>
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h3>Track Performance</h3>
                        <p>Monitor team signals and performance metrics</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>Need help? Contact us at support@lauai.com</p>
            <p>© 2024 LauAI. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

## **Magic Link Email Template**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In to LauAI</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: #ffffff;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #9ca3af;
            font-size: 16px;
        }
        .card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 40px;
            margin-bottom: 30px;
        }
        .title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 20px;
            text-align: center;
        }
        .message {
            font-size: 16px;
            line-height: 1.6;
            color: #d1d5db;
            margin-bottom: 30px;
            text-align: center;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
        }
        .footer {
            text-align: center;
            color: #9ca3af;
            font-size: 14px;
            margin-top: 40px;
        }
        .security-note {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 12px;
            padding: 20px;
            margin: 30px 0;
            text-align: center;
        }
        .security-note h3 {
            margin: 0 0 10px 0;
            color: #10b981;
            font-size: 16px;
        }
        .security-note p {
            margin: 0;
            font-size: 14px;
            color: #9ca3af;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">LauAI</div>
            <div class="subtitle">Transform your team management</div>
        </div>
        
        <div class="card">
            <h1 class="title">Sign In to LauAI</h1>
            <p class="message">
                Click the button below to securely sign in to your LauAI account. This link will expire in 24 hours.
            </p>
            
            <div style="text-align: center;">
                <a href="{{ .TokenHash }}" class="button">
                    Sign In to LauAI
                </a>
            </div>
            
            <div class="security-note">
                <h3>🔒 Secure Access</h3>
                <p>This link is unique to you and will only work once. If you didn't request this email, please ignore it.</p>
            </div>
        </div>
        
        <div class="footer">
            <p>If you didn't request this email, you can safely ignore it.</p>
            <p>© 2024 LauAI. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

## **How to Apply These Templates:**

### **1. In Supabase Dashboard:**
1. Go to: `Authentication` → `Settings` → `Email Templates`
2. Select each template type (Confirm signup, Magic link, etc.)
3. Replace the default HTML with the custom templates above
4. Save each template

### **2. Template Variables:**
- `{{ .ConfirmationURL }}` - Email verification link
- `{{ .TokenHash }}` - Magic link URL
- `{{ .SiteURL }}` - Your app URL
- `{{ .FirstName }}` - User's first name

### **3. Brand Colors Used:**
- **Primary**: `#10b981` (Emerald green)
- **Secondary**: `#059669` (Darker green)
- **Background**: Dark gradient
- **Text**: White and light gray
- **Glassmorphic**: Semi-transparent cards with blur

### **4. Features:**
- ✅ **Responsive design** - Works on all devices
- ✅ **Dark theme** - Matches your app's aesthetic
- ✅ **Glassmorphic effects** - Modern, premium look
- ✅ **Gradient buttons** - Eye-catching CTAs
- ✅ **Brand consistency** - LauAI logo and colors
- ✅ **Security messaging** - Professional and trustworthy

These templates will give your users a premium, branded experience that matches your LauAI aesthetic! 🚀 