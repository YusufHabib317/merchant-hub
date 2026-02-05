import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email sender configuration
const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const APP_NAME = 'MerchantHub';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email using Resend
 */
async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Resend error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { success: true, data };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Email sending error:', error);
    throw error;
  }
}

/**
 * Send verification email for new user registration
 */
export async function sendVerificationEmail(email: string, verificationUrl: string) {
  const subject = `Welcome to ${APP_NAME} - Verify Your Email`;

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
  </head>
  <body style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px;">${APP_NAME}</h1>
    </div>
    
    <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
      <h2 style="color: #333; margin-top: 0;">Welcome! Please Verify Your Email</h2>
      
      <p style="font-size: 16px; color: #555;">
        Thank you for signing up with ${APP_NAME}! We're excited to have you on board.
      </p>
      
      <p style="font-size: 16px; color: #555;">
        To complete your registration and start using your merchant dashboard, please verify your email address by clicking the button below:
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; 
                  padding: 14px 32px; 
                  text-decoration: none; 
                  border-radius: 6px; 
                  font-weight: bold; 
                  font-size: 16px;
                  display: inline-block;">
          Verify Email Address
        </a>
      </div>
      
      <p style="font-size: 14px; color: #777; margin-top: 30px;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p style="font-size: 14px; color: #667eea; word-break: break-all;">
        ${verificationUrl}
      </p>
      
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
      
      <p style="font-size: 13px; color: #999;">
        If you didn't create an account with ${APP_NAME}, you can safely ignore this email.
      </p>
    </div>
    
    <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
      <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
    </div>
  </body>
</html>
  `;

  return sendEmail({ to: email, subject, html });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const subject = `Reset Your ${APP_NAME} Password`;

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
  </head>
  <body style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px;">${APP_NAME}</h1>
    </div>
    
    <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
      <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
      
      <p style="font-size: 16px; color: #555;">
        We received a request to reset your password for your ${APP_NAME} account.
      </p>
      
      <p style="font-size: 16px; color: #555;">
        Click the button below to reset your password. This link will expire in 1 hour for security reasons.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; 
                  padding: 14px 32px; 
                  text-decoration: none; 
                  border-radius: 6px; 
                  font-weight: bold; 
                  font-size: 16px;
                  display: inline-block;">
          Reset Password
        </a>
      </div>
      
      <p style="font-size: 14px; color: #777; margin-top: 30px;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p style="font-size: 14px; color: #667eea; word-break: break-all;">
        ${resetUrl}
      </p>
      
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
      
      <p style="font-size: 13px; color: #999;">
        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>
      
      <p style="font-size: 13px; color: #999;">
        For security, this link will expire in 1 hour.
      </p>
    </div>
    
    <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
      <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
    </div>
  </body>
</html>
  `;

  return sendEmail({ to: email, subject, html });
}

/**
 * Send welcome email after successful verification
 */
export async function sendWelcomeEmail(email: string, name?: string) {
  const subject = `Welcome to ${APP_NAME}! Get Started with Your Store`;

  const displayName = name || 'there';
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9000'}/dashboard`;

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ${APP_NAME}</title>
  </head>
  <body style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px;">${APP_NAME}</h1>
    </div>
    
    <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
      <h2 style="color: #333; margin-top: 0;">Welcome to ${APP_NAME}, ${displayName}! 🎉</h2>
      
      <p style="font-size: 16px; color: #555;">
        Your email has been verified and your account is now active! You're all set to start building your online store.
      </p>
      
      <h3 style="color: #333; margin-top: 30px;">Quick Start Guide:</h3>
      <ul style="font-size: 15px; color: #555; line-height: 1.8;">
        <li>Complete your store profile and customize your storefront</li>
        <li>Add your first products with images and descriptions</li>
        <li>Generate and download your unique QR code</li>
        <li>Share your store link with customers</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${dashboardUrl}" 
           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; 
                  padding: 14px 32px; 
                  text-decoration: none; 
                  border-radius: 6px; 
                  font-weight: bold; 
                  font-size: 16px;
                  display: inline-block;">
          Go to Dashboard
        </a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
      
      <p style="font-size: 13px; color: #999;">
        Need help? Check out our documentation or contact our support team.
      </p>
    </div>
    
    <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
      <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
    </div>
  </body>
</html>
  `;

  return sendEmail({ to: email, subject, html });
}

/**
 * Send OTP verification email
 */
export async function sendOTPEmail(email: string, otp: string, type: 'sign-in' | 'email-verification' | 'forget-password') {
  let subject: string;
  let title: string;
  let message: string;

  switch (type) {
    case 'sign-in':
      subject = `Your ${APP_NAME} Sign-In Code`;
      title = 'Sign-In Verification';
      message = 'Use the code below to sign in to your account:';
      break;
    case 'email-verification':
      subject = `Verify Your ${APP_NAME} Email`;
      title = 'Verify Your Email';
      message = 'Use the code below to verify your email address:';
      break;
    case 'forget-password':
      subject = `Reset Your ${APP_NAME} Password`;
      title = 'Password Reset Code';
      message = 'Use the code below to reset your password:';
      break;
    default:
      subject = `Your ${APP_NAME} Verification Code`;
      title = 'Verification Code';
      message = 'Use the code below to complete your request:';
  }

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
  </head>
  <body style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px;">${APP_NAME}</h1>
    </div>

    <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
      <h2 style="color: #333; margin-top: 0;">${title}</h2>

      <p style="font-size: 16px; color: #555;">
        ${message}
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <div style="background: #f5f5f5;
                    padding: 20px 40px;
                    border-radius: 8px;
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    color: #667eea;
                    display: inline-block;">
          ${otp}
        </div>
      </div>

      <p style="font-size: 14px; color: #777; margin-top: 30px;">
        This code will expire in 10 minutes for security reasons.
      </p>

      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

      <p style="font-size: 13px; color: #999;">
        If you didn't request this code, you can safely ignore this email.
      </p>
    </div>

    <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
      <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
    </div>
  </body>
</html>
  `;

  return sendEmail({ to: email, subject, html });
}

export { resend };
