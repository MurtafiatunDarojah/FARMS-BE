const logger = require("../../../app/config/winston");
const db = require("../../models");

const { NotificationCompleteDocToPIC } = require("../../services/notification.service");
const { getWhatsAppLink } = require("../../services/whatsapp.link.service");
const { publish } = require("../../messaging/publisher");
const awsKey = require("../../config/aws-config");
const AWS = require('aws-sdk');

const ApprovalHeader = db.approval_header;
const ApprovalDetail = db.approval_detail;
const TFlight = db.reservation;
const TAUser = db.user_ta;
const TAHeader = db.ta;
const User = db.user;


exports.approvedByDeputy = async (req, res) => {

    // Transaction  
    let session = await db.mongoose.startSession();
    session.startTransaction();

    try {

        const user = await User.findOne({ _id: req.userId }).populate('company').session(session);

        let getApprovalData = await ApprovalHeader.findById(req.body.id_ta)
            .populate('uid')
            .populate('detail')
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

        await Promise.all(getApprovalData.detail.map(async item => {
            if (item.deputy_approver) {
                if (item.deputy_approver === user.nik) {
                    const getNIK = await User.findOne({ _id: item.approved_by }).session(session);
                    return ApprovalDetail.updateOne(
                        { _id: item._id },
                        {
                            $set: {
                                status: true,
                                approved_by: req.userId,
                                updated_by: req.userId,
                                approved_at: new Date(),
                                primary_approver: getNIK.nik
                            }
                        },
                        { session }
                    );
                }
            }
        }));


        await session.commitTransaction();

        let getApprovalDetail = await ApprovalDetail.find({
            approval_id: getApprovalData._id,
            status: false
        });

        // Jika tidak ada detail approval yang belum disetujui
        if (getApprovalDetail.length === 0) {

            await ApprovalHeader.findByIdAndUpdate(getApprovalData._id, {
                status: 'Approved',
                approval_key: new Date().getTime(),
                updated_by: user._id
            });

            let getApprovalDataEdit = { approval_id: getApprovalData }

            // Jika form memiliki PIC (Person In Charge), mengirim notifikasi kepada PIC
            if (getApprovalData.form_id.form_setting.pic) {
                NotificationCompleteDocToPIC(
                    getApprovalData.form_id.code,
                    getApprovalData.form_id.form_setting.pic,
                    getApprovalData.form_id.name,
                    getApprovalDataEdit
                );
            }
        }

        let messageTemplate = "Hallo " + getApprovalData.uid.fullname + " your Travel Authority *has been Approved* by " + user.fullname + ", please kindly check \n \n"
        messageTemplate += getWhatsAppLink(user.company.code) + "sr/view/" + getApprovalData.form_submit_id + "\n";

        publish({
            opt: 'WA',
            number: getApprovalData.uid.phone_number,
            message: messageTemplate
        })

        await session.endSession()

        return res.send({ code: 200, status: "OK" })

    } catch (error) {

        await session.endSession()

        logger.error({
            date: new Date(),
            error: error.toString()
        })

        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }
}

exports.TravelAuthorityList = async (req, res) => {

    try {

        let lists = await TAHeader.find({})
            .select('id_record type_travel created_at updatedAt dispatcher _id')
            .populate({
                path: 'approval_process_id',
                select: 'record_id status uid',
                populate: [{
                    path: 'uid',
                    select: 'fullname'
                },
                {
                    path: 'detail',
                    populate: {
                        path: 'approved_by',
                    }
                },
                ]
            })
            .populate({
                path: 'dispatcher_ta',
            })

        return res.status(200).send({ code: 200, status: "OK", data: lists });

    } catch (error) {

        logger.error({
            date: new Date(),
            error: error.toString()
        })

        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }

};

