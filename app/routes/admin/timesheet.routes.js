const authJwt = require("../../middlewares/admin/authJwt");
const timesheet = require("../../controllers/admin/timesheet.controller");
const { viewTs } = require("../../controllers/form/timesheet/timesheet.controller");
const { checkAccessPermission } = require("../../middlewares/admin/authJwt");
const verifyActifity = require("../../middlewares/admin/verifyActifity");

module.exports = function (app) {

  let menu = 'TS'

  app.get('/api/dashboard/timesheet/list', [
    authJwt.verifyTokenAdmin,
    (req, res, next) => checkAccessPermission(req, res, next, menu, ['Read'])
  ], timesheet.listTimesheet)

  app.get('/api/dashboard/timesheet/view', [
    authJwt.verifyTokenAdmin,
    (req, res, next) => checkAccessPermission(req, res, next, menu, ['Read'])
  ], viewTs)

  app.post(
    "/api/dashboard/timesheet/approve",
    [
      authJwt.verifyTokenAdmin,
      (req, res, next) => checkAccessPermission(req, res, next, menu, ['Write']),
      verifyActifity.isEmptyApprovalDetail,
      verifyActifity.checkStatusApprovalList,
    ],
    [
      timesheet.FormApproved
    ]
  );

  app.post(
    "/api/dashboard/timesheet/reject",
    [
      authJwt.verifyTokenAdmin,
      (req, res, next) => checkAccessPermission(req, res, next, menu, ['Write']),
      verifyActifity.isEmptyApprovalDetail,
      verifyActifity.checkStatusApprovalList,
    ],
    [
      timesheet.FormReject
    ]
  );

  app.post(
    "/api/dashboard/timesheet/update",
    [
      authJwt.verifyTokenAdmin,
      (req, res, next) => checkAccessPermission(req, res, next, menu, ['Write']),
    ],
    [
      timesheet.updatedTS
    ]
  );

  app.get(
    "/api/dashboard/printAll",
    [
      authJwt.verifyTokenAdmin,
      (req, res, next) => checkAccessPermission(req, res, next, menu, ['Write']),
    ],
    timesheet.getAllTSInRange
  );


};
