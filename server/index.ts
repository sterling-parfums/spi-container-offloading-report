import "dotenv/config";
import { findItem } from "./service/item.service";
import { submitReportSchema } from "./schema/submit-report-schema";
import express from "express";
import { renderReport } from "./service/pdf.service";
import morgan from "morgan";
import { sendReportMail } from "./service/mail.service";

const app = express();

app.use(morgan("tiny"));

app.use(express.static("public"));

app.get("/api/items/:code", async (req, res) => {
  const code = req.params.code;

  console.log(`Fetching item with code: ${code}`);

  const item = await findItem(code);

  if (code.match(/[^A-Za-z0-9]/g)) {
    res.status(400).json({ error: "Invalid item code" });
  }

  const description = item?.d?.to_Description?.results[0]?.ProductDescription;
  const uom = item?.d?.to_ProductUnitsOfMeasure?.results[0]?.BaseUnit;

  res.json({
    code,
    description,
    uom,
  });
});

app.use(express.json());
app.post("/api/report", async (req, res) => {
  const { success, data, error } = submitReportSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({ errors: error });
  }

  await sendReportMail(data);

  res.json({ message: "Report submitted successfully" });
});

app.listen(process.env.PORT ?? 3001, () => {
  console.log(
    `Server is running on http://localhost:${process.env.PORT ?? 3001}`,
  );
});