exports.CompletedDataTravelAuthorityReturn = async (req, res) => {

    // Transaction  
    let session = await db.mongoose.startSession();
    session.startTransaction();

    try {
        const requestData = req.body;

        if (req.files) {

            const uploadFile = req.files.upload_eticket;

            let Flight = await TFlight.findById(requestData.id).session(session);

            let newFlight = new TFlight({
                t_ta_user_dtl_id: Flight.t_ta_user_dtl_id,
                from: Flight.to,
                to: Flight.from,
                ticket_price: requestData.ticket_price,
                flight_id: req.body.flight_id,
                from_date: req.body.from_date,
                airline: Flight.airline,
                type_travel: Flight.type_travel,
                seat_class: Flight.seat_class,
                time: req.body.time,
                author: req.userId,
                updated_by: req.userId,
                user_id: requestData.user_id,
                updatedAt: new Date()
            }, { session })

            newFlight.e_ticket = requestData.id + '.pdf'

            await newFlight.save({ session })

            const s3 = new AWS.S3(awsKey.s3Key);

            const params = {
                Bucket: 'travel-authority',
                Key: newFlight.id + '.pdf',
                Body: uploadFile.data,
                ContentType: 'application/pdf',
            };

            delete params.ContentDisposition;

            const inputDate = new Date(req.body.from_date);
            const day = inputDate.getDate().toString().padStart(2, '0');
            const month = (inputDate.getMonth() + 1).toString().padStart(2, '0');
            const year = inputDate.getFullYear().toString();
            const formattedDate = `${day}-${month}-${year}`;

            let getNewFlight = await TFlight.findById(Flight.id).populate('user_id').session(session);

            s3.upload(params, (err, data) => {
                if (err) {
                    console.log(err, err.stack);
                } else {
                    console.log('File uploaded successfully.', data.Location);

                    let linkETicket = "https://travel-authority.s3.ap-southeast-3.amazonaws.com/" + requestData.id + '.pdf';

                    let messageTemplate = `*Travel Authority* : E-ticket Telah Dikirim!\n\n`;
                    messageTemplate += `Halo *${getNewFlight.user_id.fullname}*. Kami senang memberitahukan bahwa e-ticket yang Anda pesan telah berhasil dikirimkan kepada Anda. Mohon periksa detail di bawah ini:\n\n`;
                    messageTemplate += `Departure Date : ${formattedDate}\n`;
                    messageTemplate += `Departure Time: ${req.body.time}\n`;
                    messageTemplate += `From: ${getNewFlight.from}\n`;
                    messageTemplate += `To: ${getNewFlight.to}\n`;
                    messageTemplate += `Flight ID: ${req.body.flight_id}\n`;
                    messageTemplate += `Airline: ${getNewFlight.airline}\n\n`;
                    messageTemplate += `Untuk mengakses e-ticket Anda, silakan klik tautan di bawah ini:\n\n`;
                    messageTemplate += `${linkETicket}`;

                    publish({
                        opt: 'WA',
                        number: getNewFlight.user_id.phone_number,
                        message: messageTemplate
                    });


                }
            });

            if (uploadFile.mimetype !== 'application/pdf') {
                return res.status(400).send({
                    code: 400,
                    status: 'BAD_REQUEST',
                    error: [{ name: `${uploadFile.name} format file must be PDF` }],
                });
            }

        }

        await session.commitTransaction();
        await session.endSession()

        return res.send({ code: 200, status: 'OK', data: requestData });

    } catch (error) {

        await session.endSession()

        logger.error({
            date: new Date(),
            error: error.toString(),
        });

        return res.status(500).send({
            code: 500,
            status: 'INTERNAL_SERVER_ERROR',
            error: [{ name: error.toString() }],
        });
    }
}

