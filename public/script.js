const itemCache = {};

function addItemRow(item, entries) {
  /**
   * @type {HTMLTableElement}
   */
  const table = document.getElementById("itemsTable");

  const row = table.insertRow(-1);

  const deleteButton = document.createElement("button");
  deleteButton.innerText = "-";
  deleteButton.onclick = () => table.deleteRow(row.rowIndex);
  deleteButton.classList.add("danger");

  const duplicateButton = document.createElement("button");
  duplicateButton.innerText = "⧉";
  duplicateButton.onclick = () => addItemRow(item, entries);
  duplicateButton.classList.add("secondary");

  const cell = row.insertCell();
  cell.classList.add("no-print");
  cell.appendChild(deleteButton);
  cell.appendChild(duplicateButton);

  const { code, cartonsPerPallet, quantityPerCarton } = entries;

  row.insertCell().innerText = `${code} - ${item.description || "N/A"}`;
  row.insertCell().innerText = item.uom || "N/A";
  row.insertCell().innerText = cartonsPerPallet;
  row.insertCell().innerText = quantityPerCarton;
  row.insertCell().innerText =
    Number(cartonsPerPallet) * Number(quantityPerCarton);

  return row;
}

async function handleAddItem(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  const entries = Object.fromEntries(formData.entries());

  const item =
    itemCache[entries.code.toUpperCase()] ??
    (await fetch(`/api/items/${entries.code}`).then((res) => res.json()));

  itemCache[entries.code.toUpperCase()] = item;

  addItemRow(item, entries);

  form.reset();
}

function getItems() {
  /** @type {HTMLTableElement} */
  const table = document.getElementById("itemsTable");

  return Array.from(table.rows)
    .slice(1)
    .map((row) => {
      const code = row.cells[1].innerText.split(" - ", 1)[0];
      const name = row.cells[1].innerText;
      const uom = row.cells[2].innerText;
      const cartonsPerPallet = row.cells[3].innerText;
      const quantityPerCarton = row.cells[4].innerText;

      return {
        code,
        name,
        uom,
        cartonsPerPallet: Number(cartonsPerPallet),
        quantityPerCarton: Number(quantityPerCarton),
      };
    });
}

async function handleSend() {
  /** @type {HTMLFormElement} */
  const form = document.getElementById("containerForm");

  const isValid = form.checkValidity();
  if (!isValid) {
    form.reportValidity();
    return;
  }

  const items = getItems();
  if (items.length === 0) {
    alert("Please add at least one item.");
    return;
  }

  if (!window.confirm("Are you sure you want to send the report?")) {
    return;
  }

  const formData = new FormData(form);
  const values = Object.fromEntries(formData.entries());

  values.receivedDate = new Date(values.receivedDate).toISOString();
  values.offloadedDate = new Date(values.offloadedDate).toISOString();
  values.returnDate = new Date(values.returnDate).toISOString();

  const response = await fetch("/api/report", {
    method: "POST",
    body: JSON.stringify({ ...values, items }),
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const error = await response.text();
    alert("Something went wrong!");
    console.error(error);
    return;
  }

  alert("Report sent successfully.");
  resetForm();
}

function resetForm() {
  /** @type {HTMLFormElement} */
  const form = document.getElementById("containerForm");
  form.reset();

  /** @type {HTMLTableElement} */
  const table = document.getElementById("itemsTable");
  Array.from(table.rows)
    .slice(1)
    .forEach((row) => table.deleteRow(row.rowIndex));
}

function onLoad() {
  const searchParams = new URLSearchParams(window.location.search);

  /** @type {HTMLSelectElement} */
  const select = document.getElementById("warehouseSelect");

  if (searchParams.has("wh")) {
    const wh = searchParams.get("wh");
    select.value = wh;
  }

  if (select.selectedIndex === -1) {
    select.value = "";
  }
}

document.addEventListener("DOMContentLoaded", onLoad);
