const mongoose = require("mongoose");

mongoose.pluralize(null);

const ITBillingTelkomselDtl = mongoose.model(
  "tbil_tsel_dtl",
  new mongoose.Schema(
    {
      periode_upload: {
        type: String,
        required: true
      },
      payment_period: { type: String, required: true },
      kartuhalo_number: { type: String, required: true },
      account_number: { type: String, required: true },
      date: { type: String, required: true },
      time: { type: String, required: true },
      destination_number: { type: String },
      destination_area: { type: String },
      duration: { type: String },
      cost: { type: Number },
      location_area: { type: String },
      updated_by: { type: String },
      created_by: { type: String },
    },
    { timestamps: { createdAt: "created_at" } },
  ) 
);

module.exports = ITBillingTelkomselDtl;
