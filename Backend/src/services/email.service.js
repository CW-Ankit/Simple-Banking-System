const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Admin" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegisterEmail(userEmail, Name) {
  const subject = "Welcome to Our Bank"
  // change the redirect to login after deployment
  const text = "Hello " + Name + ",\n\nWelcome to SecureBank! Your digital banking account has been successfully created.\n\nAccount Email: " + userEmail + "\nStatus: Active\n\nYou can now log in to your dashboard to manage your balance and view transactions.\n\nLog in here: http://localhost:5173/login\n\nFor your security:\n- Never share your password or OTP with anyone.\n- We will never ask for your credentials via email.\n\nRegards,\nThe SecureBank Tech Team";

  const html = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e4e8; border-radius: 10px; overflow: hidden;'><div style='background-color: #0052cc; padding: 20px; text-align: center;'><h1 style='color: #ffffff; margin: 0; font-size: 24px;'>Welcome to SecureBank</h1></div><div style='padding: 30px; color: #333333; line-height: 1.6;'><h2 style='color: #0052cc;'>Hello " + Name + ",</h2><p>Your registration for our <strong>Banking System</strong> was successful. We are excited to have you on board!</p><div style='background-color: #f4f7fa; padding: 20px; border-radius: 8px; margin: 20px 0;'><p style='margin: 0;'><strong>Registered Email:</strong> " + userEmail + "</p><p style='margin: 5px 0 0 0;'><strong>Account Status:</strong> <span style='color: #28a745; font-weight: bold;'>Active</span></p></div><p>To get started, click the button below to access your secure dashboard:</p><div style='text-align: center; margin: 30px 0;'><a href='http://localhost:5173/login' style='background-color: #0052cc; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;'>Login to Dashboard</a></div><p style='font-size: 13px; color: #666;'>Security Note: Never share your login credentials. If you did not create this account, please contact our support team immediately.</p></div><div style='background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #999;'>&copy; 2026 SecureBank | Secure Digital Banking Solutions</div></div>";

  await sendEmail(userEmail, subject,text,html)
}

async function sendTransactionEmail(userEmail, Name, type, amount, transactionId) {
  const subject = "Transaction Alert: " + type + " processed";
  
  const text = "Hello " + Name + ",\n\nYour account has been " + type + "ed for an amount of " + amount + ".\n\nTransaction Details:\n- Reference ID: " + transactionId + "\n- Status: Success\n- Date: " + new Date().toLocaleString() + "\n\nYou can view your updated balance on your dashboard.\n\nRegards,\nThe SecureBank Tech Team";

  const html = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e4e8; border-radius: 10px; overflow: hidden;'><div style='background-color: #0052cc; padding: 20px; text-align: center;'><h1 style='color: #ffffff; margin: 0; font-size: 24px;'>Transaction Alert</h1></div><div style='padding: 30px; color: #333333; line-height: 1.6;'><h2 style='color: #0052cc;'>Hello " + Name + ",</h2><p>This is to notify you of a recent " + type + " on your account.</p><div style='background-color: #f4f7fa; padding: 20px; border-radius: 8px; margin: 20px 0;'><p style='margin: 0;'><strong>Amount:</strong> " + amount + "</p><p style='margin: 5px 0;'><strong>Type:</strong> " + type + "</p><p style='margin: 5px 0 0 0;'><strong>Transaction ID:</strong> " + transactionId + "</p></div><p>If you did not authorize this transaction, please lock your account from the dashboard immediately.</p><div style='text-align: center; margin: 30px 0;'><a href='http://localhost:5173/dashboard' style='background-color: #0052cc; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;'>View Dashboard</a></div></div><div style='background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #999;'>&copy; 2026 SecureBank | Secure Digital Banking Solutions</div></div>";

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, Name, amount, reason) {
  const subject = "Urgent: Transaction Failed";
  
  const text = "Hello " + Name + ",\n\nYour transaction of " + amount + " could not be processed.\n\nReason: " + reason + "\n\nNo funds were deducted from your account. Please try again or contact support if the issue persists.\n\nRegards,\nThe SecureBank Tech Team";

  const html = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e4e8; border-radius: 10px; overflow: hidden;'><div style='background-color: #d93025; padding: 20px; text-align: center;'><h1 style='color: #ffffff; margin: 0; font-size: 24px;'>Transaction Failed</h1></div><div style='padding: 30px; color: #333333; line-height: 1.6;'><h2 style='color: #d93025;'>Hello " + Name + ",</h2><p>Your attempt to process a transaction has failed.</p><div style='background-color: #fce8e6; padding: 20px; border-radius: 8px; margin: 20px 0;'><p style='margin: 0;'><strong>Attempted Amount:</strong> " + amount + "</p><p style='margin: 5px 0 0 0;'><strong>Reason:</strong> " + reason + "</p></div><p>No money was removed from your account. You may try again or check your account balance to ensure sufficient funds are available.</p><div style='text-align: center; margin: 30px 0;'><a href='http://localhost:5173/support' style='background-color: #d93025; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;'>Contact Support</a></div></div><div style='background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #999;'>&copy; 2026 SecureBank | Secure Digital Banking Solutions</div></div>";

  await sendEmail(userEmail, subject, text, html);
}

module.exports = { sendRegisterEmail, sendTransactionEmail, sendTransactionFailureEmail };