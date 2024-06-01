const mongoose = require("mongoose");

mongoose.pluralize(null);

const SServiceRequestSchema = new mongoose.Schema(
    {
        approval_process_id:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "tapproval_hdr",
        },
        uid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "muser",
        },
        nik: { type: String },
        company: { type: String },
        form_record: { type: String },
        fullname: { type: String },
        position: { type: String },
        employee_status: { type: String},
        department: { type: String },
        phone_number: { type: String },
        emp_status: { type: String },
        type_request: { type: String },
        type_request_explain: { type: String },
        equipment_details: { type: String },
        equipment_details_explain: { type: String },
        account_request: { type: Array },
        account_request_other: { type: String },
        system_request: { type: Array },
        system_request_other : { type: String },
        justification: { type: String },
        description: { type: String },
        login_name: { type: String },
        network_folder: { type: String },
        permission_network_folder: { type: Array },
        communication_access: { type: Array },
        updated_by: { type: String },
        created_by: { type: String },
    },
    {
        timestamps: { createdAt: "created_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    },
)

SServiceRequestSchema.virtual("approval_process", {
    ref: 'tapproval_hdr',
    localField: "approval_process_id",
    foreignField: "_id",
    justOne: true
})

SServiceRequestSchema.virtual("comments", {
    ref: 'tcomment',
    foreignField: "form_submit_id",
    localField: "form_record",
})

const TServiceRequest = mongoose.model(
    "tservicerequest",
    SServiceRequestSchema
);

module.exports = TServiceRequest;