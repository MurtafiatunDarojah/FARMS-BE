const { ServiceRequestList, ClosedServiceRequest, ApprovedByIT } = require("../../controllers/admin/service.request.controller");
const { viewSR, getApplication } = require("../../controllers/form/service-request/service.request.controller");
const { checkAccessPermission } = require("../../middlewares/admin/authJwt");
const authJwt = require("../../middlewares/admin/authJwt");

module.exports = function (app) {

  let menu = 'SR'

  app.get(
    "/api/access/service-request",
    [
      authJwt.verifyTokenAdmin,
      (req, res, next) => checkAccessPermission(req, res, next, menu, ['Read'])
    ],
    ServiceRequestList
  );

  app.get(
    "/api/access/service-request/view",
    [
      authJwt.verifyTokenAdmin,
      (req, res, next) => checkAccessPermission(req, res, next, menu, ['Read'])
    ],
    viewSR
  );

  app.get(
    "/api/access/service-request/applications",
    [
      authJwt.verifyTokenAdmin,
      (req, res, next) => checkAccessPermission(req, res, next, menu, ['Read'])
    ],
    getApplication
  )

  app.post(
    "/api/access/service-request/close",
    [
      authJwt.verifyTokenAdmin,
      (req, res, next) => checkAccessPermission(req, res, next, menu, ['Write'])
    ],
    ClosedServiceRequest
  )

  app.post(
    "/api/access/service-request/it-approval",
    [
      authJwt.verifyTokenAdmin,
      (req, res, next) => checkAccessPermission(req, res, next, menu, ['Write'])
    ],
    ApprovedByIT
  )

};
