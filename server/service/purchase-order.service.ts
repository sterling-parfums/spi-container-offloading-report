import { SAPGet } from "./sap.service";

export type SAPPurchaseOrderItem = {
  PurchaseOrder: string;
  PurchaseOrderItem: string;
  Material: string;
  OrderQuantity: number;
  OrderItemQtyToBaseQtyNmrtr: number;
  OrderItemQtyToBaseQtyDnmntr: number;
  PurchaseOrderItemText: string;
  BaseUnit: string;
};
type SAPPurchaseOrder = {
  PurchaseOrder: string;
  _PurchaseOrderItem: SAPPurchaseOrderItem[];
};
export async function findPurchaseOrders(
  ids: string[],
): Promise<SAPPurchaseOrder[]> {
  const purchaseOrderItemSelect = [
    "PurchaseOrder",
    "PurchaseOrderItem",
    "Material",
    "OrderQuantity",
    "OrderItemQtyToBaseQtyNmrtr",
    "OrderItemQtyToBaseQtyDnmntr",
    "PurchaseOrderItemText",
    "BaseUnit",
  ];

  const url =
    process.env.SAP_API_URL +
    "/sap/opu/odata4/sap/api_purchaseorder_2/srvd_a2x/sap/purchaseorder/0001" +
    "/PurchaseOrder" +
    "?$format=json" +
    `&$filter=${ids.map((id) => `PurchaseOrder eq '${id}'`).join(" or ")}` +
    "&$select=PurchaseOrder" +
    `&$expand=_PurchaseOrderItem($select=${purchaseOrderItemSelect.join(",")})`;

  const response = await SAPGet(url);

  if (!response.ok) {
    throw new Error(`Error fetching purchase order items`);
  }

  const purchaseOrdersData = await response.json();

  return purchaseOrdersData.value as SAPPurchaseOrder[];
}

export function toItemQty(item: SAPPurchaseOrderItem) {
  return (
    item.OrderQuantity *
    (item.OrderItemQtyToBaseQtyNmrtr / item.OrderItemQtyToBaseQtyDnmntr)
  );
}
