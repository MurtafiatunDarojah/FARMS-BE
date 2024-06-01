
const { NotificationCompleteDocToPIC } = require("../../services/notification.service");
const { publish } = require("../../messaging/publisher");
const logger = require("../../../app/config/winston");
let log = require('../../config/winston');
const db = require("../../models");

const TServiceRequest = db.it_service_request;
const ApprovalHeader = db.approval_header;
const ApprovalDetail = db.approval_detail;
const User = db.user;

exports.ServiceRequestList = async (req, res) => {

    try {

        let getTServiceRequest = await TServiceRequest.find({}, 'type_request approval_process_id created_at uid form_record fullname')
            .populate({
                path: 'approval_process_id',
                select: 'status',
                populate: {
                    path: 'detail',
                    populate: {
                        path: 'approved_by',
                    }
                },
            })
            .populate({
                path: 'uid',
                populate: {
                    path: 'company'
                }
            })
            .sort({ created_at: -1 })

        return res.status(200).send({ code: 200, status: "OK", data: getTServiceRequest });

    } catch (error) {

        logger.error({
            date: new Date(),
            error: error.toString()
        })

        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }

};

exports.ClosedServiceRequest = async (req, res) => {
    // Transaction  
    let session = await db.mongoose.startSession();
    session.startTransaction();

    try {

        const user = await User.findOne({ _id: req.userId }).session(session);


        const approval_header_obj = await ApprovalHeader.findByIdAndUpdate(req.body.approval_id, { status: 'Closed', updated_by: user._id })
            .populate('uid')
            .populate({
                path: 'form_id',
                populate: {
                    path: 'form_setting',
                    populate: {
                        path: 'pic',
                    }
                },
            })
            .session(session)

        let user_request = approval_header_obj.uid;
        let pic = approval_header_obj.form_id.form_setting.pic[0]

        let messageTemplate = "Hallo " + user_request.fullname + " \n\nyour *Service Request* has been *closed* you can get updated information. please contact directly regarding the update\n \n"
        messageTemplate += "PIC : *" + pic.fullname + "* \n \n";
        messageTemplate += "Phone / WA : *" + pic.phone_number + "* \n \n";
        messageTemplate += "Thankyou";

        publish({
            opt: 'WA',
            number: user_request.phone_number,
            message: messageTemplate
        })

        await session.commitTransaction();
        await session.endSession()

        return res.send({ code: 200, status: "OK" })

    } catch (error) {

        await session.abortTransaction();
        await session.endSession()

        log.error({
            date: new Date(),
            error: error.toString()
        })

        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }

};

exports.ApprovedByIT = async (req, res) => {

    // Transaction  
    let session = await db.mongoose.startSession();
    session.startTransaction();

    try {

        const appIds = req.body.app_id;

        const updatePromises = appIds.map(async item => {
            return ApprovalDetail.updateOne(
                { _id: item.id },
                {
                    status: true,
                    approved_by: req.userId,
                    updated_by: req.userId,
                    approved_at: new Date(),
                    primary_approver: item.nik
                },
                { session }
            );
        });

        await Promise.all(updatePromises);

        const updatedDocuments = await ApprovalDetail.find({ approval_id: req.body.header_id, status: false }).session(session);

        const SendNotification = await ApprovalDetail.find({ approval_id: req.body.header_id, status: true, _id: { $in: appIds.map(a => a.id) } })
            .populate({
                path: 'approval_id',
                populate: {
                    path: 'uid',
                },
            })
            .session(session);

        SendNotification.forEach(data => {

            let messageTemplate = "Hallo " + data.approval_id.uid.fullname + " your service request *has been Approved* by " + req.fullname + ", please kindly check \n \n"

            publish({
                opt: 'WA',
                number: data.approval_id.uid.phone_number,
                message: messageTemplate
            })
        })

        if (updatedDocuments.length === 0) {
            let resposes = await ApprovalHeader.findByIdAndUpdate(req.body.header_id,
                // Approved Header
                {
                    status: 'Approved',
                    approval_key: new Date().getTime(),
                    updated_by: req.userId
                })
                .populate({
                    path: 'form_id',
                    populate: {
                        path: 'form_setting',
                        populate: {
                            path: 'pic',
                        }
                    },
                })
                .session(session)

            await NotificationCompleteDocToPIC(
                'SR',
                resposes.form_id.form_setting.pic,
                resposes.form_id.name,
                {approval_id: resposes}
            );
        }


        await session.commitTransaction();
        await session.endSession()

        return res.send({ code: 200, status: "OK" })

    } catch (error) {

        await session.abortTransaction();
        await session.endSession()

        log.error({
            date: new Date(),
            error: error.toString()
        })

        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }
}