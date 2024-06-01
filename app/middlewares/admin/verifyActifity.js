const db = require("../../models");
let log = require('../../config/winston');

const approval_detail = db.approval_detail;

exports.isEmptyApprovalDetail = async (req, res, next) => {

    try {
        if (req.body.approval_id_detail) {

            let approval_detail_data = await approval_detail.findById(
                req.body.approval_id_detail
            );

            if (!approval_detail_data) {
                res.status(404).send({
                    message: `Failed! approval detail ${req.body.approval_id_detail} not found`,
                });
                return;
            }

            next();
        } else {
            return res.status(400).send({
                message: `approval_detail_id required! `,
            });
        }
    } catch (error) {

        log.error({
            date: new Date(),
            error: error.toString()
        })

        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }
};

exports.checkStatusApprovalList = (req, res, next) => {
    approval_detail.findById(req.body.approval_id_detail, "approval_id status")
        .populate("approval_id")
        .exec((err, data) => {

            if (err) {

                log.error({
                    date: new Date(),
                    error: err.toString()
                })

                res.status(500).send({ message: err });
                return;
            }

            // if status already approved by supervisor
            if (data.status) {

                res.status(500).send({
                    message:
                        "Sorry Failed, this is already approved by direct supervisor"
                });
                return;
            }

            if (data.approval_id.status === "Waiting Approval" || data.approval_id.status === "Reject") {

                next();

            } else {
                return res.status(500).send({
                    message:
                        "Sorry Failed, approval is status " +
                        data.approval_id.status,
                });
            }
        });
};
