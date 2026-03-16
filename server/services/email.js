const fetch = require('cross-fetch');

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'projectshaca@gmail.com';
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || 'SHO App – HACA';

// ─── Base layout wrapper ────────────────────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>SHO App</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 0;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%);border-radius:12px 12px 0 0;padding:28px 36px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <div style="background:rgba(255,255,255,0.15);display:inline-block;padding:8px 14px;border-radius:8px;">
                  <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:1px;">SHO</span>
                  <span style="color:#93c5fd;font-size:13px;font-weight:400;margin-left:6px;">by HACA</span>
                </div>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:36px 36px 28px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:20px 36px;text-align:center;">
          <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
            This email was sent by <strong style="color:#64748b;">SHO App</strong> · Powered by HACA<br/>
            If you did not expect this email, you can safely ignore it.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ─── Reusable elements ───────────────────────────────────────────────────────
const btn = (text, url, color = '#2563eb') =>
    `<a href="${url}" style="display:inline-block;background:${color};color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;letter-spacing:0.3px;">${text}</a>`;

const divider = () =>
    `<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;"/>`;

const infoBox = (text, bg = '#eff6ff', border = '#bfdbfe', color = '#1d4ed8') =>
    `<div style="background:${bg};border:1px solid ${border};border-radius:8px;padding:14px 18px;margin:18px 0;">
       <p style="margin:0;color:${color};font-size:13px;line-height:1.6;">${text}</p>
     </div>`;

// ─── Templates ───────────────────────────────────────────────────────────────

/**
 * Password Reset Email
 */
const passwordResetTemplate = (name, resetUrl) => baseTemplate(`
  <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#0f172a;">Reset Your Password</h1>
  <p style="margin:0 0 20px;font-size:13px;color:#64748b;">Request received · Expires in 10 minutes</p>
  ${divider()}
  <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">Hi <strong>${name}</strong>,</p>
  <p style="margin:0 0 20px;font-size:15px;color:#334155;line-height:1.6;">
    We received a request to reset your password for your <strong>SHO App</strong> account.
    Click the button below to set a new password. This link expires in <strong>10 minutes</strong>.
  </p>
  <div style="text-align:center;margin:28px 0;">
    ${btn('Reset My Password', resetUrl)}
  </div>
  ${infoBox('If you did not request a password reset, please ignore this email. Your password will remain unchanged.', '#fefce8', '#fde68a', '#92400e')}
  ${divider()}
  <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
    Or paste this link in your browser:<br/>
    <a href="${resetUrl}" style="color:#2563eb;word-break:break-all;">${resetUrl}</a>
  </p>
`);

/**
 * Password Changed Confirmation
 */
const passwordChangedTemplate = (name) => baseTemplate(`
  <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#0f172a;">Password Changed</h1>
  <p style="margin:0 0 20px;font-size:13px;color:#64748b;">Security alert for your account</p>
  ${divider()}
  <div style="text-align:center;margin:12px 0 24px;">
    <div style="display:inline-block;background:#dcfce7;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;">✓</div>
  </div>
  <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">Hi <strong>${name}</strong>,</p>
  <p style="margin:0 0 20px;font-size:15px;color:#334155;line-height:1.6;">
    Your <strong>SHO App</strong> account password was successfully changed.
  </p>
  ${infoBox('⚠️ If you did not make this change, please contact your system administrator immediately and change your password.', '#fef2f2', '#fecaca', '#991b1b')}
  ${divider()}
  <p style="margin:0;font-size:13px;color:#64748b;">For security, we recommend using a strong, unique password.</p>
`);

/**
 * Notification Email
 */
