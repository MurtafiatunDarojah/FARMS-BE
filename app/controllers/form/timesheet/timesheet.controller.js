const moment = require("moment");

const db = require("../../../models");
let log = require('../../../config/winston');

const { publish } = require("../../../messaging/publisher");
const { getRecordId } = require("../../../services/record.id.service");
const { getWhatsAppLink } = require("../../../services/whatsapp.link.service");

const ApprovalDetail = db.approval_detail;
const ApprovalHeader = db.approval_header;
const TimesheetHeader = db.timesheet_header;
const TimesheetDetail = db.timesheet_detail;
const FormApproval = db.form_approval;
const Form = db.form;
const User = db.user;

exports.createTimeSheet = async (request, res) => {

    // Transaction  
    let session = await db.mongoose.startSession();
    session.startTransaction();

    try {

        let req = request.body;

        let getUser = await User.findOne({
            email: req.email,
        }).populate('direct_spv')
            .populate('company')
            .session(session);

        const formIdRecord = await getRecordId(TimesheetHeader, 'FRM', getUser.company.business_entity , 'HRGA', 'TS');

           // 1. and then get form setting base on Unit, join to form approval doc
           const getForm = await Form.findOne({ code: 'TS' })
           .populate({
               path: 'form_setting',
               populate: {
                   path: 'approved_by',
               },
           })
           .session(session).exec()

       const getFormSetting = await FormApproval.findOne({ Forms: "629486c3d31d791048fc92fa", company_by: getUser.company._id })

        if (!getUser.direct_spv) {
            return res.status(500).send({
                message: `Failed! something wrong, ensure direct supervisor already declare`,
            });
        }

        if (!getFormSetting) {
            return res.status(500).send({
                message: `Failed! something wrong, form approval setting not declare to doc form`,
            });
        }

        // header
        let approval_header = new ApprovalHeader({
            form_id: getForm._id, //mform -> id
            form_submit_id: formIdRecord, //document code
            uid: getUser._id, //foreign key to muser
            updated_by: getUser._id,
            created_by: getUser._id,
        });

        // Detail
        let approval_detail = new ApprovalDetail({
            approval_id: approval_header._id, // foreign key approval master (tapprovals_master)
            approved_by: String(getUser.direct_spv[0]._id), //foreign key to muser
            status: false,
            updated_by: getUser._id,
            created_by: getUser._id,
        });

        // Save Time Sheet header
        let timesheet_header = new TimesheetHeader({
            approval_process_id: approval_header._id,  // foreign key approval master (tapprovals_master)
            form_submit_id: formIdRecord,
            year: req.year,
            date_from: req.date_from,
            date_to: req.date_to,
            day_count: req.day_count,
            total_work: req.total_work,
            total_site: req.total_site,
            total_sick: req.total_sick,
            total_leave: req.total_leave,
            total_permit: req.total_permit,
            total_home_base: req.total_home_base,
            uid: getUser._id,
            updated_by: getUser._id,
            created_by: getUser._id,
        });
    
        // old time must save id form header for show the document pending approvals. 
        // for now no need becouse mistake technical
        approval_header.id_form_header = timesheet_header._id

        let DTO = [];

        // Save Timesheet detail
        req.ttimesheetdetails.forEach(i => {
            DTO.push({
                ts_header_id: timesheet_header._id, //foreign key id ts header
                ts_row_id_dtl: i.ts_row_id_dtl,
                ts_date_dtl: i.ts_date_dtl,
                ts_loc_dtl: i.ts_loc_dtl,
                ts_reason_dtl: i.ts_reason_dtl,
                ts_note_dtl: i.ts_note_dtl,
                updated_by: getUser._id,
                created_by: getUser._id,
            })
        });

        // Save Time Sheet Header
        await timesheet_header.save({ session });

        // Save Time Sheet Detail
        await TimesheetDetail.insertMany(DTO, { session })

        // Save Approval & send approval lists
        await approval_header.save({ session });
        await approval_detail.save({ session });

        //Decline notification to level Director
        if (String(getUser.direct_spv[0].level) !== '62f8bfb1af1707bb6c80e917') {

            let messageTemplate = "Hallo " + String(getUser.direct_spv[0].fullname) + " you have pending approval, please kindly check \n \n"
            messageTemplate += "Owned : *" + getUser.fullname + "* \n \n";
            messageTemplate += "Document Name : *Timesheet* \n \n";
            messageTemplate += "Period : *" + moment(req.date_from).format("MMMM YYYY") + "* - *" + moment(req.date_to).format("MMMM YYYY") + "* \n \n";
            messageTemplate += getWhatsAppLink(getUser.company.code) + "wf/ts/view/" + timesheet_header._id + "\n";

            if (getUser.direct_spv[0].phone_number) {
                publish({
                    opt: 'WA',
                    number: getUser.direct_spv[0].phone_number,
                    message: messageTemplate
                })
            } else {

                let messageTemplate = "Hallo " + getUser.fullname + " you can share link to your superior for approval document \n \n"
                messageTemplate += "Document Name : *Timesheet* \n \n";
                messageTemplate += "Period : *" + moment(req.date_from).format("MMMM YYYY") + "* - *" + moment(req.date_to).format("MMMM YYYY") + "* \n \n";
                messageTemplate += getWhatsAppLink(getUser.company.code) + "wf/ts/view/" + timesheet_header._id + "\n";

                publish({
                    opt: 'WA',
                    number: getUser.phone_number,
                    message: messageTemplate
                })
            }
        } else {

            let messageTemplate = "Hallo " + getUser.fullname + " you can share link to your superior for approval document \n \n"
            messageTemplate += "Document Name : *Timesheet* \n \n";
            messageTemplate += "Period : *" + moment(req.date_from).format("MMMM YYYY") + "* - *" + moment(req.date_to).format("MMMM YYYY") + "* \n \n";
            messageTemplate += getWhatsAppLink(getUser.company.code)     + "wf/ts/view/" + timesheet_header._id + "\n";

            publish({
                opt: 'WA',
                number: getUser.phone_number,
                message: messageTemplate
            })

        }

        await session.commitTransaction();
        await session.endSession()

        return res.send({ code: 200, status: "OK" })
        

    } catch (error) {

        await session.abortTransaction();
        await session.endSession();

        log.error({
            date: new Date(),
            error: error.toString()
        })

        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }

};

