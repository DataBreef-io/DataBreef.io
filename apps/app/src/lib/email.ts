import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "DataBreef Support <support@databreef.io>";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${BASE_URL}/auth/reset-password?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your password — DataBreef",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Reset your password — DataBreef</title>

</head>
<body style="margin:0;padding:0;background-color:hsl(215,45%,7%);">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:hsl(215,45%,7%);padding:48px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background-color:hsl(210,50%,11%);border-radius:16px;border:1px solid hsl(192,45%,22%);overflow:hidden;box-shadow:0 8px 32px rgba(8,18,30,0.6),0 2px 8px rgba(8,18,30,0.4);">
          <!-- Accent bar -->
          <tr>
            <td style="background:linear-gradient(90deg,hsl(172,65%,50%),hsl(182,90%,58%));height:3px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 48px 44px;">
              <!-- Brand mark -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:36px;">
                <tr>
                  <td style="font-family:'Outfit','Segoe UI',system-ui,sans-serif;font-size:20px;font-weight:700;color:hsl(172,65%,50%);letter-spacing:-0.025em;">DataBreef</td>
                </tr>
              </table>
              <!-- Eyebrow -->
              <p style="font-family:'Outfit','Segoe UI',system-ui,sans-serif;font-size:11px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:hsl(172,65%,50%);margin:0 0 10px;">Account security</p>
              <!-- Heading -->
              <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:34px;font-weight:600;color:hsl(200,30%,96%);margin:0 0 20px;line-height:1.25;letter-spacing:-0.025em;">Reset your<br>password</h1>
              <!-- Body copy -->
              <p style="font-family:'Inter','Segoe UI',system-ui,sans-serif;font-size:15px;line-height:1.625;color:hsl(215,20%,88%);margin:0 0 32px;">
                We received a request to reset the password for your DataBreef account. Click the button below to choose a new password.<br><br>
                This link expires in <strong style="color:hsl(200,30%,96%);">15 minutes</strong>. If you did not request this, you can safely ignore this email.
              </p>
              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:36px;">
                <tr>
                  <td style="border-radius:8px;background-color:hsl(172,65%,50%);">
                    <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;font-family:'Outfit','Segoe UI',system-ui,sans-serif;font-size:15px;font-weight:600;color:hsl(215,45%,7%);text-decoration:none;letter-spacing:0.05em;border-radius:8px;">Reset Password</a>
                  </td>
                </tr>
              </table>
              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr><td style="border-top:1px solid hsl(192,45%,22%);font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>
              <!-- Ignore note -->
              <p style="font-family:'Inter','Segoe UI',system-ui,sans-serif;font-size:13px;line-height:1.5;color:hsl(220,15%,55%);margin:0 0 16px;">
                Didn&rsquo;t request a password reset? Your account is safe &mdash; no changes have been made.
              </p>
              <!-- Fallback URL -->
              <p style="font-family:'Inter','Segoe UI',system-ui,sans-serif;font-size:12px;line-height:1.5;color:hsl(220,15%,55%);margin:0;">
                Or copy this link:<br>
                <a href="${resetUrl}" style="color:hsl(168,70%,72%);word-break:break-all;text-decoration:none;">${resetUrl}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:18px 48px;background-color:hsl(215,45%,7%);border-top:1px solid hsl(192,45%,22%);text-align:center;">
              <p style="font-family:'Outfit','Segoe UI',system-ui,sans-serif;font-size:11px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:hsl(220,15%,55%);margin:0;">DataBreef &middot; Your schema, surfaced.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verifyUrl = `${BASE_URL}/auth/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your email — DataBreef",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Verify your email — DataBreef</title>

</head>
<body style="margin:0;padding:0;background-color:hsl(215,45%,7%);">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:hsl(215,45%,7%);padding:48px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background-color:hsl(210,50%,11%);border-radius:16px;border:1px solid hsl(192,45%,22%);overflow:hidden;box-shadow:0 8px 32px rgba(8,18,30,0.6),0 2px 8px rgba(8,18,30,0.4);">
          <!-- Accent bar -->
          <tr>
            <td style="background:linear-gradient(90deg,hsl(172,65%,50%),hsl(182,90%,58%));height:3px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 48px 44px;">
              <!-- Brand mark -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:36px;">
                <tr>
                  <td style="font-family:'Outfit','Segoe UI',system-ui,sans-serif;font-size:20px;font-weight:700;color:hsl(172,65%,50%);letter-spacing:-0.025em;">DataBreef</td>
                </tr>
              </table>
              <!-- Eyebrow -->
              <p style="font-family:'Outfit','Segoe UI',system-ui,sans-serif;font-size:11px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:hsl(172,65%,50%);margin:0 0 10px;">Welcome aboard</p>
              <!-- Heading -->
              <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:34px;font-weight:600;color:hsl(200,30%,96%);margin:0 0 20px;line-height:1.25;letter-spacing:-0.025em;">Confirm your email<br>to dive in</h1>
              <!-- Body copy -->
              <p style="font-family:'Inter','Segoe UI',system-ui,sans-serif;font-size:15px;line-height:1.625;color:hsl(215,20%,88%);margin:0 0 32px;">
                You&rsquo;re almost ready to explore your reef. Click the button below to verify your email address and surface your DataBreef account.<br><br>
                This link expires in <strong style="color:hsl(200,30%,96%);">15 minutes</strong>.
              </p>
              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:36px;">
                <tr>
                  <td style="border-radius:8px;background-color:hsl(172,65%,50%);">
                    <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;font-family:'Outfit','Segoe UI',system-ui,sans-serif;font-size:15px;font-weight:600;color:hsl(215,45%,7%);text-decoration:none;letter-spacing:0.05em;border-radius:8px;">Verify Email Address</a>
                  </td>
                </tr>
              </table>
              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr><td style="border-top:1px solid hsl(192,45%,22%);font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>
              <!-- Ignore note -->
              <p style="font-family:'Inter','Segoe UI',system-ui,sans-serif;font-size:13px;line-height:1.5;color:hsl(220,15%,55%);margin:0 0 16px;">
                Didn&rsquo;t create an account? You can safely ignore this email &mdash; no reef has been anchored to your address.
              </p>
              <!-- Fallback URL -->
              <p style="font-family:'Inter','Segoe UI',system-ui,sans-serif;font-size:12px;line-height:1.5;color:hsl(220,15%,55%);margin:0;">
                Or copy this link:<br>
                <a href="${verifyUrl}" style="color:hsl(168,70%,72%);word-break:break-all;text-decoration:none;">${verifyUrl}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:18px 48px;background-color:hsl(215,45%,7%);border-top:1px solid hsl(192,45%,22%);text-align:center;">
              <p style="font-family:'Outfit','Segoe UI',system-ui,sans-serif;font-size:11px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:hsl(220,15%,55%);margin:0;">DataBreef &middot; Your schema, surfaced.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}
