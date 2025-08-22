require("dotenv").config();

const express = require("express");
const app = express();

app.use(express.static("public"));

app.get("/api/items/:code", async (req, res) => {
  const code = req.params.code;

  console.log(`Fetching item with code: ${code}`);

  const item = await findItem(code);

  const description = item?.d?.to_Description?.results[0]?.ProductDescription;
  const uom = item?.d?.to_ProductUnitsOfMeasure?.results[0]?.BaseUnit;

  res.json({
    code,
    description,
    uom,
  });
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

async function findItem(code) {
  const url =
    "https://my413987-api.s4hana.cloud.sap/sap/opu/odata/sap/API_PRODUCT_SRV/A_Product";
  const expandParams = ["to_Description", "to_ProductUnitsOfMeasure"];
  const selectParams = [
    "to_Description/ProductDescription",
    "to_ProductUnitsOfMeasure/BaseUnit",
  ];
  const itemUrl = `${url}('${code}')?$format=json&$expand=${expandParams.join()}&$select=${selectParams.join()}`;

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
