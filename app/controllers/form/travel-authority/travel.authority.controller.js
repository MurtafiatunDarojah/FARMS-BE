const { NewNotificationDocToApprover, NewNotificationToDepartment, NewNotificationForDeputyApprover } = require("../../../services/notification.service");
const { getWhatsAppLink } = require("../../../services/whatsapp.link.service");
const { getRecordId } = require("../../../services/record.id.service");
const logger = require("../../../config/winston");


const db = require("../../../models");
const user_cost_est_ta = db.user_cost_est_ta;
const accomodation = db.accomodation;
const reservation = db.reservation;
const ttravel_authority = db.ta;
const mlevel = db.level_user;
const user_ta = db.user_ta;
const musers = db.user;

const approval_hdr = db.approval_header;
const approval_dtl = db.approval_detail;
const formSetting = db.form_approval;
const form = db.form;

exports.createTravelAuthority = async (request, res) => {
    const session = await db.mongoose.startSession();
    session.startTransaction();

    try {

        let req = request.body;
        // Get user id
        const muser = await musers.findOne({ email: req.email }).populate('company');

        const formIdRecord = await getRecordId(ttravel_authority, 'FRM', muser.company.business_entity, 'HRGA', 'TA');

        // Get form setting and join to form approval doc
        const getForm = await form.findOne({ code: 'TA' })
            .populate('form_setting')
            .session(session);

        // Create array of approvers
        // 1. Approved by Superior 
        // 2. Approved by HR Manager
        // 3. Approved by CFO   
        // 4. Approved Director ( International )

        const getApprover = await musers.findOne({ nik: req.data.approver });

        const approvers = [
            // Superior
            getApprover._id,
            // Pak Fajar ( HR Manager )
            "62f8f12d9642bf60ae0a39fb",
            // Fuad Helmy ( CFO )
            '62f8f0fe2038a41d7e0531ba',
        ];

        // Add CFO as approver if travel type is International
        if (getInternationalTravel(req) === "International") {
            // Pak Seno
            approvers.push('62f8e303d2dea36e08985d55');
        }


        // for updated  KTP, DOB, POB, WA
        await CheckAndUpdateUser(req, session);

        // Create approval header
        const approvalhdr = new approval_hdr({
            form_id: getForm._id,
            form_submit_id: formIdRecord,
            uid: muser._id,
            updated_by: muser._id,
            created_by: muser._id,
        });

        // Create array of approval detail documents
        const approval_detail_docs = approvers.map((approver) => ({
            approval_id: approvalhdr._id,
            approved_by: String(approver),
            deputy_approver: deputy_approver(String(approver)),
            status: false,
            updated_by: muser._id,
            created_by: muser._id,
        }));

        // Create a new ttravel_authority
        const newTTravelAuthority = new ttravel_authority({
            id_record: formIdRecord,
            type_travel: getInternationalTravel(req),
            requestor_id: muser._id,
            approval_process_id: approvalhdr._id,
            dispatcher: req.data.dispatcher
        });

        // Calculate total cost estimation
        const totalCostEstimation = req.data.ta_data.reduce((acc, request) => {
            const taCostEst = request.ta_cost_est || [];
            return acc + taCostEst.reduce((total, { total: taCostTotal }) => total + taCostTotal, 0);
        }, 0);

        newTTravelAuthority.t_ta_cost_est_tot = totalCostEstimation;

        // Add t_ta_hdr_id to each request object
        const requestsWithId = req.data.ta_data.map((request) => ({
            ...request,
            t_ta_hdr_id: formIdRecord,
        }))
            .map(separateDatesDeparture);

        // Flatten and format arrays
        const accomodations = requestsWithId
            .map(({ ta_accomodation, user_id }) =>
                (ta_accomodation || []).map((ta_acc) => ({
                    ...ta_acc,
                    user_id,
                    t_ta_user_dtl_id: formIdRecord,
                }))
            )
            .flat()
            .map(separateDates);

        const TaReservation = requestsWithId
            .map(({ ta_reservation, user_id }) =>
                (ta_reservation || []).map((reservation) => ({
                    ...reservation,
                    user_id,
                    t_ta_user_dtl_id: formIdRecord,
                }))
            )
            .flat();

        const TACostEst = requestsWithId
            .map(({ ta_cost_est, user_id }) =>
                (ta_cost_est || []).map((ta_cost) => ({
                    ...ta_cost,
                    user_id,
                    t_ta_user_dtl_id: formIdRecord,
                }))
            )
            .flat();

        // Insert data into collections
        await Promise.all([
            accomodation.insertMany(accomodations, { session }),
            reservation.insertMany(TaReservation, { session }),
            user_cost_est_ta.insertMany(TACostEst, { session }),
            user_ta.insertMany(requestsWithId, { session }),
            newTTravelAuthority.save({ session }),
            approval_dtl.insertMany(approval_detail_docs, { session }),
            approvalhdr.save({ session }),
        ]);

        await session.commitTransaction();
        await session.endSession();

        await NewNotificationForDeputyApprover('TA', 'Travel Authority',
            approval_detail_docs
                .filter(a => a.deputy_approver)
                .map(a => ({ deputy: a.deputy_approver, approver: a.approved_by })),
            formIdRecord,
            muser);

        // Notification to Admin Deparment based unit   
        await NewNotificationToDepartment('TA', 'Travel Authority', formIdRecord, muser, newTTravelAuthority.dispatcher);

        // Send to approver for notification
        await NewNotificationDocToApprover(approvers, 'Travel Authority', `Type Travel : *${getInternationalTravel(req)}*`, `${getWhatsAppLink(muser.company.code)}wf/ta/view/${formIdRecord}`, res, muser)

        return res.send({ code: 200, status: "OK" })

    } catch (error) {

        console.log(error)
        await session.endSession();
        logger.error({
            date: new Date(),
            error: error.toString()
        })

        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }
}

