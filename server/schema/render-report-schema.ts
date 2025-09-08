import { SubmitReportInput } from "./submit-report-schema";
import { SAPPurchaseOrderItem } from "@/service/purchase-order.service";

export type RenderReportInput = SubmitReportInput & {
  purchaseOrderItems: SAPPurchaseOrderItem[];
};
