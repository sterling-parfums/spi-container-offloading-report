import { SubmitReportInput } from "@/schema/submit-report-schema";
import nodemailer from "nodemailer";
import { renderReport } from "./report.service";
import warehouseEmails from "@/config/warehouse-emails";

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
  const to = warehouseEmails[data.warehouse];
  const subject = `Container Offloading WH-${data.warehouse} Container-${data.containerNumber} FSA-${data.fsaNumber}`;
  const html = renderReport(data);

  await transporter.sendMail({
    to,
    from,
    subject,
    html,
  });
}
