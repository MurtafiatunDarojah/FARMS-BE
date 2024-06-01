const auth = require("../../controllers/admin/auth.admin.controller");
const authJwt = require("../../middlewares/admin/authJwt");

module.exports = function (app) {
  
  app.post("/api/dashboard/roles", [
    authJwt.verifyTokenAdmin,
  ], auth.roles_admin);

};
