const authJwt = require("../../middlewares/admin/authJwt");
const { TravelAuthorityList, CompletedDataTravelAuthority, ClosedTravelAuthority, AddDepartureDate, approvedByDeputy, CompletedDataTravelAuthorityReturn } = require("../../controllers/admin/travel.authority.controller");
const { ViewTravelAuthority } = require("../../controllers/form/travel-authority/travel.authority.controller");
const { checkAccessPermission } = require("../../middlewares/admin/authJwt");

module.exports = function (app) {

    let menu = 'TA'

    app.get('/api/dashboard/travel-authority', [
        authJwt.verifyTokenAdmin,
        (req, res, next) => checkAccessPermission(req, res, next, menu, ['Read'])
    ], TravelAuthorityList)

    app.get('/api/dashboard/travel-authority/view', [
        authJwt.verifyTokenAdmin,
        (req, res, next) => checkAccessPermission(req, res, next, menu, ['Read'])
    ], ViewTravelAuthority)

    app.post('/api/dashboard/travel-authority/complete-data', [
        authJwt.verifyTokenAdmin,
        (req, res, next) => checkAccessPermission(req, res, next, menu, ['Write'])
    ], CompletedDataTravelAuthority)

    app.post('/api/dashboard/travel-authority/closed', [
        authJwt.verifyTokenAdmin,
        (req, res, next) => checkAccessPermission(req, res, next, menu, ['Write'])
    ], ClosedTravelAuthority)

    app.put('/api/dashboard/travel-authority/add-departure', [
        authJwt.verifyTokenAdmin,
        (req, res, next) => checkAccessPermission(req, res, next, menu, ['Write']),
        authJwt.isHRGA
    ], AddDepartureDate)

    app.post('/api/dashboard/travel-authority/approved-deputy', [
        authJwt.verifyTokenAdmin,
        (req, res, next) => checkAccessPermission(req, res, next, menu, ['Write']),
    ],  approvedByDeputy)

    app.post('/api/dashboard/travel-authority/complete-data-return', [
        authJwt.verifyTokenAdmin,
        (req, res, next) => checkAccessPermission(req, res, next, menu, ['Write'])
    ], CompletedDataTravelAuthorityReturn)
    
};