exports.HistoryTravelAuthority = async (req, res) => {

    try {

        let getUser = await musers.findOne({
            email: req.body.email,
        });

        const getListTA = await ttravel_authority
            .find({ requestor_id: getUser._id })
            .select('-created_by -updated_by -updatedAt -__v')
            .populate('requestor_id', 'direct_spv fullname')
            .populate('approval_process_id', 'status')
            .sort({ created_at: -1 });

        return res.send({ code: 200, status: "OK", data: getListTA })

    } catch (error) {

        logger.error({
            date: new Date(),
            error: error.toString()
        })

        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }

}

exports.getPicTA = async (req, res) => {

    try {

        let getUser = await musers.findOne({ email: req.body.email });

        let getForm = await form.findOne({ code: "TA" })

        let getFormSetting = await formSetting.findOne({ Forms: getForm._id, company_by: getUser.company })
            .populate('pic');

        return res.send({ code: 200, status: "OK", data: getFormSetting.pic })

    } catch (error) {

        logger.error({
            date: new Date(),
            error: error.toString()
        })

        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }

}

exports.ViewTravelAuthority = async (req, res) => {

    try {

        const TAView = await ttravel_authority
            .findOne({ id_record: req.query.record_id })
            .populate({
                path: 'requestor_id',
                select: '-__v'
            })
            .populate({
                path: 'approval_process_id',
                select: '-__v',
                populate: [
                    {
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
                    }
                ]
            })
            .populate('comments')
            .populate({
                path: 't_ta_user_dtl',
                populate: [
                    { path: 't_ta_cost_est_dtl', select: '-__v' },
                    { path: 't_ta_rsv_hotel_dtl', select: '-__v' },
                    {
                        path: 't_ta_rsv_dst_dtl',
                        select: '-__v',
                        populate: [{
                            path: 'author_ticket',

                        }, {
                            path: 'user_id',

                        },]
                    },
                    {
                        path: 'user_id', select: '-__v',
                        populate: [{
                            path: 'company',
                        },
                        { path: "level" },
                        { path: "department" }
                        ]
                    }
                ],
                select: '-__v'
            });


        return res.send({ code: 200, status: "OK", data: TAView })

    } catch (error) {

        logger.error({
            date: new Date(),
            error: error.toString()
        })

        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }

}

