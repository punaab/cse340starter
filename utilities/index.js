// const express = require('express'); // ADDED AFTER ISSUES
// const router = express.Router(); // Initialize the router ADDED AFTER ISSUES
const invModel = require("../models/inventory-model")
// const invController = require('../controllers/invController'); 
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  try {
    let data = await invModel.getClassifications();

    console.log("[getNav] Classifications Data:", data); // Debugging log

    if (!Array.isArray(data)) {
      console.error("[getNav] getClassifications() did not return an array. Received:", data);
      data = []; // ✅ Ensure it's always an array
    }

    let list = "<ul>";
    list += '<li><a href="/" title="Home page">Home</a></li>';

    data.forEach((row) => { // ✅ This will now always work
      list += "<li>";
      list += `<a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a>`;
      list += "</li>";
    });

    list += "</ul>";
    return list;

  } catch (error) {
    console.error("[getNav] Error fetching classifications:", error);
    return "<ul><li><a href='/'>Home</a></li></ul>"; // ✅ Return basic nav if error occurs
  }
};


/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    
    data.forEach(vehicle => {
      grid += '<li>';
      
      // ✅ 1. Vehicle Name First
      grid += `<h2 class="vehicle-title">
                 <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
                   ${vehicle.inv_make} ${vehicle.inv_model}
                 </a>
               </h2>`;
      
      // ✅ 2. Image Next
      grid += `<a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
                 <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" class="vehicle-image">
               </a>`;
      
      // ✅ 3. Line at the Bottom
      grid += '<hr class="vehicle-divider">';
      
      grid += '</li>';
    });

    grid += '</ul>';
  } else { 
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};


/* **************************************
 * Build Classification Dropdown List
 * ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  try {
    let classifications = await invModel.getClassifications(); // ✅ Directly fetch the array

    if (!classifications || classifications.length === 0) {
      console.warn("[buildClassificationList] No classifications found.");
      return "<select name='classification_id' id='classificationList' required><option value=''>No Classifications Available</option></select>";
    }

    let classificationList = `<select name="classification_id" id="classificationList" required>`;
    classificationList += `<option value=''>Choose a Classification</option>`;
    
    classifications.forEach((row) => {
      classificationList += `<option value="${row.classification_id}"`;
      if (classification_id && row.classification_id == classification_id) {
        classificationList += " selected"; // ✅ Keeps the selection if an error occurs
      }
      classificationList += `>${row.classification_name}</option>`;
    });

    classificationList += `</select>`;

    return classificationList;
  } catch (error) {
    console.error("[buildClassificationList] Error building classification list:", error);
    return "<select name='classification_id' id='classificationList' required><option value=''>Error Loading Classifications</option></select>";
  }
};




/* **************************************
* Build the single view HTML
* ************************************ */

Util.buildSingleView = async function(data){
  let view = '';
  view += '<div class="car-container">';
  view += '<img src="' + data.inv_thumbnail + '" alt="Image of ' + data.inv_make + ' ' + data.inv_model + '" />';
  view += '<ul class="car-details">';
  view += '<li><h2 class="price">Price: $' + new Intl.NumberFormat('en-US').format(data.inv_price) + '</h2></li>';
  view += '<li class="description"><b>Description</b>: ' + data.inv_description + '</li>';
  view += '<li class="color"><b>Color</b>: ' + data.inv_color + '</li>';
  view += '<li class="miles"><b>Mileage</b>: ' + new Intl.NumberFormat('en-US').format(data.inv_miles) + ' miles</li>';
  view += '</ul>'; // Fixed incorrect <ui> tag
  view += '</div>';

  return view;  
};


/* **************************************
* Build the Login View HTML
* ************************************ */

Util.buildLoginView = async function(){
  let loginForm = '';

  loginForm += '<div class="login-container">';
  loginForm += '<h2>Login</h2>';
  loginForm += '<p class="notice">Enter your credentials to access your account.</p>';
  
  loginForm += '<form action="/account/login" method="POST">';
  loginForm += '<label for="email">Email:</label>';
  loginForm += '<input type="email" id="email" name="email" required>';

  loginForm += '<label for="password">Password:</label>';
  loginForm += '<input type="password" id="password" name="password" required>';

  loginForm += '<button type="submit">Login</button>';
  loginForm += '</form>';

  loginForm += '<p><a href="/account/register">Don\'t have an account? Sign up</a></p>';
  loginForm += '</div>';

  return loginForm;
}



/* **************************************
* HANDLE ERRORS
* ************************************ */

Util.handleErrors = function (fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(error => {
      console.error(`[handleErrors] Error in route: ${req.originalUrl}`, error);
      next(error);
    });
  };
};

// utilities/index.js
// function handleErrors(fn) {
//   return function (req, res, next) {
//     try {
//       return fn(req, res, next);
//     } catch (error) {
//       next(error); // Pass the error to the next middleware (error handler)
//     }
//   };
// }

module.exports = {
  getNav: Util.getNav,
  buildClassificationGrid: Util.buildClassificationGrid,
  buildSingleView: Util.buildSingleView,
  buildLoginView: Util.buildLoginView, // Added
  handleErrors: Util.handleErrors,
  buildClassificationList: Util.buildClassificationList, 
};
