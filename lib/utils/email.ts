import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationCode(email: string, code: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Florithm - 邮箱验证码",
    html: `
      <div style="max-width: 480px; margin: 0 auto; font-family: sans-serif;">
        <h2 style="color: #333;">Florithm 验证码</h2>
        <p>您的验证码是：</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2563eb; padding: 16px 0;">
          ${code}
        </div>
        <p style="color: #666; font-size: 14px;">验证码有效期 10 分钟，请勿泄露给他人。</p>
      </div>
    `,
  });
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
