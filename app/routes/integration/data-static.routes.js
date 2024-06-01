const { getAirlines, getAirports, getCities } = require("../../controllers/integration/data-static.controller");

module.exports = function (app) {
  app.get("/api/integration/airlines", [getAirlines]);
  app.get("/api/integration/airports", [getAirports]);
  app.get("/api/integration/city", [getCities]);
};
