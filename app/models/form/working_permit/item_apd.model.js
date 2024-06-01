const mongoose = require("mongoose");

const MatrixAPDItemSchema = new mongoose.Schema(
    {
        name: String,
        category: String,
        active: String,
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

const ItemAPD = mongoose.model("m_apd", MatrixAPDItemSchema);

module.exports = ItemAPD;
