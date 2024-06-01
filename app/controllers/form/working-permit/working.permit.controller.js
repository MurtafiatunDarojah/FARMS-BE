const { getRecordId } = require("../../../services/record.id.service");
const awsKey = require("../../../config/aws-config");
const logger = require("../../../config/winston");
const AWS = require('aws-sdk');

const moment = require('moment');
const { getWhatsAppLink } = require("../../../services/whatsapp.link.service");
const { publish, publish_email } = require("../../../messaging/publisher");
const { mongoose, resposibility_area } = require("../../../models");
const db = require("../../../models");

const validationPermit = db.validation_permit;
const responsibleArea = db.resposibility_area;
const approval_header = db.approval_header;
const approval_detail = db.approval_detail;
const getPermitItems = db.permit_item;
const Permit = db.permit;
const User = db.user;
const Form = db.form;
const APD = db.apd

const s3 = new AWS.S3(awsKey.s3Key);

exports.WorkingPermitItems = async (_, res) => {
    try {

        let getItemsWP = await getPermitItems.find({ active: true });

        return res.send({ code: 200, status: "OK", data: getItemsWP });
    } catch (error) {

        logger.error({
            date: new Date(),
            error: error.toString(),
        });
        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }
};

exports.getResponsibleArea = async (_, res) => {
    try {

        const uniqueLocations = await responsibleArea.distinct('location');

        return res.send({ code: 200, status: "OK", data: uniqueLocations });
    } catch (error) {

        logger.error({
            date: new Date(),
            error: error.toString(),
        });
        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }
}

exports.APDItems = async (_, res) => {
    try {

        let getItemsAPD = await APD.find({ active: true });

        return res.send({ code: 200, status: "OK", data: getItemsAPD });
    } catch (error) {

        logger.error({
            date: new Date(),
            error: error.toString(),
        });
        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }
};

exports.WorkingPermitView = async (req, res) => {
    try {

        let PermitView = await Permit.findOne({ id_record: req.query.id_record })
            .populate({
                path: 'validation',
                populate: [
                    {
                        path: 'approval_process',
                        populate: {
                            path: 'detail',
                            populate: {
                                path: 'approved_by',
                            }
                        },
                    }, {
                        path: 'comments',
                    }]
            })
            // Deep Populate approval process id => tapproval header => tapproval details
            .populate({
                path: 'approval_process_id',
                select: 'status approval_key',
                populate: [{
                    path: 'detail',
                    populate: {
                        path: 'approved_by',
                    }
                },
                {
                    path: 'form_id',
                    populate: {
                        path: 'form_setting',
                    }
                },
                ]
            })
            // Deep Populate UID => direct supervisor -> user
            .populate({
                path: 'user',
                select: 'direct_spv fullname email company phone_number department',
                populate: {
                    path: 'direct_spv',
                    select: "fullname"
                },
            })
            // Join Comments
            .populate('comments')

        return res.send({ code: 200, status: "OK", data: PermitView });
    } catch (error) {

        logger.error({
            date: new Date(),
            error: error.toString(),
        });
        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }
}

// History Permit
exports.WorkingPermitHistory = async (req, res) => {

    try {

        let getUser = await User.findOne({
            email: req.body.email,
        });
        
        const formattedStartDate = new Date(req.query.startDate).toISOString().split('T')[0];
        const formattedEndDate = new Date(req.query.endDate).toISOString().split('T')[0];

        const getListWP = await Permit
            .find({
                user_id: getUser.nik,
                created_at: {
                    $gte: new Date(formattedStartDate),
                    $lt: new Date(moment(formattedEndDate).add(1, 'day'))
                }
            })
            .select('id_record permit_type created_at approval_process_id user status')
            .populate('approval_process_id', 'status')
            .sort({ created_at: -1 });

        return res.send({ code: 200, status: "OK", data: getListWP })

    } catch (error) {

        logger.error({
            date: new Date(),
            error: error.toString()
        })

        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }

}

