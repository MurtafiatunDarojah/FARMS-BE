const { ListHias, HiasDetail } = require("../../controllers/admin/hias.controller");
const { checkAccessPermission, verifyTokenAdmin } = require("../../middlewares/admin/authJwt");

module.exports = function (app) {

    let menu = 'HS'

    app.get(
        "/api/access/hias/list",
        [
            verifyTokenAdmin,
            (req, res, next) => checkAccessPermission(req, res, next, menu, ['Read'])
        ],
        ListHias
    )
    app.get(
        "/api/access/hias/detail",
        [
            verifyTokenAdmin,
            (req, res, next) => checkAccessPermission(req, res, next, menu, ['Read'])
        ],
        HiasDetail
    )
};
