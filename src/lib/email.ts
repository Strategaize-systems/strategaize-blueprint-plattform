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
  locale?: string;
}

const INVITE_TEMPLATES = {
  de: {
    subject: "Ihre Einladung zur StrategAIze Plattform",
    heading: "Ihre Einladung zur StrategAIze Plattform",
    intro: (tenantName: string) =>
      `Sie wurden eingeladen, ein Konto für <strong>${tenantName}</strong> auf der StrategAIze Plattform zu erstellen.`,
    cta: "Klicken Sie auf den folgenden Link, um die Einladung anzunehmen und Ihr Passwort festzulegen:",
    button: "Einladung annehmen",
    fallback: "Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:",
    closing: "Mit freundlichen Grüßen,<br>Ihr StrategAIze Team",
  },
  en: {
    subject: "Your invitation to the StrategAIze Platform",
    heading: "Your invitation to the StrategAIze Platform",
    intro: (tenantName: string) =>
      `You have been invited to create an account for <strong>${tenantName}</strong> on the StrategAIze Platform.`,
    cta: "Click the following link to accept the invitation and set your password:",
    button: "Accept invitation",
    fallback: "If the button doesn't work, copy this link into your browser:",
    closing: "Kind regards,<br>Your StrategAIze Team",
  },
  nl: {
    subject: "Uw uitnodiging voor het StrategAIze Platform",
    heading: "Uw uitnodiging voor het StrategAIze Platform",
    intro: (tenantName: string) =>
      `U bent uitgenodigd om een account aan te maken voor <strong>${tenantName}</strong> op het StrategAIze Platform.`,
    cta: "Klik op de volgende link om de uitnodiging te accepteren en uw wachtwoord in te stellen:",
    button: "Uitnodiging accepteren",
    fallback: "Als de knop niet werkt, kopieer dan deze link in uw browser:",
    closing: "Met vriendelijke groet,<br>Uw StrategAIze Team",
  },
} as const;

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
  locale,
}: SendInviteEmailParams): Promise<void> {
  const from = `StrategAIze <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;
  const lang = (locale && locale in INVITE_TEMPLATES ? locale : "de") as keyof typeof INVITE_TEMPLATES;
  const t = INVITE_TEMPLATES[lang];

  await transporter.sendMail({
    from,
    to,
    subject: t.subject,
    html: `
      <h2>${t.heading}</h2>
      <p>${t.intro(tenantName)}</p>
      <p>${t.cta}</p>
      <p><a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#120774;color:#ffffff;text-decoration:none;border-radius:6px;">${t.button}</a></p>
      <p style="margin-top:16px;font-size:13px;color:#666;">${t.fallback}</p>
      <p style="font-size:13px;word-break:break-all;">${verifyUrl}</p>
      <br>
      <p>${t.closing}</p>
    `,
  });
}
