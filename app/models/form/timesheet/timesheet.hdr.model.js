const mongoose = require("mongoose");

mongoose.pluralize(null);

const TimesheetHeaderSchema = new mongoose.Schema(
  {
    uid:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "muser",
    },
    approval_process_id:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tapproval_hdr",
    },
    form_submit_id:
    {
      type: String,
      unique: true,
      ref: "ttimesheet_dtl",
    },
    year: {
      type: String,
      required: true,
    },
    date_from: {
      type: String,
      required: true,
    },
    date_to: {
      type: String,
      required: true,
    },
    day_count: {
      type: String,
      required: true,
    },
    total_work: {
      type: String,
      required: true,
    },
    total_site: {
      type: String,
      required: true,
    },
    total_sick: {
      type: String,
      required: true,
    },
    total_leave: {
      type: String,
      required: true,
    },
    total_permit: {
      type: String,
      required: true,
    },
    total_home_base: {
      type: String,
      required: true,
    },
    created_by: {
      type: String,
      required: true,
    },
    updated_by: {
      type: String,
      required: true,
    },
    updated_at: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: { createdAt: "created_at" },
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
)

// For connect Timesheet to Approval.
TimesheetHeaderSchema.virtual("approval_process", {
  ref: 'tapproval_hdr',
  localField: "approval_process_id",
  foreignField: "_id",
  justOne: true
})

// For connect Timesheet Header Details.
TimesheetHeaderSchema.virtual("details_old", {
  ref: 'ttimesheet_dtl',
  localField: "form_submit_id",
  foreignField: "form_submit_id",
})

TimesheetHeaderSchema.virtual("details", {
  ref: 'ttimesheet_dtl',
  localField: "_id",
  foreignField: "ts_header_id",
})

TimesheetHeaderSchema.virtual("comments", {
  ref: 'tcomment',
  localField: "form_submit_id",
  foreignField: "form_submit_id",
})

const TimesheetMaster = mongoose.model(
  "ttimesheet_hdr",
  TimesheetHeaderSchema
);



module.exports = TimesheetMaster;
