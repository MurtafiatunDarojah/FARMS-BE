const { Quotes } = require("../../controllers/integration/brms-stock.controller");

module.exports = function (app) {
    app.get(
        "/api/integration/stock",
        [
            Quotes
        ],
    );
};