exports.WorkingPermitHistoryMonitor = async (req, res) => {

    try {

        const formattedStartDate = new Date(req.query.startDate).toISOString().split('T')[0];
        const formattedEndDate = new Date(req.query.endDate).toISOString().split('T')[0];
        console.log(formattedStartDate, formattedEndDate)
        const getListWP = await Permit
            .find({
                created_at: {
                    $gte: new Date(formattedStartDate), // Tanggal awal dalam format ISODate
                    $lt: new Date(moment(formattedEndDate).add(1, 'day')) // Tanggal akhir (ditambah 1 hari) dalam format ISODate
                }
            })
            .select('id_record permit_type created_at approval_process_id user status')
            .populate('approval_process_id', 'status')
            .sort({ created_at: -1 });


        return res.send({ code: 200, status: "OK", data: getListWP })

    } catch (error) {

        logger.error({
            date: new Date(),
            error: error.toString()
        })

        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }

}


exports.ValidationWorkingPermitView = async (req, res) => {
    try {

        let ValidationPermit = await validationPermit.findOne({ id_record: req.query.id_record })
            .populate({
                path: 'approval_process',
                populate: [{
                    path: 'detail',
                    populate: {
                        path: 'approved_by',
                    }
                },
                {
                    path: 'form_id',
                    populate: {
                        path: 'form_setting',
                    }
                },
                ]
            })
            // Join Comments
            .populate('comments')

        return res.send({ code: 200, status: "OK", data: ValidationPermit });

    } catch (error) {

        logger.error({
            date: new Date(),
            error: error.toString(),
        });
        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }
}

exports.EditWorkingPermit = async (req, res) => {

    try {

        let PermitReq = req.body;


        let getApprover = await User.findOne({ nik: PermitReq.user_id })

        // delete user_id supaya g niban
        delete PermitReq.user_id

        // Update Permit
        await Permit.findOneAndUpdate({ id_record: PermitReq.id_record }, { $set: PermitReq })

        // // Send Notification to Group HSE
        // let messageTemplate = `Hello HSE Team,\n\n`;
        // messageTemplate += `We kindly request your prompt review of a recent note update.\n\n`;
        // messageTemplate += `The following note has been added or updated and requires your attention:\n`;
        // messageTemplate += `${PermitReq.notes.replace(/<br>/g, '\n')}\n`;
        // messageTemplate += `Please take a moment to check and provide your feedback.\n\n`;
        // messageTemplate += `${getWhatsAppLink('CPM')}wf/wp/view/${PermitReq.id_record}\n\n`;
        // messageTemplate += `Thank you for your quick response.`;

        // publish({
        //     opt: 'WA',
        //     wa_group: process.env.HSE_ID,
        //     message: messageTemplate
        // });

        let messageTemplatePC = `Hello ${getApprover.fullname},\n\n`;
        messageTemplatePC += `We kindly request your prompt review of a recent note update.\n`;
        messageTemplatePC += `${PermitReq.notes.replace(/<br>/g, '\n')}\n`;
        messageTemplatePC += `Please take a moment to check.\n\n`;
        messageTemplatePC += `${getWhatsAppLink('CPM')}wp/view/${PermitReq.id_record}\n\n`;
        messageTemplatePC += `Thank you`;

        publish({
            opt: 'WA',
            number: getApprover.phone_number,
            message: messageTemplatePC
        });

        return res.send({ code: 200, status: "OK" });
    } catch (error) {

        logger.error({
            date: new Date(),
            error: error.toString(),
        });
        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });

    }
}

