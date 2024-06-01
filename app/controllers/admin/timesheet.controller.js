const moment = require("moment");
const db = require("../../models");

const user = db.user;
const approval_header = db.approval_header;
const approval_detail = db.approval_detail;
const timesheet_header = db.timesheet_header;
const timesheet_detail = db.timesheet_detail;
const Comment = db.comment;

let log = require('../../config/winston');
const { publish } = require("../../messaging/publisher");

exports.listTimesheet = async (request, res) => {

    try {

        let data_transfer_object = []

        // Default is current month period
        let dateStart = request.query.dateFrom || moment(new Date()).format('YYYY-MM')

        let getUser = await user.find({
            company: request.query.company_id,
            active: true
        },
            '_id nik fullname phone_number email department direct_spv level')
            .populate('direct_spv', 'fullname')
            .populate('department', 'fullname code')
            .populate('level', 'fullname')

        for (const item of getUser) {

            //Check is user already create timesheet at periode  
            let getPeriod = await timesheet_header
                .find(
                    {
                        uid: item._id,
                        date_from: { $regex: '^' + dateStart.slice(0, 7) },
                    },
                    'form_submit_id year date_from date_from day_count total_work total_site total_sick total_leave total_home_base total_permit'
                )
                .populate('approval_process_id', 'status', null, { sort: { created_at: 1 } })

            let dto = {
                _id: null,
                form_submit_id: null,
                year: null,
                date_from: null,
                day_count: null,
                total_work: null,
                total_site: null,
                total_sick: null,
                total_leave: null,
                total_permit: null,
                total_home_base: null,
                approval_process_id: {
                    status: false
                }
            }

            let data = {
                _id: item._id,
                nik: item.nik,
                fullname: item.fullname,
                phone_number: item.phone_number,
                email: item.email,
                department: item.department,
                direct_spv: item.direct_spv,
                level: item.level,
                // check if already fill timesheet or not & get last submit timesheet (latest submit on month)
                timesheet: getPeriod.length === 0 ? dto : getPeriod.pop()
            }

            data_transfer_object.push(data)
        }


        return res.status(200).send({ code: 200, status: "OK", data: data_transfer_object });
    } catch (error) {

        log.error({
            date: new Date(),
            error: error.toString()
        })

        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }
}

exports.FormApproved = async (req, res) => {

    // Transaction  
    let session = await db.mongoose.startSession();
    session.startTransaction();

    try {

        let getApprovalHeader = await approval_detail.findByIdAndUpdate(req.body.approval_id_detail,
            // Approved Detail
            {
                status: true,
                approved_by: req.userId,
                updated_by: req.userId,
                approved_at: new Date()
            }
        )
            .populate({
                path: 'approval_id',
                populate: {
                    path: 'uid',
                },
            })
            .session(session)
            .exec();


        await approval_header.findByIdAndUpdate(getApprovalHeader.approval_id._id,
            // Approved Header
            // Default approved by direct supervisor, because is HRGA, approved replace by HRGA 
            {
                status: 'Approved',
                approval_key: new Date().getTime(),
                updated_by: req.userId
            })

        await session.commitTransaction();
        await session.endSession()

        const getId = getApprovalHeader.id_form_master ? getApprovalHeader.id_form_master : getApprovalHeader.approval_id.id_form_header

        let messageTemplate = "Hallo " + getApprovalHeader.approval_id.uid.fullname + " your timesheet *has been Approved* by HRGA, please kindly check"

        publish({
            opt: 'WA',
            number: getApprovalHeader.approval_id.uid.phone_number,
            message: messageTemplate
        })

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

exports.FormReject = async (req, res) => {

    // Transaction  
    let session = await db.mongoose.startSession();
    session.startTransaction();

    try {

        let getApprovalHeader = await approval_detail.findById(req.body.approval_id_detail)
            .populate({
                path: 'approval_id',
                populate: {
                    path: 'uid',
                },
            })
            .session(session)
            .exec();

        let getHeaderApproval = await approval_header.findById(getApprovalHeader.approval_id._id).session(session)

        getHeaderApproval.status = "Reject";

        getHeaderApproval.updated_by = req.userId;
        getHeaderApproval.created_by = req.userId;

        // Default approved by direct supervisor, because is HRGA, approved replace by HRGA 
        getHeaderApproval.approver = req.userId;

        let comment = new Comment({
            uid: req.userId,
            form_submit_id: getApprovalHeader.approval_id.form_submit_id,
            text_plain: req.body.msg,
            updated_by: req.userId,
            created_by: req.userId
        })

        await getHeaderApproval.save({ session })
        await comment.save({ session })

        await session.commitTransaction();
        await session.endSession()

        let messageTemplate = "Hallo " + getApprovalHeader.approval_id.uid.fullname + " your timesheet is *Not Approved* by HRGA, please check again your timesheet \n \n"
        messageTemplate += " HRGA : " + req.body.msg;

        publish({
            opt: 'WA',
            number: getApprovalHeader.approval_id.uid.phone_number,
            message: messageTemplate
        })

        return res.send({ code: 200, status: "OK" })

    } catch (error) {

        await session.abortTransaction();
        await session.endSession()

        log.error({
            date: new Date(),
            error: error
        })

        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }
}

exports.updatedTS = async (req, res) => {
    try {
        let form_id = req.body.form_id

        let getMasterTS = await timesheet_header.findOne({
            form_submit_id: form_id
        }).exec()

        getMasterTS.day_count = req.body.day_count
        getMasterTS.total_leave = req.body.total_leave
        getMasterTS.total_sick = req.body.total_sick
        getMasterTS.total_site = req.body.total_site
        getMasterTS.total_work = req.body.total_work
        getMasterTS.total_home_base = req.body.total_home_base
        getMasterTS.updated_by = req.userId
        getMasterTS.updated_at = new Date()

        await getMasterTS.save();

        // Save Time Sheet Detail
        await timesheet_detail.deleteMany({ form_submit_id: form_id })
        await timesheet_detail.insertMany(req.body.ttimesheetdetails)

        return res.send({ code: 200, status: "OK" })


    } catch (error) {

        log.error({
            date: new Date(),
            error: error.toString()
        })

        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }
}

exports.getAllTSInRange = async (req, res) => {

    try {
        const getListTSmaster = await timesheet_header.find({
            ts_date: { $gte: req.query.date_from, $lte: req.query.date_to }
        })
            .populate({
                path: 'details',
                options: { sort: { ts_date_dtl: 1 } },
            })
            .populate({
                path: 'details_old',
                options: { sort: { ts_date_dtl: 1 } },
            })
            .populate('comments')
            .populate({
                path: 'uid',
                select: 'direct_spv fullname email company phone_number',
                model: user,
                populate: {
                    path: 'company',
                    select: 'fullname code',
                },
            })
            .populate({
                path: 'approval_process',
                select: 'status approval_key',
                model: approval_header,
                populate: {
                    path: 'detail',
                    populate: {
                        path: 'approved_by',
                    },
                },
            })
            .populate({
                path: 'uid',
                select: 'direct_spv fullname email company phone_number',
                model: user,
                populate: {
                    path: 'direct_spv',
                    select: 'fullname',
                },
            });

        // Filter data dengan status "Approved"
        const approvedListTSmaster = getListTSmaster.filter(item => item.approval_process.status === 'Approved');

        return res.send({ code: 200, status: 'OK', data: approvedListTSmaster });

    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Internal server error' });
    }
};
