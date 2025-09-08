import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

type MailOptions = {
  from: string;
  to: string;
  subject: string;
  html: string;
};

export async function sendMail({ from, to, subject, html }: MailOptions) {
  return transporter.sendMail({
    to,
    from,
    subject,
    html,
  });
}
