const { approval_detail } = require("../models");
const { publish } = require('../messaging/publisher');
const { getWhatsAppLink } = require('../services/whatsapp.link.service');

const reminder_approval = async () => {

    // get Approval list pending 
    const getData = await approval_detail.find({ status: false }, 'approved_by approval_id')
        .populate([{
            path: 'approval_id',
            populate: {
                path: 'form_id',
                select: 'name code'
            }
        },
        {
            path: 'approval_id',
            populate: {
                path: 'uid',
                select: 'fullname level company'
            },
        }

        ])
        .populate({
            path: 'approved_by',
            select: 'fullname phone_number level company',
            populate: {
                path: 'company',
            }
        })



    getData.forEach(item => {
        
        let id = item.approval_id.id_form_header ? item.approval_id.id_form_header : item.approval_id.form_submit_id;

        //Decline notification to level Director
        if (String(item.approved_by.level) != '62f8bfb1af1707bb6c80e917') {
            if (item.approval_id.status === 'Waiting Approval') {
                // Send WA Notification
                let messageTemplate = "~ *Reminder Pending Approval* ~ \n\nHallo " + String(item.approved_by.fullname) + " you have *pending approval*, please kindly check \n \n"
                messageTemplate += "Owned : *" + item.approval_id.uid.fullname.trim() + "* \n \n";
                messageTemplate += "Document Name : *" + item.approval_id.form_id.name + "* \n \n";
                messageTemplate += getWhatsAppLink(item.approved_by.company.code) + "wf/" + item.approval_id.form_id.code.toLowerCase() + "/view/" + id + "\n";
                messageTemplate += "\n_the system will do a automatic reminder every 9am_ \n \nThanks"

                publish({
                    opt: 'WA',
                    number: item.approved_by.phone_number,
                    message: messageTemplate
                })
            }
        }
    })
};

const SCHEDULER = {
    reminder_approval,
};

module.exports = SCHEDULER;
