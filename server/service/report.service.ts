import { readFileSync } from "fs";
import Mustache from "mustache";
import { join } from "path";
import { SubmitReportInput } from "../schema/submit-report-schema";
import { OffloadingReport } from "@/entity/OffloadingReport";
import { repository } from "./datasource.service";

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
    poNumbers: data.poNumbers.join(", "),
    mismatchItems: 
  };

  return Mustache.render(template, formatted);
}

export async function saveReport(data: SubmitReportInput): Promise<number> {
  const report = new OffloadingReport();
  report.payload = JSON.stringify(data);

  const repo = await repository();
  const savedReport = await repo.save(report);

  return savedReport.id;
}

function formatDate(date: string) {
  const d = new Date(date);
  return d.toLocaleString("en-GB");
}
