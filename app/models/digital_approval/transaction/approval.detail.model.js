const mongoose = require("mongoose");

mongoose.pluralize(null);

const TApproval_Detail = mongoose.model(
  "tapproval_dtl",
  new mongoose.Schema(
    {
      approval_settings:
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "mformapproval",
      },
      approval_id:
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tapproval_hdr",
        required: true,
      },
      form_id: //disable
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "mform",
      },
      uid:
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "muser",
      },
      approved_by:
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "muser",
        required: true,
      },
      primary_approver: {
        type: String,
        required: false,
      },
      deputy_approver: {
        type: String,
        required: false,
      },
      id_form_master: //disable
      {
        type: mongoose.Schema.Types.ObjectId,
      },
      //id form per recored
      form_submit_id: { //disable
        type: String,
      },
      status: {
        type: Boolean,
        default: false
      },
      rejected: {
        type: Boolean,
        default: false
      },
      updated_by:
      {
        type: String,
        required: true,
      },
      created_by: {
        type: String,
        required: true,
      },
      approved_at: {
        type: Date,
        default: null,
      },
    },
    { timestamps: { createdAt: "created_at" } }
  )
);

module.exports = TApproval_Detail;
