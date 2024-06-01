const db = require("../../models");

const Form = db.form;
const User = db.user;
const ApprovalDetail = db.approval_detail;
let log = require('../../config/winston')


checkFormSubmitId = (req, res, next) => {
  if (req.body.form_submit_id) {
    // Check form submit is available ?
    next();
  } else {
    res.status(400).send({
      message: `form_submit_id Required!`,
    });
  }
};

checkExecutorApprovedAuthorization = async (req, res, next) => {
  try {
    if (req.body.email && req.body.approval_id_list) {
      let user = await User.findOne(
        { email: req.body.email },
        "_id"
      ).exec();

      let approval_list = await ApprovalDetail.findById(
        req.body.approval_id_list
      );

      if (!approval_list) {
        res.status(404).send({
          message: `Failed! approval list ${req.body.approval_id_list} not found`,
        });
        return;
      }

      // Check if approver not suitable with direct supervisor
      if (user._id != String(approval_list.approved_by)) {
        return res.status(401).send({
          message: "Sorry you dont have permission & reject this form",
        });
      }

      next();
    } else {
      return res.status(400).send({
        message: `executor_id & approval_id_list required! `,
      });
    }
  } catch (error) {
    log.error({
      date: new Date(),
      error:  error.toString()
    })
    return res.status(500).send({ message: error.toString() });
  }
};

checkStatusApprovalList = (req, res, next) => {
  ApprovalDetail.findById(req.body.approval_id_list, "approval_id status")
    .populate("approval_id")
    .exec((err, data) => {

      if (err) {

        log.error({
          date: new Date(),
          error: err.toString()
        })

        res.status(500).send({ message: err });
        return;
      }

      // if status already approved by supervisor
      if (data.status) {
        res.status(500).send({
          message:
            "Sorry Failed, this is already approved by direct supervisor"
        });
        return;
      }

      if (data.approval_id.status === "Waiting Approval" || data.approval_id.status === "Reject") {

        next();

      } else {
        res.status(500).send({
          message:
            "Sorry Failed, approval is status " +
            data.approval_id.status,
        });
        return;
      }
    });
};

checkFormExisted = (req, res, next) => {
  if (req.body.form_code) {
    Form.findOne({
      code: req.body.form_code,
    }).exec((err, form) => {
      if (err) {

        log.error({
          date: new Date(),
          error: err.toString()
        })

        res.status(500).send({ message: err });
        return;
      }

      if (!form) {
        res.status(400).send({
          message: `Failed! Form ${req.body.form_code} does not exist!`,
        });
        return
      }
      next();
    });
  } else {
    return res.status(400).send({
      message: `Form Id Required!`,
    });
  }
};

const verifyActivity = {
  checkFormExisted,
  checkFormSubmitId,
  checkExecutorApprovedAuthorization,
  checkStatusApprovalList,
};

module.exports = verifyActivity;
