async function handleAddItem(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  const { code, cartonsPerPallet, quantityPerCarton } = Object.fromEntries(
    formData.entries(),
  );

  const item = await fetch(`/api/items/${code}`).then((res) => res.json());

  /**
   * @type {HTMLTableElement}
   */
  const table = document.getElementById("itemsTable");

  const row = table.insertRow(-1);

  const deleteButton = document.createElement("button");
  deleteButton.innerText = "-";
  deleteButton.onclick = () => table.deleteRow(row.rowIndex);
  deleteButton.classList.add("danger");

  const cell = row.insertCell();
  cell.classList.add("no-print");
  cell.appendChild(deleteButton);

  row.insertCell().innerText = `${code} - ${item.description || "N/A"}`;
  row.insertCell().innerText = item.uom || "N/A";
  row.insertCell().innerText = cartonsPerPallet;
  row.insertCell().innerText = quantityPerCarton;
  row.insertCell().innerText =
    Number(cartonsPerPallet) * Number(quantityPerCarton);

  form.reset();
}

function handlePrint() {
  /** @type {HTMLFormElement} */
  const form = document.getElementById("containerForm");

  const isValid = form.checkValidity();
  if (!isValid) {
    form.reportValidity();
    return;
  }

  window.print();
}
