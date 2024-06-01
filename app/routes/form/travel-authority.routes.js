
const { createTravelAuthority, HistoryTravelAuthority, ViewTravelAuthority, getPicTA } = require("../../controllers/form/travel-authority/travel.authority.controller");
const authJwt = require("../../middlewares/form/authJwt");

module.exports = function (app) {
  
  app.post(
    "/api/access/ta/create",
    [
      authJwt.verifyToken,
      authJwt.isUser,
      createTravelAuthority
    ],
  );

  app.get(
    "/api/access/ta/print",
    [
      ViewTravelAuthority
    ],
  ); 

  app.get(
    "/api/access/ta/history",
    [
      authJwt.verifyToken,
      authJwt.isUser,
      HistoryTravelAuthority
    ],
  );

  app.get(
    "/api/access/ta/view",
    [
      authJwt.verifyToken,
      authJwt.isUser,
      ViewTravelAuthority
    ],
  );  

  app.get(
    "/api/access/ta/pic",
    [
      authJwt.verifyToken,
      authJwt.isUser,
      getPicTA
    ],
  );  
};
