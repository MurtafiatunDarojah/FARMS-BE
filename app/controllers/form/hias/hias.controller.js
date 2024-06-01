const awsKey = require("../../../config/aws-config");
const logger = require("../../../config/winston");
const AWS = require('aws-sdk');

const db = require("../../../models");

const hias = db.hias;
const hias_attachment = db.hias_attachment;
const responsibleArea = db.resposibility_area;

// Import Prisma Client
const { getRecordId } = require("../../../services/record.id.service");
const { publish } = require("../../../messaging/publisher");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createHias = async (req, res) => {
    const session = await db.mongoose.startSession();
    session.startTransaction();

    const s3 = new AWS.S3(awsKey.s3Key);

    try {
        const hias_data = req.body;

        let attachments;

        if (req.files && req.files.attachments) {
            attachments = Array.isArray(req.files.attachments) ? req.files.attachments : [req.files.attachments];
        } else {
            attachments = [];
        }

        // Prepare operations for MongoDB and Prisma transactions
        const operationsMongoTransaction = [];
        const operationsPrismaTransaction = [];
        const fileAttachmentOperation = [];

        // Set common data
        hias_data.id_record = await getRecordId(hias, 'FRM', 'C11', 'HSE', 'HIAS');
        hias_data.updated_by = hias_data.employee_id;
        hias_data.created_by = hias_data.employee_id;

        const currentDateTimeUTC = new Date().toISOString();
        hias_data.report_date = currentDateTimeUTC;
        hias_data.report_time = currentDateTimeUTC;

        const fileUrls = []; // Array to store file URLs

        // Process attachments
        if (attachments.length > 0) {

            for (const item of attachments) {
                // Generate file name
                const fileName = `${hias_data.id_record}-${new Date().getTime()}.jpeg`;

                // Create and save attachment in MongoDB
                const add_attachment = new hias_attachment({
                    file_name: fileName,
                    file_url: `https://hias-attachment.s3.ap-southeast-3.amazonaws.com/${fileName}`,
                    id_record: hias_data.id_record,
                });
                operationsMongoTransaction.push(add_attachment.save({ session }));

                // Create and add attachment operation in Prisma transaction
                const operationAttachment = prisma.m_hias_attachment.create({
                    data: {
                        file_name: fileName,
                        file_url: `https://hias-attachment.s3.ap-southeast-3.amazonaws.com/${fileName}`,
                        id_record: hias_data.id_record,
                    },
                });
                operationsPrismaTransaction.push(operationAttachment);

                const uploadParams = {
                    Bucket: 'hias-attachment',
                    Key: fileName,
                    ContentEncoding: 'base64',
                    ContentType: 'image/jpeg',
                    Body: item.data,
                };

                let saveS3Attachment = await s3.upload(uploadParams).promise();

                // Add the file URL to the array
                fileUrls.push(saveS3Attachment.Location);
            }
        }

        // Save transaction data in MongoDB
        const newHias = new hias(hias_data);
        await newHias.save({ session });

        // Add data operation in Prisma transaction
        operationsPrismaTransaction.push(prisma.t_hias.create({ data: hias_data }));

        // Commit Transaction Prisma
        await prisma.$transaction(operationsPrismaTransaction);
        // Save Attachment mongo
        await Promise.all(operationsMongoTransaction);

        await Promise.all(fileAttachmentOperation);

        // Commit transactions
        await session.commitTransaction();
        await session.endSession();

        let fileUrlsString = "";

        if (fileUrls.length > 0) {
            // Join the file URLs with newline characters
            fileUrlsString = fileUrls.join('\n\n');
        }

        let pesanHIAS =
            "informasi HIAS Terbaru (Saran dan Informasi Bahaya).\n\n" +
            "Lokasi: *" + hias_data.location.trim() + "*\n" +
            "Nama Pelapor: *" + hias_data.reporter_name.trim() + "*\n" +
            "Nomor WA: *" + hias_data.number_phone.trim() + "*\n" +
            "Nomor Induk Karyawan/NIK KTP: *" + hias_data.employee_id.trim() + "*\n" +
            "Jabatan: *" + hias_data.position.trim() + "*\n" +
            "Departemen/Divisi: *" + hias_data.department_division.trim() + "*\n" +
            "Perusahaan: *" + hias_data.current_company.trim() + "*\n" +
            "Kategori Informasi: *" + hias_data.information_category.trim() + "*\n" +
            "Kategori: *" + hias_data.category_suggestions.trim() + "*\n" +
            "Hasil Pengamatan: *" + hias_data.observation_results.trim() + "*\n" +
            "Tindakan Perbaikan Langsung: *" + hias_data.immediate_corrective_actions.trim() + "*\n" +
            "Rekomendasi: *" + hias_data.recommendations_improvement_inputs.trim() + "*\n" +
            "Lokasi : *"+ hias_data.location.trim() + "*\n" +
            "Penyebab Langsung: *" + (hias_data.direct_cause ? hias_data.direct_cause.trim() : '-') + "*\n\n" +
            "Terima kasih.\n";

        if (fileUrlsString) {
            pesanHIAS += "\n\nLampiran\n\n" + fileUrlsString;
        }

        publish({
            opt: 'WA',
            number: hias_data.number_phone,
            message: pesanHIAS
        })

        publish({
            opt: 'WA',
            wa_group: process.env.HSE_ID,
            message: pesanHIAS
        });

        // Send Notification to responsibility area
        let getResponsibilityUser = await responsibleArea.find({ location:  hias_data.location})

        getResponsibilityUser.forEach(item => {

            publish({
                opt: 'WA',
                number: item.number_phone,
                message: pesanHIAS
            })          
        })

        return res.send({ code: 200, status: "OK" });
    } catch (error) {
        await session.endSession();
        logger.error({
            date: new Date(),
            error: error.toString(),
        });
        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }
};