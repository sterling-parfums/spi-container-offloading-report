import { readFileSync } from "fs";
import Mustache from "mustache";
import { join } from "path";
import { SubmitReportInput } from "../schema/submit-report-schema";

export function renderReport(data: SubmitReportInput): string {
  // The path is the runtime path after build
  const templatePath = join(__dirname, "template", "report.html");
  const template = readFileSync(templatePath, "utf-8");

  data.items.sort((a, b) => a.name.localeCompare(b.name));

  const formatted = {
    ...data,
    recievedDate: formatDate(data.receivedDate),
    offloadedDate: formatDate(data.offloadedDate),
    returnDate: formatDate(data.returnDate),
    itemsCount: data.items.length,
  };

  return Mustache.render(template, formatted);
}

function formatDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString("en-GB");
}
