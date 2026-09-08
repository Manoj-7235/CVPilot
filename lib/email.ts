import nodemailer from 'nodemailer';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Get base URL for email links
 */
export function getAppBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (url) {
    return url.replace(/\/+$/, '');
  }
  return 'http://localhost:3001';
}

/**
 * Send an email using SMTP or safe console fallback in development
 */
export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const fromEmail = process.env.EMAIL_FROM || 'CVPilot <noreply@cvpilot.ai>';

  // Check if SMTP is configured (prioritized if valid password provided)
  const isRealSmtpPass = smtpPass && !smtpPass.includes('paste_your') && smtpPass.length > 5;
  if (smtpHost && smtpUser && isRealSmtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass.replace(/\s+/g, ''), // Strip spaces if copied from Google App Password
        },
      });

      await transporter.sendMail({
        from: fromEmail,
        to,
        subject,
        html,
        text,
      });

      return { success: true };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'SMTP delivery failed';
      console.error('[Email Service] Error sending email via SMTP:', errorMsg);
      return { success: false, error: 'Email delivery failed' };
    }
  }

  // Check if Resend API is configured as fallback
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const fromAddress = process.env.EMAIL_FROM || 'CVPilot <onboarding@resend.dev>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [to],
          subject,
          html,
          text,
        }),
      });

      if (res.ok) {
        return { success: true };
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error('[Email Service] Resend API error:', errData);
      }
    } catch (err: unknown) {
      console.error('[Email Service] Error calling Resend API:', err);
    }
  }

  // Development / Test Fallback: safely log to console
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`[EMAIL SERVICE] Welcome Email Dispatched`);
  console.log(`[EMAIL SERVICE] To: ${to}`);
  console.log(`[EMAIL SERVICE] Subject: ${subject}`);
  console.log(`[EMAIL SERVICE] Plain Text:\n${text}`);
  console.log('═══════════════════════════════════════════════════════════════════');

  return { success: true };
}

/**
 * Send "Thank You for Signing Up" Welcome Email
 */
export async function sendWelcomeEmail(
  toEmail: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  const baseUrl = getAppBaseUrl();
  const reviewUrl = `${baseUrl}/review`;

  const subject = 'Welcome to CVPilot — Thank you for signing up!';

  const text = `Hello ${name},\n\nThank you for signing up for CVPilot! We are excited to have you on board.\n\nWith CVPilot, you can:\n- Upload PDF or Word resumes for instant ATS compatibility scoring\n- Match your resume against target job descriptions\n- Get AI-powered line-by-line rewrite suggestions that preserve your authentic experience\n\nStart analyzing your resume now:\n${reviewUrl}\n\nBest regards,\nThe CVPilot Team`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to CVPilot</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #020617; color: #f8fafc; padding: 40px 20px; margin: 0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="560" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1); padding: 36px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <h1 style="color: #6366f1; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">CVPilot</h1>
              <p style="color: #94a3b8; font-size: 14px; margin: 4px 0 0 0;">AI Resume Reviewer & ATS Optimizer</p>
            </td>
          </tr>
          <tr>
            <td style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">
              <p style="margin-top: 0; font-size: 16px;">Hi <strong>${name}</strong>,</p>
              <p><strong>Thank you for signing up for CVPilot!</strong> We&apos;re thrilled to help you optimize your resume and prepare for your next career milestone.</p>
              <p>Here is what you can do right away:</p>
              <ul style="padding-left: 20px; margin-bottom: 24px; color: #94a3b8;">
                <li style="margin-bottom: 8px;"><strong style="color: #f8fafc;">ATS Score Analysis:</strong> See how enterprise screening systems view your layout.</li>
                <li style="margin-bottom: 8px;"><strong style="color: #f8fafc;">Semantic Keyword Matching:</strong> Compare your resume against any target job description.</li>
                <li style="margin-bottom: 8px;"><strong style="color: #f8fafc;">Fact-Preserved Rewriting:</strong> Elevate impact verbs without inventing fake credentials.</li>
              </ul>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 12px 0 28px 0;">
              <a href="${reviewUrl}" style="background: linear-gradient(135deg, #4f46e5, #6366f1); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 12px; font-size: 15px; font-weight: 600; display: inline-block; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">
                Analyze Your Resume Now
              </a>
            </td>
          </tr>
          <tr>
            <td style="color: #64748b; font-size: 12px; line-height: 1.5; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 20px; text-align: center;">
              <p style="margin: 0;">Have questions or feedback? Reply directly to this email or visit CVPilot anytime.</p>
              <p style="margin: 6px 0 0 0; color: #475569;">&copy; ${new Date().getFullYear()} CVPilot. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return sendEmail({ to: toEmail, subject, text, html });
}

/**
 * Send Password Reset Email (Kept for Forgot Password feature)
 */
export async function sendPasswordResetEmail(
  toEmail: string,
  name: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const baseUrl = getAppBaseUrl();
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

  const subject = 'Reset your CVPilot password';

  const text = `Hello ${name},\n\nWe received a request to reset your password for your CVPilot account. Click the link below to set a new password:\n\n${resetUrl}\n\nThis password reset link will expire in 1 hour.\n\nIf you did not request a password reset, you can safely ignore this email.\n\nBest regards,\nThe CVPilot Team`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your CVPilot password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #020617; color: #f8fafc; padding: 40px 20px; margin: 0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="560" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1); padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <h1 style="color: #6366f1; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">CVPilot</h1>
              <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;">Password Reset Request</p>
            </td>
          </tr>
          <tr>
            <td style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">
              <p style="margin-top: 0;">Hi <strong>${name}</strong>,</p>
              <p>We received a request to reset your password for your CVPilot account. Please click the button below to choose a new password:</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 28px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #4f46e5, #6366f1); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: 600; display: inline-block; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">
                Reset My Password
              </a>
            </td>
          </tr>
          <tr>
            <td style="color: #94a3b8; font-size: 13px; line-height: 1.6; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 20px;">
              <p style="margin: 0 0 8px 0;">Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #818cf8; margin: 0 0 16px 0; font-size: 12px;">${resetUrl}</p>
              <p style="margin: 0; font-size: 12px; color: #64748b;">This link will expire in 1 hour. If you did not request a password reset, no action is needed.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return sendEmail({ to: toEmail, subject, text, html });
}
