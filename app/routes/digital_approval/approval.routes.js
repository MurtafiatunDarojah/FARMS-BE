const authJwt = require("../../middlewares/digital_approval/authJwt");
const verifyActivity = require("../../middlewares/digital_approval/verifyActivity");

const activity = require("../../controllers/digital_approval/approval.controller");
const controller_auth = require("../../controllers/form/auth/auth.controller");

module.exports = function (app) {

  // Authentication 365 check token
  app.post("/api/access/signin", controller_auth.tokenCheck365);

  // Get List Approval Pending (by Supervisor)
  app.get(
    "/api/access/approval/list/pending",
    [
      authJwt.verifyToken,
      authJwt.isUser
    ],
    activity.getPendingList
  );

  // Approved official api
  app.get(
    "/api/access/approval/approvedof",
    activity.ApprovedOfficial
  );

  app.post(
    "/api/access/approval/list/approve",
    [
      authJwt.verifyToken,
      authJwt.isUser,
      // verifyActivity.checkExecutorApprovedAuthorization,
      verifyActivity.checkStatusApprovalList,
    ],
    [
      activity.ApprovedForm
    ]
  );

  app.post(
    "/api/access/approval/list/reject",
    [
      authJwt.verifyToken,
      authJwt.isUser,
      // verifyActivity.checkExecutorApprovedAuthorization,
      verifyActivity.checkStatusApprovalList,
    ],
    [
      activity.RejectForm
    ]
  );

  app.post(
    "/api/access/approval/list/cancel",
    [
      authJwt.verifyToken,
      authJwt.isUser,
    ],
    [
      activity.CancelForm
    ]
  );

  app.post(
    "/api/access/auth/verification",
    [
      authJwt.verifyToken,
      authJwt.isUser,
    ],
    [
      controller_auth.phoneNumberVerification
    ]
  );

  app.post(
    "/api/access/auth/completed-user",
    [
      authJwt.verifyToken,
    ],
    [
      controller_auth.completeEmailUser
    ]
  );


};