exports.historyTimesheet = async (req, res) => {

    try {

        let data = req.body.email || req.query.email

        let getUser = await User.findOne({
            email: data,
        });

        let getListTSmaster = await TimesheetHeader.find({
            uid: getUser._id
        }, '-created_by -updated_by -updatedAt')
            .populate('approval_process', 'status')
            .populate('uid', 'direct_spv fullname')
            .sort({ date_to: -1 })

        return res.send(getListTSmaster)

    } catch (error) {

        log.error({
            date: new Date(),
            error: error.toString()
        })

        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }
};

exports.viewTs = async (req, res) => {

    let ObjectId = require('mongoose').Types.ObjectId;

    if (!ObjectId.isValid(req.query._id)) {
        return res.status(401).send({ message: "Id is invalid must object id." });
    }

    let getListTSmaster = await TimesheetHeader.findById(req.query._id)
        // Join to Timesheet header => Timesheet Details
        .populate({
            path: 'details',
            options: { sort: { 'ts_date_dtl': 1 } }
        })
        .populate({
            path: 'details_old',
            options: { sort: { 'ts_date_dtl': 1 } }
        })
        // Join Comments
        .populate('comments')
        // Join to UID (LOCAL) => User => Company
        .populate({
            path: 'uid',
            select: 'direct_spv fullname email company phone_number',
            model: User,
            populate: {
                path: 'company',
                select: "fullname code"
            },
        })
        // Deep Populate approval process id => tapproval header => tapproval details
        .populate({
            path: 'approval_process',
            select: 'status approval_key',
            populate: {
                path: 'detail',
                populate: {
                    path: 'approved_by',
                    model: User
                }
            },
        })
        // Deep Populate UID => direct supervisor -> user
        .populate({
            path: 'uid',
            select: 'direct_spv fullname email company phone_number',
            model: User,
            populate: {
                path: 'direct_spv',
                model: User,
                select: "fullname"
            },
        })

    return res.send({ code: 200, status: "OK", data: getListTSmaster })
};
