const { getWhatsAppLink } = require("../services/whatsapp.link.service");
const { publish } = require("../messaging/publisher");
const logger = require("../config/winston");
const db = require("../models");

const ApprovalHeader = db.approval_header;
const Department = db.department;
const TTravelAuthority = db.ta;
const Permit = db.permit
const musers = db.user;


const NewNotificationForDeputyApprover = async (_, doc, involved, formid, requestor) => {
    const usersWithDeputiesAndApprovers = await Promise.all(
        involved.map(async id => {
            const deputyUser = await musers.findOne({ nik: id.deputy });
            const approverUser = await musers.findById(id.approver);
            return {
                deputyUser,
                approverUser
            };
        })
    );

    usersWithDeputiesAndApprovers.forEach(({ deputyUser, approverUser }) => {
        let messageTemplate = `Hello ${deputyUser.fullname},\n\nCould you please assist in monitoring the *${doc}* submitted to *${approverUser.fullname}*\n\nKindly ensure the approval process continues smoothly.\n\n`;
        messageTemplate += `Owned: *${requestor.fullname}*\n\n`;
        messageTemplate += `TA ID: ${formid}\n\n`;
        messageTemplate += `Please check the farms admin page for deputy approval.\n`;

        publish({
            opt: 'WA',
            number: deputyUser.phone_number,
            message: messageTemplate
        });
    });
};


const NewNotificationDocToApprover = async (approvers, doc_name, sort_info, url, res, owned) => {
    try {
        const levelDirector = '62f8bfb1af1707bb6c80e917';

        const users = await Promise.all(
            approvers.map(id => musers.findById(String(id)))
        );

        users.forEach(user => {

            const documentInfo = `Document Name: *${doc_name}*\n\n${sort_info}\n\n${url}`;

            let messageTemplate;

            if (user.level !== levelDirector) {

                messageTemplate = `Hallo ${user.fullname}, you have pending approval. Please kindly check\n\n`;
                messageTemplate += `Owned: *${owned.fullname}*\n\n${documentInfo}\n`;
                publish({
                    opt: 'WA',
                    number: user.phone_number,
                    message: messageTemplate
                });

            } else {

                messageTemplate = `Hallo ${user.fullname}, you can share the link to your superior for approval document\n\n`;
                messageTemplate += `Superior: *${owned.fullname}*\n\n${documentInfo}\n`;
                publish({
                    opt: 'WA',
                    number: user.phone_number,
                    message: messageTemplate
                });

            }
        });

    } catch (error) {

        logger.error({
            date: new Date(),
            error: error.toString()
        });

        return res.status(500).send({
            code: 500,
            status: "INTERNAL_SERVER_ERROR",
            error: [{ name: error.toString() }]
        });
    }
};

const NewNotificationToDepartment = async (type, doc_name, id_record, user, dispatcher) => {
    try {
        switch (type) {
            case 'TA':

                try {

                    const departments = await Department.find({ fullname: { $in: ["Admin & Support", "Human Resource"] }, company_by: user.company });

                    let deptUsers = await musers.find({ department: { $in: departments.map(department => department._id) } });

                    let getDispatcher = await musers.findOne({ nik: dispatcher });

                    // Periksa apakah getDispatcher ada dan belum ada dalam deptUsers berdasarkan nik
                    if (getDispatcher && !deptUsers.some(user => user.nik === getDispatcher.nik)) {
                        deptUsers.push(getDispatcher);
                    }

                    let getApprovalHeader = await ApprovalHeader.findOne({ form_submit_id: id_record })
                        .populate('uid').exec()

                    for (const user of deptUsers) {

                        if (user.phone_number) {
                            let messageTemplate = `Hallo ${user.fullname},  there is a *${doc_name}* submission\n\n`;
                            messageTemplate += `Owned: ${getApprovalHeader.uid.fullname}\n\n`;
                            messageTemplate += `Dispatcher : *${getDispatcher.fullname}*\n\n`
                            // ForTA only BRM first
                            messageTemplate += `Link: ${getWhatsAppLink('BRM')}${type.toLowerCase()}/view/${getApprovalHeader.form_submit_id}\n\n`;
                            messageTemplate += `Please kindly check the link to track the approval status.`;

                            publish({
                                opt: 'WA',
                                number: user.phone_number,
                                message: messageTemplate
                            });
                        }

                    }

                } catch (error) {

                    logger.error({
                        date: new Date(),
                        error: error.toString()
                    });

                }

                break;
            default:
        }

    } catch (error) {

        logger.error({
            date: new Date(),
            error: error.toString()
        });

        return res.status(500).send({
            code: 500,
            status: "INTERNAL_SERVER_ERROR",
            error: [{ name: error.toString() }]
        });
    }
}

