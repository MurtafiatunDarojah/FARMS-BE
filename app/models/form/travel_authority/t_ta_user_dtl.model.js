const mongoose = require("mongoose");

const TUserSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "muser",
    },
    expense_type: {
      type: String,
      required: true
    },
    departure_date_start: {
      type: String,
      required: true
    },
    departure_date_end: {
      type: String,
      required: true
    },
    objective: {
      type: String,
      required: true
    },
    reason_for_travel: {
      type: String,
      required: true
    },
    reason_for_travel_other: {
      type: String,
      required: false
    },
    t_ta_hdr_id: {
      type: String,
      required: true
    },
    updated_remarks: {
      type: String,
      required: false
    },
    updated_by: {
      type: String,
      required: false
    },
    updated_at: {
      type: String,
      required: false
    }
  },
  {
    timestamps: { createdAt: "created_at" },
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

TUserSchema.virtual("muser", {
  ref: "muser",
  localField: "user_id",
  foreignField: "_id",
  justOne: false,
});

TUserSchema.virtual("t_ta_cost_est_dtl", {
  ref: "t_ta_cost_est_dtl",
  localField: "t_ta_hdr_id",
  foreignField: "t_ta_user_dtl_id",
  justOne: false,
});

TUserSchema.virtual("t_ta_rsv_hotel_dtl", {
  ref: "t_ta_rsv_hotel_dtl",
  localField: "t_ta_hdr_id",
  foreignField: "t_ta_user_dtl_id",
  justOne: false,
});

TUserSchema.virtual("t_ta_rsv_dst_dtl", {
  ref: "t_ta_rsv_dst_dtl",
  localField: "t_ta_hdr_id",
  foreignField: "t_ta_user_dtl_id",
  justOne: false,
});

const TUser = mongoose.model("t_ta_user_dtl", TUserSchema);

module.exports = TUser;
