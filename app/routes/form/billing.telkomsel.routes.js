const { billingTelkomselDetail } = require("../../controllers/form/billing-telkomsel/billing.telkomsel.controller");
const authJwt = require("../../middlewares/form/authJwt");

module.exports = function (app) {

  app.get(
    "/api/access/biling/telkomsel/view",
    [
      authJwt.verifyToken,
      authJwt.isUser,
      billingTelkomselDetail
    ]);
    
};
