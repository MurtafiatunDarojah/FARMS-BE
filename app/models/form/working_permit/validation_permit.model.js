const mongoose = require("mongoose");

const ValidationPermitSchema = new mongoose.Schema(
    {
        id_record: String,
        id_permit: String,
        involved_materials: String,
        safety_equipment: String,
        date: {
            type: Date,
            default: Date.now  // Set the default value to the current date and time
        },
        updated_by: {
            type: String,
            required: false
        },
        updated_at: {
            type: String,
            required: false
        },
    },
    {
        timestamps: { createdAt: "created_at" },
        toJSON: { virtuals: true },
    }
);

ValidationPermitSchema.virtual("permit", {
    ref: "t_validation_permit",
    localField: "id_permit",
    foreignField: "id_record",
    justOne: true,
});


ValidationPermitSchema.virtual("approval_process", {
    ref: "tapproval_hdr",
    localField: "id_record",
    foreignField: "form_submit_id",
    justOne: true,
});

ValidationPermitSchema.virtual("comments", {
    ref: 'tcomment',
    foreignField: "form_submit_id",
    localField: "id_record",
})


const ValidationPermit = mongoose.model("t_validation_permit", ValidationPermitSchema);

module.exports = ValidationPermit;
