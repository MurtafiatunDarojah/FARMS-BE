const mongoose = require("mongoose");

mongoose.pluralize(null);

const TaReservationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "muser",
    },
    t_ta_user_dtl_id: {
      type: String,
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    from_date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    airline: {
      type: String,
      required: false,
    },
    type_travel: {
      type: String,
      required: true,
    },
    flight_id: {
      type: String,
      required: false,
    },
    ticket_price: {
      type: String,
      required: false,
    },
    seat_class: {
      type: String,
      required: false,
    },
    flight_id: {
      type: String,
      required: false,
    },
    author: {
      type: String,
      required: false,
    },
    e_ticket: {
      type: String,
      required: false,
    },
    updated_by: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: { createdAt: "created_at" },
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

// One to Many
TaReservationSchema.virtual("muser", {
  ref: "muser",
  localField: "user_id",
  foreignField: "_id",
  justOne: true,
});

TaReservationSchema.virtual("author_ticket", {
  ref: "muser",
  localField: "author",
  foreignField: "_id",
  justOne: true,
});


const TaReservation = mongoose.model("t_ta_rsv_dst_dtl", TaReservationSchema);

module.exports = TaReservation;
