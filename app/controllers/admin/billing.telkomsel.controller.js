const awsKey = require('../../config/aws-config')
const db = require('../../models')

const moment = require("moment")

const AWS = require('aws-sdk')
const XLSX = require('xlsx')

const ITBillingTelkomHDR = require("../../models/billing_telkomsel/billing.telkomsel.hdr.model")
const ITBillingTelkomDTL = require("../../models/billing_telkomsel/billing.telkomsel.dtl.model")
const ITBillingTelkomMST = require("../../models/billing_telkomsel/billing.telkomsel.mst.model")

const approval_header = require('../../models/digital_approval/transaction/approval.header.model');
const approval_detail = require('../../models/digital_approval/transaction/approval.detail.model');
const Form = require('../../models/digital_approval/master/form.model');

const { getWhatsAppLink } = require('../../services/whatsapp.link.service')
const { publish } = require('../../messaging/publisher')

async function normalize(xlxs_file, req) {

    let completeNormalize = []

    let workbook = XLSX.read(xlxs_file.data, { type: "buffer" })
    let sheet_name_list = workbook.SheetNames
    let xData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]])

    xData.forEach(async (data) => {
        let normalizedXData = {}

        Object.keys(xData[0]).forEach(function (columnName) {

            normalizedXData[columnName.toLowerCase().trim().replace(/[^A-Z0-9]+/ig, "_").replace(/([_/]*)$/ig, "")] = xData[columnName] = data[columnName]
            normalizedXData['periode_upload'] = (`${normalizedXData['invoice_year']}-${normalizedXData['invoice_month']}`)
            normalizedXData['created_by'] = req.fullname
            normalizedXData['updated_by'] = req.userId
        })

        completeNormalize.push(normalizedXData)

    })

    return completeNormalize
}

