// const express = require('express'); // ADDED AFTER ISSUES
// const router = express.Router(); // Initialize the router ADDED AFTER ISSUES
const invModel = require("../models/inventory-model")
// const invController = require('../controllers/invController'); 
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the single view HTML
* ************************************ */

Util.buildSingleView = async function(data){
  let view = '';
      view += '<div class="car-container">';
      view += '<img src="' + data.inv_thumbnail + '" alt="Image of' + data.inv_make + ' ' + data.inv_model + '" />';
      view += '<ul class="car-details">';
      view += '<li><h2 class="price">price">Price: $' + Intl.NumberFormat.format(data.inv_price) + '</li>';
      view += '<li class="description"><b>Description</b>: ' + data.inv_description + '</li>';
      view += '<li class="color"><b>Color</b>: ' + data.inv_color + '</li>';
      view += '<li class="miles"><b>Mileage</b>: ' + Intl.NumberFormat('en-US') + 'miles</li>';
      view += '</ui>';
      view += '</div>';

  return view  
}


/* **************************************
* HANDLE ERRORS
* ************************************ */
// utilities/index.js
function handleErrors(fn) {
  return function (req, res, next) {
    try {
      return fn(req, res, next);
    } catch (error) {
      next(error); // Pass the error to the next middleware (error handler)
    }
  };
}

module.exports = {
  getNav: Util.getNav,
  buildClassificationGrid: Util.buildClassificationGrid,
  buildSingleView: Util.buildSingleView,
  handleErrors
};