const notificationTemplate = (title, message, senderName, priority = 'medium') => {
    const priorityConfig = {
        urgent: { bg: '#fef2f2', border: '#fecaca', color: '#991b1b', label: '🔴 URGENT' },
        high:   { bg: '#fff7ed', border: '#fed7aa', color: '#c2410c', label: '🟠 HIGH PRIORITY' },
        medium: { bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8', label: '🔵 Notification' },
        low:    { bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d', label: '🟢 Info' },
    };
    const cfg = priorityConfig[priority] || priorityConfig.medium;
    return baseTemplate(`
  <div style="display:inline-block;background:${cfg.bg};border:1px solid ${cfg.border};color:${cfg.color};font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;letter-spacing:0.5px;margin-bottom:16px;">${cfg.label}</div>
  <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#0f172a;">${title}</h1>
  ${divider()}
  <div style="background:#f8fafc;border-radius:8px;padding:20px 22px;margin:0 0 20px;border:1px solid #e2e8f0;">
    <p style="margin:0;font-size:15px;color:#334155;line-height:1.7;white-space:pre-line;">${message}</p>
  </div>
  ${divider()}
  <p style="margin:0;font-size:13px;color:#94a3b8;">
    Sent by <strong style="color:#64748b;">${senderName || 'SHO App Team'}</strong> via SHO App
  </p>
`);
};

/**
 * Feedback Form Request Email
 */
const feedbackFormTemplate = (recipientName, formLink, senderName) => baseTemplate(`
  <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#0f172a;">Feedback Request</h1>
  <p style="margin:0 0 20px;font-size:13px;color:#64748b;">Your opinion matters to us</p>
  ${divider()}
  <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">Hi <strong>${recipientName || 'there'}</strong>,</p>
  <p style="margin:0 0 20px;font-size:15px;color:#334155;line-height:1.6;">
    <strong>${senderName || 'Your SHO'}</strong> has requested your feedback.
    Please take a few minutes to share your experience — it helps us improve and support you better.
  </p>
  <div style="text-align:center;margin:28px 0;">
    ${btn('Open Feedback Form', formLink, '#7c3aed')}
  </div>
  ${infoBox('This form is quick and confidential. Your honest feedback helps your teachers understand how to better support you.', '#f5f3ff', '#ddd6fe', '#5b21b6')}
  ${divider()}
  <p style="margin:0;font-size:12px;color:#94a3b8;">
    Or copy this link: <a href="${formLink}" style="color:#7c3aed;word-break:break-all;">${formLink}</a>
  </p>
`);

/**
 * Welcome / New Account Email
 */
const welcomeTemplate = (name, role, email, tempPassword) => baseTemplate(`
  <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#0f172a;">Welcome to SHO App!</h1>
  <p style="margin:0 0 20px;font-size:13px;color:#64748b;">Your account has been created</p>
  ${divider()}
  <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">Hi <strong>${name}</strong>,</p>
  <p style="margin:0 0 20px;font-size:15px;color:#334155;line-height:1.6;">
    Your <strong>SHO App</strong> account has been created. Here are your login credentials:
  </p>
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px 24px;margin:0 0 20px;">
    <table cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#64748b;width:100px;">Email</td>
        <td style="padding:6px 0;font-size:14px;font-weight:600;color:#0f172a;">${email}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#64748b;">Password</td>
        <td style="padding:6px 0;font-size:14px;font-weight:600;color:#0f172a;font-family:monospace;">${tempPassword}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#64748b;">Role</td>
        <td style="padding:6px 0;font-size:14px;font-weight:600;color:#0f172a;">${role}</td>
      </tr>
    </table>
  </div>
  ${infoBox('⚠️ Please change your password after your first login for security.', '#fefce8', '#fde68a', '#92400e')}
`);

// ─── Core send function ──────────────────────────────────────────────────────
/**
 * Sends an email using the Brevo (Sendinblue) API
 * @param {string|string[]|{email,name}[]} to - Recipient email(s)
 * @param {string} subject - Subject line
 * @param {string} html - HTML body
 */
const sendEmail = async (to, subject, html) => {
    if (!BREVO_API_KEY) {
        console.warn('[Email] BREVO_API_KEY not set — email skipped.');
        return;
    }

    const toList = Array.isArray(to)
        ? to.map(t => (typeof t === 'string' ? { email: t } : t))
        : [typeof to === 'string' ? { email: to } : to];

    const validList = toList.filter(t => t.email && t.email.includes('@'));
    if (!validList.length) {
        console.warn('[Email] No valid recipient addresses — skipped.');
        return;
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': BREVO_API_KEY,
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
            to: validList,
            subject,
            htmlContent: html
        })
    });

    if (!response.ok) {
        const err = await response.text();
        console.error('[Email] Brevo error:', err);
        throw new Error(`Brevo: ${err}`);
    }

    console.log(`[Email] Sent "${subject}" to: ${validList.map(t => t.email).join(', ')}`);
    return response.json();
};

module.exports = {
    sendEmail,
    passwordResetTemplate,
    passwordChangedTemplate,
    notificationTemplate,
    feedbackFormTemplate,
    welcomeTemplate,
};