exports.CompletedDataTravelAuthority = async (req, res) => {
    try {
        const requestData = req.body;
        if (req.files) {

            const uploadFile = req.files.upload_eticket;

            let Flight = await TFlight.findByIdAndUpdate(requestData.id, {
                e_ticket: requestData.id + '.pdf',
                ticket_price: requestData.ticket_price,
                flight_id: req.body.flight_id,
                from_date: req.body.from_date,
                time: req.body.time,
                author: req.userId,
                updated_by: req.userId,
                updatedAt: new Date()
            })
                .populate('user_id');


            const s3 = new AWS.S3(awsKey.s3Key);

            const params = {
                Bucket: 'travel-authority',
                Key: requestData.id + '.pdf',
                Body: uploadFile.data,
                ContentType: 'application/pdf',
            };

            delete params.ContentDisposition;

            const inputDate = new Date(req.body.from_date);
            const day = inputDate.getDate().toString().padStart(2, '0');
            const month = (inputDate.getMonth() + 1).toString().padStart(2, '0');
            const year = inputDate.getFullYear().toString();
            const formattedDate = `${day}-${month}-${year}`;

            s3.upload(params, (err, data) => {

                if (err) {
                    console.log(err, err.stack);
                } else {
                    console.log('File uploaded successfully.', data.Location);

                    let linkETicket = "https://travel-authority.s3.ap-southeast-3.amazonaws.com/" + requestData.id + '.pdf';

                    let messageTemplate = `*Travel Authority* : E-ticket Telah Dikirim!\n\n`;
                    messageTemplate += `Halo *${Flight.user_id.fullname}*. Kami senang memberitahukan bahwa e-ticket yang Anda pesan telah berhasil dikirimkan kepada Anda. Mohon periksa detail di bawah ini:\n\n`;
                    messageTemplate += `Departure Date : ${formattedDate}\n`;
                    messageTemplate += `Departure Time: ${req.body.time}\n`;
                    messageTemplate += `From: ${Flight.from}\n`;
                    messageTemplate += `To: ${Flight.to}\n`;
                    messageTemplate += `Flight ID: ${req.body.flight_id}\n`;
                    messageTemplate += `Airline: ${Flight.airline}\n\n`;
                    messageTemplate += `Untuk mengakses e-ticket Anda, silakan klik tautan di bawah ini:\n\n`;
                    messageTemplate += `${linkETicket}`;

                    publish({
                        opt: 'WA',
                        number: Flight.user_id.phone_number,
                        message: messageTemplate
                    });


                }
            });

            if (uploadFile.mimetype !== 'application/pdf') {
                return res.status(400).send({
                    code: 400,
                    status: 'BAD_REQUEST',
                    error: [{ name: `${uploadFile.name} format file must be PDF` }],
                });
            }

        } else {

            await TFlight.findByIdAndUpdate(requestData.id, {
                ticket_price: requestData.ticket_price,
                flight_id: req.body.flight_id,
                from_date: req.body.from_date,
                time: req.body.time,
                author: req.userId,
                updated_by: req.userId,
                updatedAt: new Date()
            })
                .populate('user_id');

        }


        return res.send({ code: 200, status: 'OK', data: requestData });

    } catch (error) {
        logger.error({
            date: new Date(),
            error: error.toString(),
        });

        return res.status(500).send({
            code: 500,
            status: 'INTERNAL_SERVER_ERROR',
            error: [{ name: error.toString() }],
        });
    }
};

exports.ClosedTravelAuthority = async (req, res) => {

    // Transaction  
    let session = await db.mongoose.startSession();
    session.startTransaction();

    try {

        const user = await User.findOne({ _id: req.userId }).session(session);

        await ApprovalHeader.findByIdAndUpdate(req.body.approval_id, { status: 'Closed', updated_by: user._id })
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


        await session.commitTransaction();
        await session.endSession()

        return res.send({ code: 200, status: "OK" })

    } catch (error) {

        await session.endSession()

        logger.error({
            date: new Date(),
            error: error.toString()
        })

        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }

};

exports.AddDepartureDate = async (req, res) => {

    // Transaction  
    let session = await db.mongoose.startSession();
    session.startTransaction();

    try {

        await TAUser.findByIdAndUpdate(req.body.id, {
            departure_date_end: req.body.departure_date_end,
            updated_remarks: req.body.updated_remarks,
            updated_by: req.userId,
            updated_at: new Date().toISOString()
        })
            .session(session);

        await session.commitTransaction();
        await session.endSession()

        return res.send({ code: 200, status: "OK" })

    } catch (error) {

        await session.endSession()

        logger.error({
            date: new Date(),
            error: error.toString()
        })

        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }

}   