'use strict';

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("#updateForm");
  const updateBtn = document.querySelector("#updateButton");

  if (!form || !updateBtn) {
    console.error("Form or button not found!");
    return;
  }

  // Enable the button when a field changes
  form.addEventListener("input", function () {
    updateBtn.removeAttribute("disabled");
  });

  // Debugging: Check if form submission is triggered
  form.addEventListener("submit", function (event) {
    console.log("✅ Form is submitting...");
  });
});
