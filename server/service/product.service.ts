type SAPProductResponse = {
  d: {
    to_Description: {
      results: { ProductDescription: string }[];
    };
    to_ProductUnitsOfMeasure: {
      results: { BaseUnit: string }[];
    };
  };
};

export async function findProduct(
  code: string,
): Promise<SAPProductResponse | null> {
  const baseUrl = process.env.SAP_API_URL;
  const url = `${baseUrl}/sap/opu/odata/sap/API_PRODUCT_SRV/A_Product`;

  const expandParams = ["to_Description", "to_ProductUnitsOfMeasure"];
  const selectParams = [
    "to_Description/ProductDescription",
    "to_ProductUnitsOfMeasure/BaseUnit",
  ];
  const productUrl = `${url}('${code.toUpperCase()}')?$format=json&$expand=${expandParams.join()}&$select=${selectParams.join()}`;

  const APIUSER = process.env.SAP_API_USER;
  const APIPASSWORD = process.env.SAP_API_PASSWORD;

  const response = await fetch(productUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(`${APIUSER}:${APIPASSWORD}`)}`,
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Error fetching product: ${response.statusText}`);
  }

  const product = await response.json();

  return product;
}
