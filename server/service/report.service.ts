import { RenderReportInput } from "@/schema/render-report-schema";
import { readFileSync } from "fs";
import Mustache from "mustache";
import { join } from "path";
import { SAPPurchaseOrderItem, toItemQty } from "./purchase-order.service";

function findDifferenceItems(
  purchaseOrderItems: SAPPurchaseOrderItem[],
  containerItems: RenderReportInput["items"],
) {
  const containerItemTotals = containerItems.reduce(
    (acc, item) => {
      acc[item.code] ??= { ...item, totalQuantity: 0 };
      acc[item.code]!.totalQuantity = item.totalQuantity;

      return acc;
    },
    {} as Record<string, RenderReportInput["items"][number]>,
  );

  const purchaseOrderItemTotals = purchaseOrderItems.reduce(
    (acc, item) => {
      acc[item.Material] ??= { ...item, OrderQuantity: 0 };
      acc[item.Material]!.OrderQuantity += toItemQty(item);

      return acc;
    },
    {} as Record<string, SAPPurchaseOrderItem>,
  );

  return Object.values(purchaseOrderItemTotals)
    .filter((item) => {
      const containerItem = containerItemTotals[item.Material];
      return (
        !containerItem || item.OrderQuantity !== containerItem.totalQuantity
      );
    })
    .map((item) => ({
      code: item.Material,
      name: item.PurchaseOrderItemText,
      uom: item.BaseUnit,
      poQty: item.OrderQuantity,
      containerQty: containerItemTotals[item.Material]?.totalQuantity ?? 0,
      poNumber: item.PurchaseOrder,
    }));
}

export function renderReport(data: RenderReportInput): string {
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
    poNumbers: data.poNumbers?.join(", "),
    differenceItems: function () {
      const items = findDifferenceItems(data.purchaseOrderItems, data.items);

      if (items.length === 0) return null;

      return {
        count: items.length,
        items,
      };
    },
  };

  return Mustache.render(template, formatted);
}

function formatDate(date: string) {
  const d = new Date(date);
  return d.toLocaleString("en-GB");
}
