const db = require("../../models");

const hias = db.hias;

exports.ListHias = async (_, res) => {
    try {
        const projection = 'id_record employee_id information_category reporter_name current_company report_date _id';
        const getList = await hias.find({}, projection);

        res.status(200).json({ code: 200, status: "OK", data: getList });

    } catch (error) {
        await session.endSession();
        logger.error({
            date: new Date(),
            error: error.toString(),
        });
        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }
};

exports.HiasDetail = async (req, res) => {
    try {

        const detail = await hias.findById(req.query.id).populate('attachments');

        res.status(200).json({ code: 200, status: "OK", data: detail });

    } catch (error) {
        await session.endSession();
        logger.error({
            date: new Date(),
            error: error.toString(),
        });
        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }
};
