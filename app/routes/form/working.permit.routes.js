const { WorkingPermitItems, CreateWorkingPermit, WorkingPermitHistory, WorkingPermitView, EndTaskWorking, ValidationWorkingPermitView, EditWorkingPermit, APDItems, WorkingPermitHistoryMonitor, getResponsibleArea } = require("../../controllers/form/working-permit/working.permit.controller");
const { CreateValidationPermit } = require("../../controllers/form/working-permit/validation/validation-working-permit.controller");

const authJwt = require("../../middlewares/form/authJwt");

module.exports = function (app) {

  app.get(
    "/api/access/wp/items",
    [
      authJwt.verifyToken,
      authJwt.isUser,
      WorkingPermitItems
    ],
  );

  app.post(
    "/api/access/wp/create",
    [
      authJwt.verifyToken,
      authJwt.isUser,
      CreateWorkingPermit
    ],
  );

  app.post(
    "/api/access/wp/end",
    [
      authJwt.verifyToken,
      authJwt.isUser,
      EndTaskWorking
    ],
  );

  app.get(
    "/api/access/wp/history",
    [
      authJwt.verifyToken,
      authJwt.isUser,
      WorkingPermitHistory
    ],
  );

  app.get(
    "/api/access/wp/history/monitor",
    [
      authJwt.verifyToken,
      authJwt.isUser,
      WorkingPermitHistoryMonitor
    ],
  );

  app.get(
    "/api/access/wp/view",
    [
      authJwt.verifyToken,
      authJwt.isUser,
      WorkingPermitView
    ],
  );

  app.get(
    "/api/access/vwp/view",
    [
      authJwt.verifyToken,
      authJwt.isUser,
      ValidationWorkingPermitView
    ],
  );

  app.post(
    "/api/access/vwp/create",
    [
      authJwt.verifyToken,
      authJwt.isUser,
      CreateValidationPermit,
    ]
  );

  app.post(
    "/api/access/wp/edit",
    [
      authJwt.verifyToken,
      authJwt.isUser,
      EditWorkingPermit,
    ]
  );

  app.get(
    "/api/access/wp/apd",
    [
      authJwt.verifyToken,
      authJwt.isUser,
      APDItems,
    ]
  );

  app.get(
    "/api/access/wp/responsible-area",
    [
      authJwt.verifyToken,
      authJwt.isUser,
      getResponsibleArea,
    ]
  );

};
