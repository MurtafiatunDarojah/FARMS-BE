const mongoose = require("mongoose");

mongoose.pluralize(null);

const TimesheetDetail = mongoose.model(
  "ttimesheet_dtl",
  new mongoose.Schema(
    {
      uid:
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "muser",
      },
      ts_header_id: {
        type: String,
        ref: "ttimesheet_hdr",
      },
      form_submit_id: //disable
      {
        type: String,
        ref: "ttimesheet_hdr",
      },
      ts_row_id_dtl: {
        type: String,
        required: true,
      },
      ts_date_dtl: {
        type: String,
        required: true,
      },
      ts_loc_dtl: {
        type: String,
        required: false,
      },
      ts_reason_dtl: {
        type: String,
        required: false,
      },
      ts_note_dtl: {
        type: String,
        required: false,
      },
      created_by: {
        type: String,
        required: true,
      },
      updated_by: {
        type: String,
        required: true,
      },
    },
    { timestamps: { createdAt: "created_at" } }
  )
);
module.exports = TimesheetDetail;
