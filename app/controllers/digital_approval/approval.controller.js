let log = require('../../config/winston');
const db = require("../../models");

const { NotificationCompleteDocToPIC, notificationApproval } = require('../../services/notification.service');

const ApprovalDetail = db.approval_detail;
const ApprovalHeader = db.approval_header;
const Comment = db.comment;
const Form = db.form;
const User = db.user;

exports.getPendingList = async (req, res) => {
  try {

    let email = req.body.email || req.query.email

    const user = await User.findOne({ email: email });

    const getData = await ApprovalDetail.find({
      $or: [
        { approved_by: user._id },
        { deputy_approver: user.nik }
      ]
    })
      .populate("approved_by", "_id uid fullname email")
      .populate([
        {
          path: 'approval_id',
          populate: {
            model: Form,
            path: 'form_id',
          },
        },
        {
          path: 'approval_id',
          select: 'form_id status uid id_form_header form_submit_id',
          populate: {
            model: User,
            path: 'uid',
            select: '_id uid fullname email',
          },
        }
      ])
      .sort({ created_at: -1 })
      .exec();

    return res.send({ code: 200, data: getData })

  } catch (error) {

    log.error({
      date: new Date(),
      error: error.toString()
    })

    return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
  }
};

exports.CancelForm = async (req, res) => {

  // Transaction  
  let session = await db.mongoose.startSession();
  session.startTransaction();

  try {

    const user = await User.findOne({ email: req.body.email }).session(session);

    const getApprovalHead = await ApprovalHeader.findByIdAndUpdate(req.body.approval_id, { status: 'Cancel', updated_by: user._id }).session(session)

    let comment = new Comment({
      uid: user._id,
      form_submit_id: getApprovalHead.form_submit_id,
      text_plain: req.body.msg,
      updated_by: user._id,
      created_by: user._id
    })

    comment.save(session)

    await session.commitTransaction();
    await session.endSession()

    return res.send({ code: 200, status: "OK" })

  } catch (error) {

    await session.endSession()

    log.error({
      date: new Date(),
      error: error.toString()
    })

    return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
  }
}

exports.RejectForm = async (req, res) => {

  // Transaction  
  let session = await db.mongoose.startSession();
  session.startTransaction();

  try {

    const user = await User.findOne({ email: req.body.email }).populate('company').session(session);

    let getApprovalHeader = await ApprovalDetail.findByIdAndUpdate(req.body.approval_id_list, {
      rejected: true
    })
      .populate([{
        path: 'approval_id',
        populate: {
          path: 'form_id',
        },
      },
      {
        path: 'approval_id',
        populate: {
          path: 'uid',
        },
      }])
      .session(session)
      .exec();

    const approval_process = getApprovalHeader.approval_id;

    let comment = new Comment({
      uid: user._id,
      form_submit_id: approval_process.form_submit_id,
      text_plain: req.body.msg,
      updated_by: user._id,
      created_by: user._id
    })

    await ApprovalHeader.findByIdAndUpdate(approval_process._id, { status: 'Reject', updated_by: user._id }).session(session)
    comment.save(session)

    await session.commitTransaction();
    await session.endSession()

    notificationApproval(
      {
        status: 0,
        idDoc: approval_process.id_form_header ? approval_process.id_form_header : approval_process.form_submit_id,
        requestor_number: approval_process.uid.phone_number,
        requestor: approval_process.uid.fullname,
        doc_name: approval_process.form_id.name,
        doc_code: approval_process.form_id.code,
        approver: user.fullname,
        msg: req.body.msg,
        user
      }
    )

    return res.send({ code: 200, status: "OK" })

  } catch (error) {

    await session.endSession()

    log.error({
      date: new Date(),
      error: error.toString()
    })

    return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
  }
}

exports.ApprovedForm = async (req, res) => {

  // Transaction
  let session = await db.mongoose.startSession();
  session.startTransaction();

  try {
    const { email, approval_id_list, msg, deputy } = req.body;

    const user = await User.findOne({ email }).populate('company').session(session);

    const getApprovalHeader = await ApprovalDetail.findByIdAndUpdate(
      approval_id_list,
      {
        status: true,
        approved_at: new Date(),
        deputy_approver: deputy ? user.nik : null
      }
    )
      .populate(
        [{
          path: 'approval_id',
          populate: {
            path: 'form_id',
            populate: {
              path: 'form_setting',
              populate: {
                path: 'pic',
              }
            },
          },
        },
        {
          path: 'approval_id',
          populate: {
            path: 'uid',
          },
        }])
      .session(session)
      .exec();

    await session.commitTransaction();
    await session.endSession();

    await ApprovedComplete(getApprovalHeader, user, msg);

    return res.send({ code: 200, status: "OK" });

  } catch (error) {

    await session.endSession();

    log.error({
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

exports.ApprovedOfficial = async (req, res) => {

  let getHeaderApproval = await ApprovalHeader.findOne({
    approval_key: req.query.approval_key
  })
    .populate('form_id', 'name')
    .populate('uid', 'fullname')
    .populate({
      path: 'detail',
      populate: {
        path: 'approved_by',
      }
    })

  if (!getHeaderApproval) {
    res.status(404).send({
      message: `Failed! approval key not found`,
    });
    return;
  }

  return res.send({ code: 200, status: "OK", data: getHeaderApproval })

}

async function ApprovedComplete(getApprovalHeader, user, msg) {

  const approval_process = getApprovalHeader.approval_id;

  // Mengambil data detail approval yang belum disetujui
  const getApprover = await ApprovalDetail.find({
    approval_id: approval_process._id,
    status: false,
  });

  // Jika tidak ada detail approval yang belum disetujui
  if (getApprover.length === 0) {

    // Mengupdate status ApprovalHeader menjadi "Approved" dan informasi terkait
    await ApprovalHeader.findByIdAndUpdate(approval_process._id, {
      status: 'Approved',
      approval_key: new Date().getTime(),
      updated_by: user._id
    });

    // Jika form memiliki PIC (Person In Charge), mengirim notifikasi kepada PIC
    if (approval_process.form_id.form_setting.pic) {
      NotificationCompleteDocToPIC(
        approval_process.form_id.code,
        approval_process.form_id.form_setting.pic,
        approval_process.form_id.name,
        getApprovalHeader
      );
    }
  }

  // Mengirim notifikasi mengenai persetujuan yang dilakukan pembuat dokumen
  notificationApproval({
    status: 1,
    idDoc: approval_process.id_form_header || approval_process.form_submit_id,
    requestor_number: approval_process.uid.phone_number,
    requestor: approval_process.uid.fullname,
    doc_name: approval_process.form_id.name,
    doc_code: approval_process.form_id.code,
    approver: user.fullname,
    msg,
    user
  });
}

