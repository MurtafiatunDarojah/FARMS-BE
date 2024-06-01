const { createHias } = require("../../controllers/form/hias/hias.controller");

module.exports = function (app) {
  app.post(
    "/api/access/hias",
    [
      createHias
    ],
  )
};
