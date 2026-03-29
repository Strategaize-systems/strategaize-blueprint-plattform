import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendInviteEmailParams {
  to: string;
  tenantName: string;
  verifyUrl: string;
}

export async function sendErrorNotification({
  level,
  source,
  message,
  stack,
}: {
  level: string;
  source: string;
  message: string;
  stack?: string;
}): Promise<void> {
  const alertEmail = process.env.ERROR_ALERT_EMAIL || process.env.SMTP_USER;
  if (!alertEmail) return;

  const from = `StrategAIze Alerts <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from,
    to: alertEmail,
    subject: `[${level.toUpperCase()}] Blueprint: ${source} — ${message.slice(0, 80)}`,
    html: `
      <h3 style="color:#dc2626;">StrategAIze Blueprint — Error Alert</h3>
      <table style="font-size:14px;border-collapse:collapse;">
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold;color:#64748b;">Level:</td><td>${level}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold;color:#64748b;">Source:</td><td>${source}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold;color:#64748b;">Message:</td><td>${message}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold;color:#64748b;">Time:</td><td>${new Date().toLocaleString("de-DE")}</td></tr>
      </table>
      ${stack ? `<pre style="margin-top:16px;padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-size:12px;overflow-x:auto;">${stack}</pre>` : ""}
    `,
  });
}

export async function sendInviteEmail({
  to,
  tenantName,
  verifyUrl,
}: SendInviteEmailParams): Promise<void> {
  const from = `StrategAIze <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from,
    to,
    subject: "Ihre Einladung zur StrategAIze Plattform",
    html: `
      <h2>Ihre Einladung zur StrategAIze Plattform</h2>
      <p>Sie wurden eingeladen, ein Konto für <strong>${tenantName}</strong> auf der StrategAIze Plattform zu erstellen.</p>
      <p>Klicken Sie auf den folgenden Link, um die Einladung anzunehmen und Ihr Passwort festzulegen:</p>
      <p><a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#120774;color:#ffffff;text-decoration:none;border-radius:6px;">Einladung annehmen</a></p>
      <p style="margin-top:16px;font-size:13px;color:#666;">Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:</p>
      <p style="font-size:13px;word-break:break-all;">${verifyUrl}</p>
      <br>
      <p>Mit freundlichen Grüßen,<br>Ihr StrategAIze Team</p>
    `,
  });
}
