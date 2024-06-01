const mongoose = require("mongoose");

mongoose.pluralize(null);

const ITBillingTelkomselMst = mongoose.model(
    "mbil_tsel",
    new mongoose.Schema(
        {
            seq: { type: String, default: null },
            name: { type: String, default: null },
            telp: { type: String, default: null },
            provider: { type: String, default: null },
            business_entity: { type: String, default: null },
            remarks: { type: String, default: null },
            active: { type: Boolean, default: true },
            updated_by: { type: String },
            created_by: { type: String },
        },
        { timestamps: { createdAt: "created_at" } },
    )
);

module.exports = ITBillingTelkomselMst;