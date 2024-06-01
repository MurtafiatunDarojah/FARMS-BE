const mongoose = require("mongoose");

mongoose.pluralize(null);

const tapproval_header_schema = new mongoose.Schema(
  {
    approval_settings:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "mformapproval",
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tcomment',
      },
    ],
    form_id:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "mform",
      required: true,
    },
    approval_list_id: //disable
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tapproval_dtl",
    },
    approver: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "muser",
        required: true,
      },
    ],
    form_submit_id:
    {
      type: String,
      unique: true
    },
    uid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "muser",
    },
    // for save forms id, using for show doc on pending approvals, because maybe form many type
    id_form_header:
    {
      type: mongoose.Schema.Types.ObjectId,
    },
    approval_key: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["Reject", "Waiting Approval", "Approved", "Cancel", "Closed"],
      default: "Waiting Approval",
    },
    updated_by: {
      type: String,
      required: true,
    },
    created_by: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_at" },
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
)

// Connect Header to Detail
tapproval_header_schema.virtual("detail", {
  ref: 'tapproval_dtl',
  localField: "_id",
  foreignField: "approval_id",
})

const TApproval_Header = mongoose.model(
  "tapproval_hdr",
  tapproval_header_schema
);

module.exports = TApproval_Header;
