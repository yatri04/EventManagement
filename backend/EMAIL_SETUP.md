# 📧 Email Configuration Setup

This guide will help you set up email notifications for the Event Registration System.

## 🔧 Environment Variables Setup

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://aesha:aesha2006@cluster0.x3hcqaj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Server Configuration
PORT=5000

# Email Configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
```

## 📱 Gmail Setup Instructions

### Step 1: Enable 2-Factor Authentication
1. Go to your [Google Account](https://myaccount.google.com/)
2. Navigate to **Security**
3. Enable **2-Step Verification** if not already enabled

### Step 2: Generate App Password
1. In your Google Account Security settings
2. Go to **2-Step Verification** → **App passwords**
3. Select **Mail** as the app
4. Generate a new app password
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update Environment Variables
1. Replace `your_email@gmail.com` with your actual Gmail address
2. Replace `your_app_password_here` with the 16-character app password
3. Save the `.env` file

## 🧪 Testing Email Functionality

### Test Registration Email
1. Start the backend server: `npm start`
2. Register for an event through the frontend
3. Check the console logs for email status
4. Check your email inbox for the confirmation

### Console Logs to Look For
```
✅ Registration email sent successfully to student@example.com
📧 Event: Tech Talk 2024
📊 Status: registered
```

## 🎨 Email Templates

The system sends two types of emails:

### 1. Registration Confirmation
- **Subject:** `🎟️ Event Registration Confirmation - [Event Name]`
- **Content:** Event details, registration status, seat information
- **Status:** Confirmed or Waiting List

### 2. Registration Cancellation
- **Subject:** `❌ Event Registration Cancelled - [Event Name]`
- **Content:** Event details, cancellation confirmation
- **Action:** Option to re-register

## 🔍 Troubleshooting

### Email Not Sending
1. **Check Environment Variables:**
   ```bash
   echo $EMAIL_USER
   echo $EMAIL_PASS
   ```

2. **Check Console Logs:**
   - Look for `⚠️ Email configuration not set` warning
   - Check for `❌ Failed to send email` errors

3. **Verify Gmail Settings:**
   - Ensure 2FA is enabled
   - Use App Password (not regular password)
   - Check if "Less secure app access" is disabled

### Common Issues
- **"Invalid login"**: Use App Password, not regular password
- **"Username and Password not accepted"**: Check 2FA is enabled
- **"Email configuration not set"**: Check `.env` file exists and has correct variables

## 🚀 Production Setup

For production, consider using:
- **SendGrid** for better deliverability
- **Mailgun** for high-volume sending
- **AWS SES** for cost-effective sending

Update the transporter configuration in `backend/routes/registration.js` accordingly.

## 📞 Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify your Gmail account settings
3. Test with a simple email first
4. Contact support if problems persist

---

**Note:** The email functionality is designed to fail gracefully - if email sending fails, the registration will still succeed, but you'll see error logs in the console.
