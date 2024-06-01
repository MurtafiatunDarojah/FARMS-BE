const mongoose = require("mongoose");

const ResponsibleAreaSchema = new mongoose.Schema(
    {
        location: String,
        responsible: String,
        number_phone: String,
        company_code: String,
        updated_by: {
            type: String,
            required: false
        },
        updated_at: {
            type: String,
            required: false
        },
        status: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: { createdAt: "created_at" },
        toJSON: { virtuals: true },
    }
);

const ResponsibleArea = mongoose.model("m_responsible_area", ResponsibleAreaSchema);

module.exports = ResponsibleArea;
