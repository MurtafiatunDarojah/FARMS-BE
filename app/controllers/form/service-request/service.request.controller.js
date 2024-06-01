const { getRecordId } = require("../../../services/record.id.service");
const db = require("../../../models");

const tservice_request = db.it_service_request
const approval_header = db.approval_header;
const approval_detail = db.approval_detail;
const form_approval = db.form_approval;
const applications = db.application;
const form = db.form;
const user = db.user;

const { getWhatsAppLink } = require("../../../services/whatsapp.link.service");
const { publish } = require("../../../messaging/publisher");
const logger = require("../../../config/winston");

exports.getUsers = async (req, res) => {
    try {

        const users = await user.find({})
            .populate({
                path: 'direct_spv',
                populate: {
                    path: 'level'
                }
            })
            .populate({
                path: 'department',
                populate: {
                    path: 'division_by'
                }
            })
            .populate('company')
            .populate('level');


        return res.send(users)

    } catch (error) {

        logger.error({
            date: new Date(),
            error: error.toString()
        })

        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }
};

exports.historyServiceRequest = async (req, res) => {

    try {

        let data = req.body.email || req.query.email

        let getUser = await user.findOne({
            email: data,
        });

        let getTServiceRequest = await tservice_request.find({
            uid: getUser._id
        }, '-updated_by -updatedAt')
            .populate('approval_process_id', 'status')
            .populate('uid', 'direct_spv fullname')
            .sort({ created_at: -1 })

        return res.send(getTServiceRequest)

    } catch (error) {

        logger.error({
            date: new Date(),
            error: error.toString()
        })

        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }
};

exports.getApplication = async (req, res) => {
    try {
        let applications_res = await applications.find({}, 'app_id name')

        return res.send(applications_res)
    } catch (error) {

        logger.error({
            date: new Date(),
            error: error.toString()
        })

        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }
}

exports.viewSR = async (req, res) => {

    let getSRDetail = await tservice_request.findOne({ form_record: req.query._id })
        // Join to UID (LOCAL) => User => Company
        .populate({
            path: 'uid',
            select: 'direct_spv fullname email company phone_number',
            populate: {
                path: 'company',
                select: "fullname code employee_status"
            },
        })
        // Deep Populate approval process id => tapproval header => tapproval details
        .populate({
            path: 'approval_process_id',
            select: 'status approval_key',
            model: approval_header,
            populate: {
                path: 'detail',
                model: approval_detail,
                populate: {
                    path: 'approved_by',
                }
            },
        })
        // Deep Populate UID => direct supervisor -> user
        .populate({
            path: 'uid',
            select: 'direct_spv fullname email company phone_number',
            populate: {
                path: 'direct_spv',
                select: "fullname"
            },
        })
        // Join Comments
        .populate('comments')

    return res.send({ code: 200, status: "OK", data: getSRDetail })
};

exports.createServiceRequest = async (req, res) => {

    // Transaction  
    let session = await db.mongoose.startSession();
    session.startTransaction();

    try {

        let getUser = await user.findOne({
            email: req.body.email,
        }).populate('direct_spv')
            .populate('company')
            .session(session);

        const formIdRecord = await getRecordId(tservice_request, 'FRM', getUser.company.business_entity, 'ICT', 'SR');

        // 1. and then get form setting base on Unit, join to form approval doc
        const getForm = await form.findOne({ code: 'SR' })
            .populate({
                path: 'form_setting',
                populate: {
                    path: 'approved_by',
                },
            })
            .session(session).exec()

        const getFormSetting = await form_approval.findOne({ Forms: "63b7a487b8404433017f4e17", company_by: getUser.company._id })
            .populate('approved_by')

        let approved_stack;

        if (!getUser.direct_spv[0]) {
            approved_stack = [getFormSetting.approved_by[0]];
        
        } else {
            approved_stack = [getUser.direct_spv[0], getFormSetting.approved_by[0]];
        }

        if (req.body.equipment_details && getUser.company.code === 'CPM') {

            //CFO Charles
            let getCFO = await user.findOne({ nik: "10186" }).populate('direct_spv')
                .populate('company')
                .session(session);

            approved_stack.push(getCFO)
        }

        // header   
        let approval_header_obj = new approval_header({
            form_id: getForm._id, //mform -> id 
            form_submit_id: formIdRecord, //document code
            uid: getUser._id, //foreign key to muser
            updated_by: getUser._id,
            created_by: getUser._id,
        });

        // 3. generate Approval Detail
        let DTO = []
        
        approved_stack.forEach(i => {
            // Detail
            let approval_details = new approval_detail({
                approval_id: approval_header_obj._id, // foreign key approval master (tapprovals_master)
                approved_by: i._id, //foreign key to muser
                status: false,
                updated_by: getUser._id,
                created_by: getUser._id,
            });

            DTO.push(approval_details)
        })

        req.body.form_record = formIdRecord
        req.body.uid = getUser._id
        req.body.approval_process_id = approval_header_obj._id // foreign key approval master (tapprovals_master)

        let createTServiceRequest = new tservice_request(req.body)

        await approval_header_obj.save({ session });

        await approval_detail.insertMany(DTO, { session });

        await createTServiceRequest.save({ session });

        await session.commitTransaction();
        await session.endSession()

        approved_stack.forEach(i => {

            //Decline notification to level Director
            if (String(i.level) !== '62f8bfb1af1707bb6c80e917') {

                let messageTemplate = "Hallo " + String(i.fullname) + " you have pending approval, please kindly check \n \n"
                messageTemplate += "Owned : *" + getUser.fullname + "* \n \n";
                messageTemplate += "Document Name : *" + getForm.name + "* \n \n";
                messageTemplate += "Type Request : *" + req.body.type_request + "* \n \n";
                messageTemplate += getWhatsAppLink(getUser.company.code) + "wf/sr/view/" + formIdRecord + "\n";

                if (i.phone_number) {
                    publish({
                        opt: 'WA',
                        number: i.phone_number,
                        message: messageTemplate
                    })
                } else {

                    let messageTemplate = "Hallo " + getUser.fullname + " you can share link to your superior for approval document \n \n"
                    messageTemplate += "Document Name :  *" + getForm.name + "* \n \n";
                    messageTemplate += "Type Request : *" + req.body.type_request + "* \n \n";
                    messageTemplate += getWhatsAppLink(getUser.company.code) + "wf/sr/view/" + formIdRecord + "\n";

                    publish({
                        opt: 'WA',
                        number: getUser.phone_number,
                        message: messageTemplate
                    })
                }
            }
            else {

                let messageTemplate = "Hallo " + getUser.fullname + " you can share link to your superior for approval document \n \n"
                messageTemplate += "Document Name :  *" + getForm.name + "* \n \n";
                messageTemplate += "Type Request : *" + req.body.type_request + "* \n \n";
                messageTemplate += getWhatsAppLink(getUser.company.code) + "wf/sr/view/" + formIdRecord + "\n";

                publish({
                    opt: 'WA',
                    number: getUser.phone_number,
                    message: messageTemplate
                })

            }

        })

        return res.send({ code: 200, status: "OK" })
    } catch (error) {

        await session.endSession();
        console.log(error)
        logger.error({
            date: new Date(),
            error: error.toString()
        })

        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }
}
