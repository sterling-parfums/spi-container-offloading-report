import { SubmitReportInput } from "@/schema/submit-report-schema";
import nodemailer from "nodemailer";
import { renderReport } from "./pdf.service";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendReportMail(data: SubmitReportInput) {
  const from = process.env.REPORT_SENDER;
  const to = process.env.REPORT_RECEIPIENT_EMAIL;
  const subject = `Container-${data.containerNumber} FSA-${data.fsaNumber}`;
  const html = renderReport(data);

  await transporter.sendMail({
    to,
    from,
    subject,
    html,
  });
}
