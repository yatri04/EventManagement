const nodemailer = require('nodemailer');

// Test email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'test@gmail.com',
        pass: process.env.EMAIL_PASS || 'test_password'
    }
});

async function testEmail() {
    console.log('🧪 Testing email configuration...');
    console.log('📧 EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
    console.log('🔑 EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('⚠️  Email configuration not set. Please set EMAIL_USER and EMAIL_PASS in your .env file');
        console.log('📋 To set up email:');
        console.log('   1. Create a .env file in the backend directory');
        console.log('   2. Add EMAIL_USER=your_email@gmail.com');
        console.log('   3. Add EMAIL_PASS=your_app_password');
        console.log('   4. See EMAIL_SETUP.md for detailed instructions');
        return;
    }

    try {
        const mailOptions = {
            from: `"Event Registration System" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to yourself for testing
            subject: '🧪 Test Email - Event Registration System',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">✅ Email Test Successful!</h2>
                    <p>This is a test email from the Event Registration System.</p>
                    <p>If you received this email, your email configuration is working correctly.</p>
                    <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Test email sent successfully!');
        console.log('📧 Check your inbox for the test email');
        
    } catch (error) {
        console.error('❌ Failed to send test email:', error.message);
        console.log('🔧 Common solutions:');
        console.log('   1. Check your Gmail App Password');
        console.log('   2. Ensure 2-Factor Authentication is enabled');
        console.log('   3. Verify EMAIL_USER and EMAIL_PASS in .env file');
    }
}

testEmail();