const NotificationCompleteDocToPIC = async (type, PIC, doc_name, getApprovalHeader) => {

    const PICs = getApprovalHeader.approval_id.form_id.form_setting.pic;
    const form_record = getApprovalHeader.approval_id.form_submit_id

    switch (type) {
        case 'TA':

            // get dispatcher
            const getDispatcher = await TTravelAuthority.findOne(
                { id_record: form_record }
            ).populate('dispatcher_ta')

            for (const PIC of PICs) {
                if (getDispatcher.dispatcher_ta.nik === PIC.nik) {
                    let messageTemplate = `Hallo ${PIC.fullname}, there is document *${doc_name}* overall has been complete approved\n\n`;
                    messageTemplate += `Owned: ${getApprovalHeader.approval_id.uid.fullname}\n\n`;
                    messageTemplate += `Dispatcher: ${getDispatcher.dispatcher_ta.fullname}\n\n`;
                    messageTemplate += `TA ID : ${form_record}\n\n`;
                    messageTemplate += `Please check on the farms admin page`;

                    publish({
                        opt: 'WA',
                        number: PIC.phone_number,
                        message: messageTemplate
                    });

                }
            }

            break;
        case 'SR':
            for (const PIC_ITEM of PIC) {
                const form_record = getApprovalHeader.approval_id.form_submit_id;
                let messageTemplate = `Hallo ${PIC_ITEM.fullname}, there is document *${doc_name}* overall has been complete approved\n\n`;
                messageTemplate += `SR ID : ${form_record}\n\n`;
                messageTemplate += `Please check on the farms admin page`;

                publish({
                    opt: 'WA',
                    number: PIC_ITEM.phone_number,
                    message: messageTemplate
                });
            }
            break;
        case 'WPx':
        case 'VWPx':
            for (const PIC_ITEM of PIC) {

                let getRecordId = form_record


                let GetPermit = await Permit.findOne({ id_record: getRecordId });

                // getUser by email 
                let getUser = await musers.findOne({ nik: GetPermit.user_id }).populate('company');

                let messageTemplate = `Hallo ${PIC_ITEM.fullname}, there is document *${doc_name}* overall has been complete approved\n\n`;

                messageTemplate += `Owned: *${getUser.fullname.trim()}*\n\n`;
                messageTemplate += `Departemen: *${GetPermit.department_name.trim()}*\n\n`;
                messageTemplate += `Lokasi: *${GetPermit.job_location}*\n\n`;
                messageTemplate += `Permit Type: *${GetPermit.permit_type}*\n\n`;
                messageTemplate += `WP ID : *${GetPermit.id_record}*`;
                messageTemplate += `\n\nPlease kindly check.\n\n`;

                messageTemplate += `${getWhatsAppLink(getUser.company.code)}wp/view/${GetPermit.id_record}`;


                if (PIC_ITEM.phone_number) {
                    publish({
                        opt: 'WA',
                        number: PIC_ITEM.phone_number,
                        message: messageTemplate
                    });
                }
            }

            break;
        default:
    }
}

const notificationApproval = async (data) => {
    let status = ['Not approved', 'Has been approved'];

    let messageTemplate = `Hello ${data.requestor}, your ${data.doc_name} *${status[data.status]}* \n\n`;
    messageTemplate += `By: ${data.approver} \n\n`;

    // Check status: reject (0) or approved (1)
    if (data.status === 0) {
        messageTemplate += "Message: " + data.msg;
    }

    messageTemplate += `\n\nPlease kindly check`;

    if (data.doc_code.toLowerCase() === 'ts') {
        messageTemplate += `\n\n${getWhatsAppLink(data.user.company.code)}${data.doc_code.toLowerCase()}/view/${data.idDoc}`;
    }

    publish({
        opt: 'WA',
        number: data.requestor_number,
        message: messageTemplate
    });
};


module.exports = {
    NewNotificationForDeputyApprover,
    NotificationCompleteDocToPIC,
    NewNotificationDocToApprover,
    NewNotificationToDepartment,
    notificationApproval,
};