exports.CreateWorkingPermit = async (req, res) => {

    const session = await db.mongoose.startSession();
    session.startTransaction();

    try {
        let Attachments = req.files;
        let PermitReq = req.body;


        PermitReq.id_record = await getRecordId(Permit, 'FRM', 'C11', 'HSE', 'WP');

        // Process attachments
        if (Attachments != null) {
            let getItemsWP = await getPermitItems.find({ active: true, checkbox: "Lampiran" });
            for (const key in Attachments) {
                if (Attachments[key]) {
                    try {

                        const fileName = `${PermitReq.id_record}-item_${getItemsWP.find(a => "item_" + a.item_id === key).item_id}.pdf`;

                        const uploadParams = {
                            Bucket: 'working-permit',
                            Key: fileName,
                            Body: Attachments[key].data,
                        };

                        await s3.upload(uploadParams).promise();
                    } catch (s3Error) {

                        console.error('S3 upload error:', s3Error);
                        throw s3Error;
                    }
                }
            }
        }

        // getUser by email 
        let getUser = await User.findOne({ email: PermitReq.email }).populate('company');
        let getSatkerUser = await User.findOne({ nik: PermitReq.direct_supervisor });

        // 1. and then get form setting base on Unit, join to form approval doc
        const getForm = await Form.findOne({ code: 'WP' })
            .populate({
                path: 'form_setting',
                populate: {
                    path: 'approved_by',
                },
            })
            .session(session).exec()

        const approved_stack = await getApprovalStack(PermitReq, getForm);

        // header   
        let approval_header_obj = new approval_header({
            form_id: getForm._id, //mform -> id 
            form_submit_id: PermitReq.id_record,
            uid: getUser._id, //foreign key to muser
            updated_by: getUser._id,
            created_by: getUser._id,
        });

        // Decline notification to level Director

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

        // Give Creator and id Process
        PermitReq.approval_process_id = approval_header_obj._id;
        PermitReq.direct_supervisor = getSatkerUser.fullname;
        PermitReq.user_id = getUser.nik;

        const newPermit = new Permit(PermitReq);
        await newPermit.save({ session });


        // 4. save to DB
        await approval_header_obj.save({ session });
        await approval_detail.insertMany(DTO, { session });

        // Notification to Approver
        await notifyApprovers(approved_stack, getForm, newPermit, getUser);

        // Send Notification to Group HSE
        let messageTemplate = `Hello HSE Team,\n\nCould you please assist in monitoring the *Working Permit*\n\n`;
        messageTemplate += `Document Name :  *Working Permit*\n`;
        messageTemplate += `Permit Type : *${newPermit.permit_type}*\n`;
        messageTemplate += `WP ID : *${newPermit.id_record}*\n`;
        messageTemplate += `Departemen : *${newPermit.department_name.trim()}*\n`;
        messageTemplate += `Lokasi : *${newPermit.job_location}*\n`;
        messageTemplate += `Tanggal Berlaku Izin : *${moment(new Date(newPermit.execution_time)).format('LL')}*\n\n`;
        messageTemplate += `Deskripsi kegiatan : *${newPermit.activity_description.trim()}*\n`;
        messageTemplate += `\n\nPlease kindly check.\n\n`;
        messageTemplate += `${getWhatsAppLink(getUser.company.code)}wf/wp/view/${newPermit.id_record}\n\n_Permit ini sudah di informasikan ke pananggung jawab area_`;

        publish({
            opt: 'WA',
            wa_group: process.env.HSE_ID,
            message: messageTemplate
        });

        console.log(newPermit, PermitReq)

        // Send Notification to responsibility area
        let getResponsibilityUser = await resposibility_area.find({ location: { $in: PermitReq.job_location.split(',') } })

        getResponsibilityUser.forEach(item => {

            let messageTemplate = `Hello ${item.responsible},\n\nAkan ada Pekerjaan Berbahaya, mohon di konfirmasikan ke Safety Team / HSE \n\n`;
            messageTemplate += `Document Name :  *Working Permit*\n`;
            messageTemplate += `Permit Type : *${newPermit.permit_type}*\n`;
            messageTemplate += `WP ID : *${newPermit.id_record}*\n`;
            messageTemplate += `Departemen : *${newPermit.department_name.trim()}*\n`;
            messageTemplate += `Lokasi : *${newPermit.job_location}*\n`;
            messageTemplate += `Tanggal Berlaku Izin : *${moment(new Date(newPermit.execution_time)).format('LL')}*\n\n`;
            messageTemplate += `Deskripsi kegiatan : *${newPermit.activity_description.trim()}*\n`;

            publish({
                opt: 'WA',
                number: item.number_phone,
                message: messageTemplate
            })
        })

        // Commit transactions
        await session.commitTransaction();
        await session.endSession();

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


exports.EndTaskWorking = async (req, res) => {
    const session = await db.mongoose.startSession();
    session.startTransaction();

    try {

        const getUser = await User.findOne({ email: req.body.email }).populate('company');

        req.body.status = 'Closed';

        const approved_stack = [];
        const DTO = [];

        let getReject = await approval_detail.findOneAndUpdate(
            { approval_id: req.body.approver_header_id, status: false, rejected: true },
            { $set: { rejected: false } },
            { session }
        );

        if (!getReject) {

            const Satker = await User.findOne({ nik: req.body.direct_supervisor });

            // approved_stack.push(mongoose.Types.ObjectId("62f8f28bf50b279ca7d7f1ae"))

            //Head Satker 
            approved_stack.push(Satker._id);

            // Head HSE
            approved_stack.push(mongoose.Types.ObjectId("64d9c838e9ca4a47494f4a26"));

            approved_stack.forEach((item) => {
                const approval_details = new approval_detail({
                    approval_id: req.body.approver_header_id,
                    approved_by: item,
                    status: false,
                    updated_by: req.body.nik,
                    created_by: req.body.nik,
                });

                DTO.push(approval_details);
            });

            await approval_header.updateOne({ _id: req.body.approver_header_id }, { status: 'Waiting Approval' }, { session });

            if (DTO.length > 0) {
                await approval_detail.insertMany(DTO, { session });
            }

        }

        let GetPermit = await Permit.findOneAndUpdate({ id_record: req.body.id_record }, req.body, { session });

        await session.commitTransaction();
        session.endSession();

        await notifyApproversEndTask(approved_stack, 'Working Permit', GetPermit, getUser);

        // // Send Notification to Group HSE
        // let messageTemplate = `Hello HSE Team,\n\nCould you please assist in monitoring the *Working Permit - Completed Work* submitted to *Guntur Ekadamba Adiwinata*\n\nKindly ensure the approval process continues smoothly.\n\n`;
        // messageTemplate += `Owned: *${getUser.fullname}*\n`;
        // messageTemplate += `Permit Type: *${GetPermit.permit_type} - Completed Work*\n`;
        // messageTemplate += `Departemen: *${GetPermit.department_name.trim()}*\n`;
        // messageTemplate += `Lokasi: *${GetPermit.job_location}*\n`;
        // messageTemplate += `Permit Type: *${GetPermit.permit_type}*\n`;
        // messageTemplate += `WP ID : *${GetPermit.id_record}*`;
        // messageTemplate += `\n\nPlease kindly check.\n\n`;
        // messageTemplate += `${getWhatsAppLink(getUser.company.code)}wf/wp/view/${GetPermit.id_record}`;

        // Send Notification to Group HSE
        let messageTemplate = `Hello HSE Team,\n\nCould you please assist in monitoring the *Working Permit ( Pekerjaan Selesai )* submitted to *Guntur Ekadamba Adiwinata*\n\nKindly ensure the approval process continues smoothly.\n\n`;
        messageTemplate += `Document Name :  *Working Permit ( Pekerjaan Selesai )*\n`;
        messageTemplate += `Permit Type : *${GetPermit.permit_type}*\n`;
        messageTemplate += `WP ID : *${GetPermit.id_record}*\n`;
        messageTemplate += `Departemen : *${GetPermit.department_name.trim()}*\n`;
        messageTemplate += `Lokasi : *${GetPermit.job_location}*\n`;
        messageTemplate += `Tanggal Berlaku Izin : *${moment(new Date(GetPermit.execution_time)).format('LL')}*\n\n`;
        messageTemplate += `Deskripsi kegiatan : *${GetPermit.activity_description}*\n`;
        messageTemplate += `\n\nPlease kindly check.\n\n`;
        messageTemplate += `${getWhatsAppLink(getUser.company.code)}wf/wp/view/${GetPermit.id_record}`;

        publish({
            opt: 'WA',
            wa_group: process.env.HSE_ID,
            message: messageTemplate
        });

        return res.send({ code: 200, status: "OK" });
    } catch (error) {
        session.endSession();

        logger.error({
            date: new Date(),
            error: error.toString(),
        });

        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }
};

async function getApprovalStack(permitReq, getForm) {

    const mongoose = require('mongoose');
    const approved_stack = [];

    const getSatkerUser = await User.findOne({ nik: permitReq.direct_supervisor })

    if (["Hot Space", "Limited Work", "Work at height"].includes(permitReq.permit_type)) {

        approved_stack.push(getSatkerUser._id);

        getForm.form_setting.approved_by.forEach(item => {
            approved_stack.push(item._id);
        });

    } else if (permitReq.permit_type === 'Electric Work') {

        approved_stack.push(getSatkerUser._id);

        //Karyadi Sumarno ELC 
        approved_stack.push(mongoose.Types.ObjectId("64d9c838e9ca4a47494f4a7e"));

        // // Siswanto ELC ( Deputy )
        // approved_stack.push(mongoose.Types.ObjectId("64d9c838e9ca4a47494f4a8c"))

        // //Joko Saptono Maintanance ( Deputy )
        // approved_stack.push(mongoose.Types.ObjectId("64d9c838e9ca4a47494f4a88"))

        getForm.form_setting.approved_by.forEach(item => {
            approved_stack.push(item._id);
        });

    } else if (permitReq.permit_type === 'Excavation') {

        // Manager
        approved_stack.push(getSatkerUser._id);


        // Mu'minin MIS
        approved_stack.push(mongoose.Types.ObjectId('64d9c838e9ca4a47494f4b7a'));

        //Muh Thaha ( Deputy )
        // approved_stack.push(mongoose.Types.ObjectId("64d9c838e9ca4a47494f4b76"));

        getForm.form_setting.approved_by.forEach(item => {
            approved_stack.push(item._id);
        });
    }

    // Head HSE
    // approved_stack.push(mongoose.Types.ObjectId("64d9c838e9ca4a47494f4a26"));

    // approved_stack.push(mongoose.Types.ObjectId("62f8f28bf50b279ca7d7f1ae"))

    return approved_stack;
}

async function notifyApprovers(approvedStack, getForm, newPermit, getUser) {
    approvedStack.forEach(async i => {

        let getApprover = await User.findOne({ _id: i._id }).populate('company');

        let messageTemplate = `Hallo ${getApprover.fullname} you have pending approval, please kindly check\n\n`;
        messageTemplate += `Document Name : *${getForm.name}*\n`;
        messageTemplate += `Permit Type : *${newPermit.permit_type}*\n`;
        messageTemplate += `WP ID : *${newPermit.id_record}*\n`;
        messageTemplate += `Departemen : *${newPermit.department_name.trim()}*\n`;
        messageTemplate += `Tanggal Berlaku Izin : *${moment(new Date(newPermit.execution_time)).format('LL')}*\n`;
        messageTemplate += `Lokasi : *${newPermit.job_location}*\n\n`;
        messageTemplate += `Deskripsi kegiatan : *${newPermit.activity_description}*\n\n`;

        const WhatsAppLink = i.phone_number ? i.phone_number : getApprover.phone_number;
        messageTemplate += `${getWhatsAppLink(getUser.company.code)}wf/wp/view/${newPermit.id_record}`;

        publish({
            opt: 'WA',
            number: WhatsAppLink,
            message: messageTemplate
        });

        let messageTemplateEmail = `Hallo ${getApprover.fullname} you have pending approval, please kindly check<br><br>`;
        messageTemplateEmail += `Owned: <strong>${getUser.fullname}</strong><br><br>`;
        messageTemplateEmail += `Document Name: <strong>${getForm.name}</strong><br><br>`;
        messageTemplateEmail += `Permit Type: <strong>${newPermit.permit_type}</strong><br><br>`;
        messageTemplateEmail += `Departemen: <strong>${newPermit.department_name.trim()}</strong><br><br>`;
        messageTemplateEmail += `WP ID : <strong>${newPermit.id_record}</strong><br><br>`;
        messageTemplateEmail += `Tanggal Berlaku Izin : <strong>${moment(new Date(newPermit.execution_time)).format('LL')}</strong><br><br>`;
        messageTemplateEmail += `Lokasi: <strong>${newPermit.job_location}</strong><br><br>`;
        messageTemplateEmail += `Deskripsi kegiatan : <strong>${newPermit.activity_description}</strong><br><br>`;
        messageTemplateEmail += `<a href="${getWhatsAppLink(getUser.company.code)}wf/wp/view/${newPermit.id_record}" style="background-color: orange; color: white; padding: 10px; text-decoration: none; display: inline-block;">View WP</a>`;

        publish_email({
            email: getApprover.email,
            subject: 'FARMS | Pending Approval | Working Permit | ' + newPermit.id_record,
            business_entity: getApprover.company.code,
            message: messageTemplateEmail
        })
    });
}

async function notifyApproversEndTask(approvedStack, getForm, newPermit, getUser) {
    approvedStack.forEach(async i => {

        let getApprover = await User.findOne({ _id: i._id }).populate('company');

        // let messageTemplate = `Hallo ${getApprover.fullname} you have pending approval, please kindly check\n\n`;
        // messageTemplate += `Owned: *${getUser.fullname}*\n`;
        // messageTemplate += `Document Name: *Working Permit - Pekerjaan Selesai*\n`;
        // messageTemplate += `Permit Type: *${newPermit.permit_type}*\n`;
        // messageTemplate += `Departemen: *${newPermit.department_name.trim()}*\n`;
        // messageTemplate += `Lokasi: *${newPermit.job_location}*\n`;
        // messageTemplate += `WP ID : *${newPermit.id_record}*\n\n`;

        let messageTemplate = `Hallo ${getApprover.fullname} you have pending approval, please kindly check\n\n`;
        messageTemplate += `Document Name : *Working Permit - Pekerjaan Selesai*\n`;
        messageTemplate += `Permit Type : *${newPermit.permit_type}*\n`;
        messageTemplate += `WP ID : *${newPermit.id_record}*\n`;
        messageTemplate += `Departemen : *${newPermit.department_name.trim()}*\n`;
        messageTemplate += `Tanggal Berlaku Izin : *${moment(new Date(newPermit.execution_time)).format('LL')}*\n`;
        messageTemplate += `Lokasi : *${newPermit.job_location}*\n\n`;
        messageTemplate += `Deskripsi kegiatan : *${newPermit.activity_description}*\n\n`;

        const WhatsAppLink = i.phone_number ? i.phone_number : getApprover.phone_number;
        messageTemplate += `${getWhatsAppLink(getUser.company.code)}wf/wp/view/${newPermit.id_record}`;

        publish({
            opt: 'WA',
            number: WhatsAppLink,
            message: messageTemplate
        });

        // let messageTemplateEmail = `Hallo ${getApprover.fullname} you have pending approval, please kindly check<br><br>`;
        // messageTemplateEmail += `Owned: <strong>${getUser.fullname}</strong><br><br>`;
        // messageTemplateEmail += `Document Name: <strong>${getForm.name} - Pekerjaan Selesai</strong><br><br>`;
        // messageTemplateEmail += `Permit Type: <strong>${newPermit.permit_type}</strong><br><br>`;
        // messageTemplateEmail += `Departemen: <strong>${newPermit.department_name.trim()}</strong><br><br>`;
        // messageTemplateEmail += `WP ID : <strong>${getForm.id_record}</strong><br><br>`;
        // messageTemplateEmail += `<a href="${getWhatsAppLink(getUser.company.code)}wf/wp/view/${newPermit.id_record}" style="background-color: orange; color: white; padding: 10px; text-decoration: none; display: inline-block;">View WP</a>`;

        // publish_email({
        //     email: getApprover.email,
        //     subject: 'FARMS | Pending Approval | Complete Working Permit | ' + newPermit.id_record,
        //     business_entity: getApprover.company.code,
        //     message: messageTemplateEmail
        // })
    });
}
