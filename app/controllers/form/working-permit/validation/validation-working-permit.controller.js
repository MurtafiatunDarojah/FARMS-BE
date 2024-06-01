const { getRecordId } = require("../../../../services/record.id.service");
const logger = require("../../../../config/winston");

const { getWhatsAppLink } = require("../../../../services/whatsapp.link.service");
const { publish, publish_email } = require("../../../../messaging/publisher");

const db = require("../../../../models");
const approval_header = db.approval_header;
const approval_detail = db.approval_detail;
const Validation = db.validation_permit;
const Permit = db.permit;
const User = db.user;
const Form = db.form;

const moment = require('moment');

exports.CreateValidationPermit = async (req, res) => {

    const session = await db.mongoose.startSession();
    session.startTransaction();

    try {

        let ValidationReq = req.body;

        ValidationReq.id_record = await getRecordId(Validation, 'FRM', 'C11', 'HSE', 'VWP');

        let getPermitType = await Permit.findOne({ id_record: ValidationReq.id_permit });

        // getUser by email 
        let getUser = await User.findOne({ email: ValidationReq.email }).populate('company');

        const Satker = await User.findOne({ nik: req.body.direct_supervisor });

        // 1. and then get form setting base on Unit, join to form approval doc
        const getForm = await Form.findOne({ code: 'VWP' })
            .populate({
                path: 'form_setting',
                populate: {
                    path: 'approved_by',
                },
            })
            .session(session).exec()

        // Head Satker and head HSE
        const approved_stack = [Satker.id, '64d9c838e9ca4a47494f4a26']

        // const approved_stack = ['62f8f28bf50b279ca7d7f1ae', '64d9c838e9ca4a47494f4a26']

        let approval_header_obj = new approval_header({
            form_id: getForm._id, //mform -> id 
            form_submit_id: ValidationReq.id_record,
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
                approved_by: i, //foreign key to muser
                status: false,
                updated_by: getUser._id,
                created_by: getUser._id,
            });

            DTO.push(approval_details)
        })

        const newValidation = new Validation(ValidationReq);
        await newValidation.save({ session });

        await approval_header_obj.save({ session });
        await approval_detail.insertMany(DTO, { session });


        await session.commitTransaction();
        await session.endSession();

        //Add Permit Type for notification 
        newValidation.permit_type = getPermitType.permit_type;
        newValidation.department_name = getPermitType.department_name;
        newValidation.job_location = getPermitType.job_location;
        newValidation.execution_time = getPermitType.execution_time;
        newValidation.activity_description = getPermitType.activity_description;

        // Notification to Approver
        await notifyApprovers(approved_stack, getForm, newValidation, getUser);

        // Send Notification to Group HSE
        //   let messageTemplate = `Hello HSE Team,\n\nCould you please assist in monitoring the *Validation Working Permit* submitted to *Guntur Ekadamba Adiwinata*\n\nKindly ensure the approval process continues smoothly.\n\n`;
        //   messageTemplate += `Document Name: *Working Permit ( Validation )*\n`
        //   messageTemplate += `Departemen: *${getPermitType.department_name.trim()}*\n`;
        //   messageTemplate += `Lokasi: *${getPermitType.job_location}*\n`;
        //   messageTemplate += `Permit ID : *${getPermitType.id_record}*\n`;
        //   messageTemplate += `Validasi ID : *${newValidation.id_record}*\n`;
        //   messageTemplate += `Permit Type: *${newValidation.permit_type}*\n`;
        //   messageTemplate += `\nPlease kindly check.\n\n`;
        //   messageTemplate += `${getWhatsAppLink(getUser.company.code)}wf/vwp/view/${newValidation.id_record}`;

        let messageTemplate = `Hello HSE Team,\n\nCould you please assist in monitoring the *Working Permit ( Validation )* submitted to *Guntur Ekadamba Adiwinata*\n\nKindly ensure the approval process continues smoothly.\n\n`;
        messageTemplate += `Document Name :  *Working Permit ( Validasi )*\n`;
        messageTemplate += `Departemen : *${getPermitType.department_name.trim()}*\n`;
        messageTemplate += `Lokasi : *${getPermitType.job_location}*\n`;
        messageTemplate += `Permit Type : *${getPermitType.permit_type}*\n`;
        //   messageTemplate += `Permit ID : *${getPermitType.id_record}*\n`;
        messageTemplate += `Validasi ID : *${newValidation.id_record}*\n`;
        messageTemplate += `Tanggal Berlaku Izin : *${moment(new Date(getPermitType.execution_time)).format('LL')}*\n\n`;
        messageTemplate += `Deskripsi kegiatan : *${getPermitType.activity_description}*\n`;
        messageTemplate += `\n\nPlease kindly check.\n\n`;
        messageTemplate += `${getWhatsAppLink(getUser.company.code)}wf/vwp/view/${newValidation.id_record}`;

        publish({
            opt: 'WA',
            wa_group: process.env.HSE_ID,
            message: messageTemplate
        });

        return res.send({ code: 200, status: 'OK' });
    } catch (error) {

        await session.endSession();

        logger.error({
            date: new Date(),
            error: error.toString(),
        });

        return res.status(500).send({ code: 500, status: 'INTERNAL_SERVER_ERROR', error: [{ name: error.toString() }] });
    }
};

