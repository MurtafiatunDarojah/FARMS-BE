const { getUsers, getApplication, createServiceRequest, historyServiceRequest, viewSR } = require("../../controllers/form/service-request/service.request.controller");
const authJwt = require("../../middlewares/form/authJwt");

module.exports = function (app) {

  app.post(
    "/api/access/sr",
    [
      authJwt.verifyToken,
      authJwt.isUser,
      createServiceRequest
    ],
  )
  app.get(
    "/api/access/sr",
    [
      authJwt.verifyToken,
      authJwt.isUser,
      viewSR
    ],
  )
  app.get(
    "/api/access/sr/users",
    [
      authJwt.verifyToken,
      authJwt.isUser,
      getUsers
    ],
  )
  app.get(
    "/api/access/sr/history",
    [
      authJwt.verifyToken,
      authJwt.isUser,
      historyServiceRequest
    ],
  )
  app.get(
    "/api/access/sr/applications",
    [
      authJwt.verifyToken,
      authJwt.isUser,
      getApplication
    ],
  )

};
