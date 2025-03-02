const utilities = require('../utilities');
// const { Util } = require('../utilities'); // Import 'Util' from utilities
const baseController = {};

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav(); // Correctly use 'Util' to call getNav()
  // req.flash("notice", "This is a flash message.") //add 'notice' for css
  res.render("index", { title: "Home", nav });
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