async function notifyApprovers(approvedStack, getForm, ValidationReq, getUser) {
    approvedStack.forEach(async i => {

        let getApprover = await User.findOne({ _id: i }).populate('company');

        let messageTemplate = `Hallo ${getApprover.fullname} you have pending approval, please kindly check\n\n`;
        messageTemplate += `Document Name : *${getForm.name} ( Validasi )*\n`;
        messageTemplate += `Permit Type : *${ValidationReq.permit_type}*\n`;
        messageTemplate += `WP ID : *${ValidationReq.id_record}*\n`;
        messageTemplate += `Departemen : *${ValidationReq.department_name}*\n`;
        messageTemplate += `Tanggal Berlaku Izin : *${moment(new Date(ValidationReq.execution_time)).format('LL')}*\n`;
        messageTemplate += `Lokasi : *${ValidationReq.job_location}*\n\n`;
        messageTemplate += `Deskripsi kegiatan : *${ValidationReq.activity_description}*\n\n`;

        const WhatsAppLink = i.phone_number ? i.phone_number : getApprover.phone_number;
        messageTemplate += `${getWhatsAppLink(getUser.company.code)}wf/vwp/view/${ValidationReq.id_record}`;

        publish({
            opt: 'WA',
            number: WhatsAppLink,
            message: messageTemplate
        });

        // let messageTemplateEmail = `Hallo ${getApprover.fullname} you have pending approval, please kindly check<br><br>`;
        // messageTemplateEmail += `Owned: <strong>${getUser.fullname}</strong><br><br>`;
        // messageTemplateEmail += `Document Name: <strong>${getForm.name}</strong><br><br>`;
        // messageTemplateEmail += `Permit Type: <strong>${ValidationReq.permit_type}</strong><br><br>`;
        // messageTemplateEmail += `Departemen: <strong>${ValidationReq.department_name}</strong><br><br>`;
        // messageTemplateEmail += `Permit ID : <strong>${getForm.id_record}</strong><br><br>`;
        // messageTemplateEmail += `<a href="${getWhatsAppLink(getUser.company.code)}wf/wp/view/${ValidationReq.id_record}" style="background-color: orange; color: white; padding: 10px; text-decoration: none; display: inline-block;">View WP</a>`;

        // publish_email({
        //     email: getApprover.email,
        //     subject: 'FARMS | Pending Approval | Validation Working Permit | ' + ValidationReq.id_record,
        //     business_entity: getApprover.company.code,
        //     message: messageTemplateEmail
        // })
    });
}