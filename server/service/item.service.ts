type SAPResponse = {
  d: {
    to_Description: {
      results: { ProductDescription: string }[];
    };
    to_ProductUnitsOfMeasure: {
      results: { BaseUnit: string }[];
    };
  };
};
export async function findItem(code: string): Promise<SAPResponse> {
  const baseUrl = process.env.SAP_API_URL;
  const url = `${baseUrl}/sap/opu/odata/sap/API_PRODUCT_SRV/A_Product`;

  const expandParams = ["to_Description", "to_ProductUnitsOfMeasure"];
  const selectParams = [
    "to_Description/ProductDescription",
    "to_ProductUnitsOfMeasure/BaseUnit",
  ];
  const itemUrl = `${url}('${code.toUpperCase()}')?$format=json&$expand=${expandParams.join()}&$select=${selectParams.join()}`;

  const APIUSER = process.env.SAP_API_USER;
  const APIPASSWORD = process.env.SAP_API_PASSWORD;

  return fetch(itemUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(`${APIUSER}:${APIPASSWORD}`)}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        console.log(response.status);
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .catch((error) => {
      console.error(
        "There has been a problem with your fetch operation:",
        error,
      );
    });
}