exports.ImportBilling = async (req, res) => {

    let error = []
    let s3 = new AWS.S3(awsKey.s3Key)

    // Transaction  
    let session = await db.mongoose.startSession();
    session.startTransaction();

    try {

        if (!req.files || Object.keys(req.files).lengtah === 0) {
            return res.status(400).send({ code: 400, status: "BAD_REQUEST", error: 'No files were uploaded.' });
        }

        let getFiles = [req.files.billing_sum, req.files.billing_dtl]

        getFiles.forEach(item => {

            if (item) {
                if (item.mimetype != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {

                    error.push({ name: item.name + " format file must XLSX" })
                }
            }
            else {
                error.push({ name: "Summary and detail must uploaded" })
            }
        })


        if (req.files.billing_pdf.mimetype != 'application/pdf') {
            error.push({ name: req.files.billing_pdf.name + " format file must PDF" })
        } else {

            getFiles.push(req.files.billing_pdf)
        }

        if (error.length > 0) {
            return res.status(400).send({ code: 400, status: "BAD_REQUEST", error: error });
        }

        // get master 
        let master = await ITBillingTelkomMST.find({});

        // clean field from excel
        let completeNormalizeSum = await normalize(req.files.billing_sum, req);
        let completeNormalizeDtl = await normalize(req.files.billing_dtl, req);


        // Checking Duplicated Periode
        let isExisting = await ITBillingTelkomHDR.find({ periode_upload: completeNormalizeSum[0].periode_upload }).session(session).exec()

        if (isExisting.length > 0) {
            return res.status(400).send({ code: 400, status: "BAD_REQUEST", error: [{ name: "imported periode " + completeNormalizeSum[0].periode_upload + " is already imported" }] })
        }

        // Checking excel to master, if data exist, name replace from master, if not exist data will import without replace name / gross name
        completeNormalizeSum.forEach(nmrz => {
            //last active for check user is active on period, because maybe data from telkomsel not already update
            nmrz.last_active = false

            //save pdf file
            nmrz.pdf_file = `${completeNormalizeSum[0].periode_upload}-${req.files.billing_pdf.name}`

            master.find(mst => {
                // check to master
                if (String(nmrz.kartuhalo_number) === String(mst.telp)) {
                    // clean name from master

                    // note : company not will clean because from telkomsel contantly not consistent
                    // nmrz.name = mst.name

                    if (!mst.active) {
                        nmrz.last_active = true
                    }
                }
            })


        })

        await ITBillingTelkomHDR.insertMany(completeNormalizeSum, { session })

        await ITBillingTelkomDTL.insertMany(completeNormalizeDtl, { session })

        // if file same, will replace
        getFiles.forEach((item) => {
            s3.upload({
                Bucket: 'billing-telkomsel',
                Key: `${completeNormalizeSum[0].periode_upload}-${item.name}`,
                Body: item.data,

            }, function (err, data) {
                if (err) console.log(err, err.stack);
                else console.log("File uploaded successfully.", data.Location);
            })
        })

        await session.commitTransaction();
        await session.endSession()

        return res.status(200).send({ code: 200, status: "OK" });

    } catch (error) {
        console.log(error)

        await session.abortTransaction();
        await session.endSession();

        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }

}

exports.PeriodeList = async (req, res) => {
    try {


        let data = await ITBillingTelkomHDR.aggregate(
            [
                { $group: { "_id": { periode_upload: "$periode_upload", isclean: "$isclean", created_by: "$created_by", id: "$periode_upload", } } },
                { $sort: { "periode_upload": -1 } }
            ]
        )

        let DTO = []

        data.forEach(async item => {

            DTO.push(
                {
                    periode_upload: item._id.periode_upload,
                    created_by: item._id.created_by,
                }
            )
        })

        return res.status(200).send({ code: 200, status: "OK", data: DTO });

    } catch (error) {
        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }
}

exports.PeriodeDetail = async (req, res) => {

    try {

        let groupBESort = []
        let dataClean = []
        let dataGroup = []
        let subtotal = 0
        let totalBE = 0

        // Checking Duplicated Periode & Get Process Approval
        let bilHeader = await ITBillingTelkomHDR.find({ last_active: false, periode_upload: req.query.periode_upload })
            .populate({
                path: 'approval_process_id',
                populate: [
                    {
                        path: 'detail',
                        populate: {
                            path: 'approved_by',
                        },
                    },
                    {
                        path: 'uid',
                    },
                ]
            })
            // sort for gate faktur date minimum
            .populate('unit').sort({ fakturdate: 1 })

        if (bilHeader.length == 0) {
            return res.status(404).send({ code: 404, status: "NOT_FOUND", error: "imported periode " + req.query.periode_upload + " not Found" })
        }

        bilHeader.forEach((item) => {

            let business_entity = item.unit ? item.unit.business_entity : "BRM";

            let SUM = Number(item.amount_due_to_be_paid < 0 ? 0 : item.amount_due_to_be_paid)

            let DTO = {
                seq: item.unit ? item.unit.seq : item.kartuhalo_number.substring(),
                provider: item.unit ? item.unit.provider : 'Tsel',
                invoice_number: item.invoice_number,
                name: item.unit ? item.name : item.name,
                telp: item.unit ? item.unit.telp : item.kartuhalo_number,
                international_roaming: item.international_roaming,
                calls_to_telkomsel_numbers: item.calls_to_telkomsel_numbers,
                calls_to_other_operators: item.calls_to_other_operators,
                idd_international_sms: item.idd_international_sms,
                domestic_sms: item.domestic_sms,
                domestic_data: item.domestic_data,
                amount_due_to_be_paid: SUM,
                business_entity: business_entity,
                subtotal_bu: null,
                remarks: item.unit ? item.unit.remarks : '',
            }

            dataClean.push(DTO)
            subtotal += SUM

        })

        // Sort BY BE
        dataClean.sort((a, b) => {
            const nameA = a.business_entity.toUpperCase();
            const nameB = b.business_entity.toUpperCase();

            if (nameA < nameB) {
                return -1;
            }

            if (nameA > nameB) {
                return 1;
            }

            // names must be equal
            return 0;
        })

        // Count Based on BE
        dataClean.forEach((data, index) => {

            dataGroup.push(data)

            totalBE += data.amount_due_to_be_paid

            let be_compare = dataClean[index + 1] ? dataClean[index + 1].business_entity : null;

            if (data.business_entity != be_compare) {

                dataGroup.push({
                    seq: null,
                    provider: null,
                    invoice_number: null,
                    name: null,
                    telp: null,
                    international_roaming: null,
                    calls_to_telkomsel_numbers: null,
                    calls_to_other_operators: null,
                    idd_international_sms: null,
                    domestic_sms: null,
                    domestic_data: null,
                    amount_due_to_be_paid: null,
                    business_entity: data.business_entity,
                    subtotal_bu: totalBE,
                    remarks: null
                })

                // Sort by Name based on BE
                groupBESort.push({
                    data: dataGroup.sort((a, b) => {
                        const nameA = a.name ? a.name.toUpperCase() : 'Z';
                        const nameB = b.name ? b.name.toUpperCase() : 'Z';

                        if (nameA < nameB) {
                            return -1;
                        }

                        if (nameA > nameB) {
                            return 1;
                        }

                        // names must be equal
                        return 0;
                    }),
                })

                // Reset Data Group after get based on BE
                dataGroup = []

                totalBE = 0
            }

        })

        // Get Result Sort name based on BE
        groupBESort.forEach(item => {
            item.data.forEach(item => {
                dataGroup.push(item)
            })
        })

        return res.status(200).send({ code: 200, status: "OK", data: { recap: { subTotal: subtotal }, pdf_file: bilHeader[0].pdf_file, invoice_date: bilHeader[0].fakturdate, billing: dataGroup, process: bilHeader[0].approval_process_id || null } });

    } catch (error) {
        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }
}

exports.applyToApproval = async (req, res) => {

    // Transaction  
    let session = await db.mongoose.startSession();
    session.startTransaction();

    try {

        if (!req.body.period) {
            return res.status(400).send({ code: 404, status: "BAD_REQUEST", error: [{ name: "periode cannot be empty" }] });
        }

        // 1. and then get form setting, join to form approval doc
        const getForm = await Form.findOne({ code: 'BT' }).populate({
            path: 'form_setting',
            populate: {
                path: 'approved_by'
            }
        }).session(session).exec()

        // form record id
        let form_id = "A11" + "-ICT-MAC-TSL-" + req.body.period.split('-').join('');

        // 2. generate Approval Header
        let approval = new approval_header({
            form_id: getForm._id, //mform -> id
            form_submit_id: form_id, //document record code
            uid: req.userId, //foreign key to muser
            updated_by: req.userId,
            created_by: req.userId,
        });

        // 3. generate Approval Detail
        let DTO = []
        let approval_details

        getForm.form_setting.approved_by.forEach(item => {
            approval_details = new approval_detail({
                approval_id: approval._id, // foreign key approval header (tapprovals)
                approved_by: String(item._id), //foreign key to muser
                status: false,
                updated_by: req.userId,
                created_by: req.userId,
            });

            DTO.push(approval_details)
        })

        await ITBillingTelkomHDR.updateMany({ "periode_upload": req.body.period },
            {
                $set: {
                    form_record: form_id,
                    approval_process_id: approval._id
                }
            },
            {
                multi: true
            }).session(session)


        await approval.save({ session });
        await approval_detail.insertMany(DTO, { session });


        await session.commitTransaction();
        await session.endSession()


        getForm.form_setting.approved_by.forEach(item => {

            let messageTemplate = "Hallo " + String(item.fullname) + " you have *pending approval*, please kindly check \n \n"
            messageTemplate += "Requestor : *" + req.fullname + "* \n \n";
            messageTemplate += "Document Name : *" + getForm.name + "* \n \n";
            messageTemplate += "Period : *" + moment(req.body.period).format("MMMM YYYY") + "* \n \n";
            messageTemplate += getWhatsAppLink('BRM') + "wf/bt/view/" + form_id + "\n";

            publish({
                opt: 'WA',
                number: item.phone_number,
                message: messageTemplate
            })

        })


        return res.send({ code: 200, status: "OK" })

    } catch (error) {

        await session.abortTransaction();
        await session.endSession();

        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }
}


exports.MasterList = async (_, res) => {

    try {
        let data = await ITBillingTelkomMST.find()

        return res.send({ code: 200, status: "OK", data: data })

    } catch (error) {
        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }

}

exports.MasterView = async (req, res) => {

    try {

        let data = await ITBillingTelkomMST.findById(req.query.id)

        if (!data) {
            return res.status(404).send({ code: 404, status: "NOT_FOUND", error: [{ name: "Not Found" }] })
        }

        return res.send(data)

    } catch (error) {
        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }

}

exports.MasterUpdate = async (req, res) => {

    try {

        if (!req.body) {
            return res.status(400).send({ code: 404, status: "BAD_REQUEST", error: [{ name: "Not Data to update can not be empty!" }] });
        }

        let data = await ITBillingTelkomMST.findByIdAndUpdate(req.body._id, req.body)

        if (!data) {
            return res.status(404).send({ code: 404, status: "BAD_REQUEST", error: [{ name: `Cannot update Tutorial with id=${id}. Maybe Tutorial was not found!` }] });
        }

        return res.send({ code: 200, status: "OK" })

    } catch (error) {
        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }

}

exports.MasterCreate = async (req, res) => {

    try {

        if (!req.body) {
            return res.status(400).send({ code: 404, status: "BAD_REQUEST", error: [{ name: "Data can not be empty!" }] });
        }

        const master = await new ITBillingTelkomMST({
            seq: req.body.telp,
            name: req.body.name,
            telp: req.body.telp,
            provider: req.body.provider,
            business_entity: req.body.business_entity,
            remarks: req.body.remarks,
            active: req.body.active
        });

        master.save()

        return res.send({ code: 200, status: "OK" })

    } catch (error) {
        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }

}