async function CheckAndUpdateUser(req, session) {

    try {
        for (const user of req.data.ta_data) {
            if (user.user_id) {
                const {
                    no_ktp,
                    date_birth,
                    phone_number,
                    place_of_birth
                } = await musers.findById(user.user_id).session(session);

                if (
                    no_ktp === undefined ||
                    date_birth === undefined ||
                    phone_number === undefined ||
                    place_of_birth === undefined
                ) {
                    if (
                        user.no_ktp &&
                        user.date_birth &&
                        user.phone_number &&
                        user.place_of_birth
                    ) {

                        await musers
                            .findByIdAndUpdate(user.user_id, {
                                no_ktp: user.no_ktp,
                                date_birth: user.date_birth,
                                phone_number: user.phone_number,
                                place_of_birth: user.place_of_birth
                            })
                            .session(session);
                    }
                }
            } else {

                let getRequestor = await musers
                    .findOne({ email: req.email })
                    .session(session);

                let getLevel = await mlevel.findOne({ fullname: user.level })

                let newUser = {
                    fullname: user.fullname,
                    nik: user.no_ktp,
                    no_ktp: user.no_ktp,
                    date_birth: user.date_birth,
                    phone_number: user.phone_number,
                    place_of_birth: user.place_of_birth,
                    employee_status: user.emp_status,
                    roles: ["62b97ff0a39330b31b03edf0"],
                    level: getLevel?._id || '62f8bfb84bf9a334e91abdfa',
                    password:
                        "$2a$10$XwcXftthppnEmN.22dcW3uNshv3wB.Gha0zW8pOC8REdImOCxhd3q",
                    company: getRequestor.company,
                    updated_by: getRequestor.nik,
                    created_by: getRequestor.nik
                };


                let getId = await musers.create([newUser], { session });

                user.user_id = getId[0]._id;

            }
        }

    } catch (error) {
        console.error(error);
        throw error;
    }
}


function deputy_approver(approver) {
    // Deputy Approver
    switch (approver) {
        case '62f8e303d2dea36e08985d55':
            // Bpk Suseno Kramadibrata
            return '10167'; // Tessa

        case '62f8f0fe2038a41d7e0531ba':
            // Bpk Fuad Helmy
            return '10106'; // Dinda

        case '62f8f12d9642bf60ae0a39fb':
            // Bpk Fajar Nugroho
            return '10149'; // Saepul

        case '62f8f10a46cbd3d267106a12':
            // Bpk Muhammad Sulthon
            return '10136'; // Izza

        case '62f8f103054731b2a6b0e7c0':
            // Bpk Herwin Hidayat
            return '10174'; // Ocha

        case '62f8f117f8a7b226ef402d71':
            // Bpk Adika Aryasthana Bakrie
            return '10167'; // Tessa

        case '62f8e30ec11dabfdf505b1a5':
            // Bpk Adrian Wicaksono
            return '10167'; // Tessa

        //Agus Sitindaon
        case '62f8f1e40f53bb7893ba8884':
            return '20140'; //VANIA

        default:
            return null
        // Tidak ada tindakan khusus untuk kasus default
    }
}


function separateDates(reservation) {
    const [accomodation_date_in, accomodation_date_out] = reservation.accomodation_date;

    return {
        ...reservation,
        accomodation_date_in,
        accomodation_date_out
    };
}

function separateDatesDeparture(dept) {
    const [departure_date_start, departure_date_end] = dept.departure;
    return {
        ...dept,
        departure_date_start,
        departure_date_end
    };
}

function getInternationalTravel(data) {

    const reservation = data.data.ta_data.find((item) => {

        return item.ta_reservation && item.ta_reservation.some((reservation) => {
            return reservation.type_travel === "International";
        });
    });


    if (reservation) {
        return "International";
    }

    return 'Domestic';
}
