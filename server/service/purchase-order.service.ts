import { SAPGet } from "./sap.service";

type SAPPurchaseOrder = {
  PurchaseOrder: string;
  _PurchaseOrderItem: {
    Material: string;
  };
};
export async function findPurchaseOrder(
  id: string,
): Promise<SAPPurchaseOrder | null> {
  const url =
    process.env.SAP_API_URL +
    "/sap/opu/odata4/sap/api_purchaseorder_2/srvd_a2x/sap/purchaseorder/0001" +
    "/PurchaseOrder" +
    `('${id}')` +
    "?$format=json" +
    "&$select=PurchaseOrder" +
    "&$expand=_PurchaseOrderItem($select=Material)";

  const response = await SAPGet(url);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Error fetching purchase order items: ${response.statusText}`,
    );
  }

  const poData = await response.json();

  return poData;
}
