const { createTimeSheet, historyTimesheet, viewTs } = require("../../controllers/form/timesheet/timesheet.controller");
const authJwt = require("../../middlewares/form/authJwt");

module.exports = function (app) {
  
  app.post(
    "/api/access/ts/create",
    [
      authJwt.verifyToken,
      authJwt.isUser,
      createTimeSheet
    ],
  );

  app.get(
    "/api/access/ts/history",
    [
      authJwt.verifyToken,
      authJwt.isUser,
      historyTimesheet
    ],
  );

  app.get(
    "/api/access/ts/view",
    [
      authJwt.verifyToken,
      authJwt.isUser,
      viewTs
    ]);
    
};
