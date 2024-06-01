const { ImportBilling, PeriodeList, PeriodeDetail, MasterList, MasterView, MasterUpdate, MasterCreate, applyToApproval } = require("../../controllers/admin/billing.telkomsel.controller");
const { checkAccessPermission } = require("../../middlewares/admin/authJwt");

const authJwt = require("../../middlewares/admin/authJwt");

module.exports = function (app) {

  let menu = 'BT'

  app.post(
    "/api/access/billing/telkomsel",
    [
      authJwt.verifyTokenAdmin,
      (req, res, next) => checkAccessPermission(req, res, next, menu, ['Write'])
    ],
    ImportBilling
  );

  app.post(
    "/api/access/billing/telkomsel/apply-approval",
    [
      authJwt.verifyTokenAdmin,
      (req, res, next) => checkAccessPermission(req, res, next, menu, ['Write'])
    ],
    applyToApproval
  );

  app.get(
    "/api/access/billing/telkomsel",
    [
      authJwt.verifyTokenAdmin,
      (req, res, next) => checkAccessPermission(req, res, next, menu, ['Read'])
    ],
    PeriodeList
  );

  app.get(
    "/api/access/billing/telkomsel/detail",
    [
      authJwt.verifyTokenAdmin,
      (req, res, next) => checkAccessPermission(req, res, next, menu, ['Read'])
    ],
    PeriodeDetail
  );

  app.get(
    "/api/access/billing/telkomsel/master",
    [
      authJwt.verifyTokenAdmin,
      (req, res, next) => checkAccessPermission(req, res, next, menu, ['Read'])
    ],
    MasterList
  );

  app.get(
    "/api/access/billing/telkomsel/master/id",
    [
      authJwt.verifyTokenAdmin,
      (req, res, next) => checkAccessPermission(req, res, next, menu, ['Read'])
    ],
    MasterView
  );

  app.put(
    "/api/access/billing/telkomsel/master",
    [
      authJwt.verifyTokenAdmin,
      (req, res, next) => checkAccessPermission(req, res, next, menu, ['Write'])
    ],
    MasterUpdate
  );

  app.post(
    "/api/access/billing/telkomsel/master",
    [
      authJwt.verifyTokenAdmin,
      (req, res, next) => checkAccessPermission(req, res, next, menu, ['Write'])
    ],
    MasterCreate
  );

  app.post(
    "/api/access/billing/telkomsel/apply",
    [
      authJwt.verifyTokenAdmin,
      (req, res, next) => checkAccessPermission(req, res, next, menu, ['Write'])
    ],
    applyToApproval
  );

};
