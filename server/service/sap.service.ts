export async function SAPGet(url: string): Promise<Response> {
  const APIUSER = process.env.SAP_API_USER;
  const APIPASSWORD = process.env.SAP_API_PASSWORD;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(`${APIUSER}:${APIPASSWORD}`)}`,
      Accept: "application/json",
    },
  });
}
