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

    if (classification_id) {
      const classIdURL = `/inv/getInventory/${classification_id}`;
      console.log(`Fetching from: ${classIdURL}`);
      fetch(classIdURL)
        .then(function (response) {
          console.log(`Response status: ${response.status}`);
          if (response.ok) {
            return response.json();
          }
          throw new Error(`Network response was not OK: ${response.status}`);
        })
        .then(function (data) {
          console.log("Inventory data received:", data);
          console.log("Data type:", typeof data, "Length:", data?.length);
          buildInventoryList(data);
        })
        .catch(function (error) {
          console.error("Fetch error:", error.message);
          inventoryDisplay.innerHTML = `
            <tbody>
              <tr><td colspan="3">Error loading inventory: ${error.message}</td></tr>
            </tbody>
          `;
        });
    } else {
      inventoryDisplay.innerHTML = "";
    }
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

  if (data && data.length > 0) {
    data.forEach(function (element) {
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
        <td colspan="3">No inventory items found for this classification.</td>
      </tr>
    `;
  }

  dataTable += '</tbody>';
  inventoryDisplay.innerHTML = dataTable;
}