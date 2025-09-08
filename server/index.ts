import "dotenv/config";
import { findProduct } from "./service/product.service";
import { submitReportSchema } from "./schema/submit-report-schema";
import express from "express";
import morgan from "morgan";
import { sendMail } from "./service/mail.service";
import { renderReport } from "./service/report.service";
import warehouseEmails from "./config/warehouse-emails";
import { findPurchaseOrders } from "./service/purchase-order.service";

const app = express();

app.use(morgan("tiny"));

app.use(express.static("public"));

app.get("/api/items/:code", async (req, res) => {
  const code = req.params.code;

  console.log(`Fetching item with code: ${code}`);

  const item = await findProduct(code);

  if (code.match(/[^A-Za-z0-9]/g)) {
    return res.status(400).json({ error: "Invalid item code" });
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

  const from = process.env.REPORT_SENDER;
  if (!from) {
    return res.status(500).json({ error: "Email sender is not configured" });
  }

  const purchaseOrders = await findPurchaseOrders(data.poNumbers ?? []);
  const purchaseOrderItems = purchaseOrders.flatMap(
    (po) => po._PurchaseOrderItem,
  );

  const to = warehouseEmails[data.warehouse];
  const subject = `Container Offloading WH-${data.warehouse} Container-${data.containerNumber} FSA-${data.fsaNumber}`;
  const html = renderReport({ ...data, purchaseOrderItems });

  await sendMail({ from, to, subject, html });

  res.json({ message: "Report submitted successfully" });
});

app.post("/api/scratchpad", async (req, res) => {
  const poNumbers = req.body.poNumbers as string[];
  const purchaseOrders = await findPurchaseOrders(poNumbers);

  return res.json({ purchaseOrders });
});

app.listen(process.env.PORT ?? 3001, () => {
  console.log(
    `Server is running on http://localhost:${process.env.PORT ?? 3001}`,
  );
});
