'use strict';

document.addEventListener("DOMContentLoaded", function () {
  const classificationList = document.querySelector("#classificationList");
  const inventoryDisplay = document.getElementById("inventoryDisplay");

  if (!classificationList || !inventoryDisplay) {
    console.error("Required elements not found: #classificationList or #inventoryDisplay");
    return;
  }

  classificationList.addEventListener("change", function () {
    const classification_id = classificationList.value;
    console.log(`Selected classification_id: ${classification_id}`);

    if (!classification_id) {
      inventoryDisplay.innerHTML = "<p>Please select a classification to view inventory.</p>";
      return;
    }

    const classIdURL = `/inv/getInventory/${classification_id}`;
    console.log(`Fetching from: ${classIdURL}`);

    fetch(classIdURL)
      .then(response => {
        console.log(`Response status: ${response.status}`);
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Inventory data received:", data);
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format received from server.");
        }
        buildInventoryList(data);
      })
      .catch(error => {
        console.error("Fetch error:", error.message);
        inventoryDisplay.innerHTML = `
          <tbody>
            <tr><td colspan="3" style="color: red;">Error loading inventory: ${error.message}</td></tr>
          </tbody>
        `;
      });
  });
});

function buildInventoryList(data) {
  const inventoryDisplay = document.getElementById("inventoryDisplay");

  let dataTable = `
    <thead>
      <tr>
        <th>Vehicle Name</th>
        <th>Modify</th>
        <th>Delete</th>
      </tr>
    </thead>
    <tbody>
  `;

  if (data.length > 0) {
    data.forEach(element => {
      console.log(`Building row: ${element.inv_id}, ${element.inv_model}`);
      dataTable += `
        <tr>
          <td>${element.inv_make} ${element.inv_model}</td>
          <td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>
          <td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td>
        </tr>
      `;
    });
  } else {
    console.log("No data to display:", data);
    dataTable += `
      <tr>
        <td colspan="3" style="color: gray;">No inventory items found for this classification.</td>
      </tr>
    `;
  }

  dataTable += '</tbody>';
  inventoryDisplay.innerHTML = dataTable;
}
