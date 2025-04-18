const utilities = require("../utilities");

const baseController = {};

baseController.buildHome = async function (req, res, next) {
  try {
    const nav = await utilities.getNav(req, res);
    res.render("index", {
      title: "Home",
      nav,
      messages: res.locals.messages || {}, // Ensure messages is passed
    });
  } catch (err) {
    next(err);
  }
};

module.exports = baseController;



// const inventoryModel = require('../models/inventory-model');
// const utilities = require('../utilities');

// exports.getVehicleDetail = async (req, res) => {
//   try {
//     const vehicleId = req.params.inventoryId;
//     const vehicleData = await inventoryModel.getVehicleById(vehicleId);

//     if (!vehicleData) {
//       return res.status(404).render('error', { message: 'Vehicle not found' });
//     }

//     // Wrap vehicle data into HTML using the utility function
//     const vehicleHTML = utilities.formatVehicleHTML(vehicleData);

//     // Render the view with vehicle data
//     res.render('inventory/detail', {
//       vehicle: vehicleData,
//       vehicleHTML,
//       title: `${vehicleData.make} ${vehicleData.model}`
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).render('error', { message: 'Internal Server Error' });
//   }
// };
