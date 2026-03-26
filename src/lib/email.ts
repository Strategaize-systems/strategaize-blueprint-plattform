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
