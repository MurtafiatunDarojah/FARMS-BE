const mongoose = require("mongoose");

const PermitItemSchema = new mongoose.Schema(
    {
        item_id: String,
        name: String,
        category: String,
        type: String,
        mandatory: {
            default: false,
            typtype: Boolean,
        },
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

const ItemPermit = mongoose.model("m_item_permit", PermitItemSchema);

module.exports = ItemPermit;
