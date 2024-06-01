const mongoose = require("mongoose");

mongoose.pluralize(null);

const TTravelAuthoritySchema = new mongoose.Schema(
  {
    id_record: {
      type: String,
      required: true,
    },
    t_ta_cost_est_tot: {
      type: Number,
      required: true,
    },
    type_travel: {
      type: String,
      enum: ["Domestic", "International", "Accomodation"],
      required: true,
    },
    requestor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "muser",
      required: true,
    },
    dispatcher: {
      type: String,
      ref: "muser",
      required: true,
    },
    approval_process_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tapproval_hdr",
    },
  },
  {
    timestamps: { createdAt: "created_at" },
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

TTravelAuthoritySchema.virtual("approval_process", {
  ref: "tapproval_hdr",
  localField: "approval_process_id",
  foreignField: "_id",
  justOne: true,
});

TTravelAuthoritySchema.virtual("requestor", {
  ref: "muser",
  localField: "requestor_id",
  foreignField: "_id",
  justOne: true,
});

TTravelAuthoritySchema.virtual("dispatcher_ta", {
  ref: "muser",
  localField: "dispatcher",
  foreignField: "nik",
  justOne: true,
});

TTravelAuthoritySchema.virtual("t_ta_user_dtl", {
  ref: "t_ta_user_dtl",
  localField: "id_record",
  foreignField: "t_ta_hdr_id",
});

TTravelAuthoritySchema.virtual("t_ta_cost_est_dtl", {
  ref: "t_ta_cost_est_dtl",
  localField: "id_record",
  foreignField: "t_ta_user_dtl_id",
});

TTravelAuthoritySchema.virtual("comments", {
  ref: 'tcomment',
  foreignField: "form_submit_id",
  localField: "id_record",
})

const TTravelAuthority = mongoose.model(
  "t_ta_hdr",
  TTravelAuthoritySchema
);

module.exports = TTravelAuthority;
