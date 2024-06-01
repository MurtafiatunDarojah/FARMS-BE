const mongoose = require("mongoose");
const ItemPermit = require('./item_permit.model');

const PermitSchema = new mongoose.Schema(
  {
    permit_type:
    {
      type: String,
      enum: [
        "Hot Space",
        "Limited Work",
        "Work at height",
        "Electric Work",
        "Excavation",
      ],
    },
    id_record: String,
    status: {
      type: String,
      default: "Open",
    },
    user_id: {
      type: String,
      ref: "muser",
      required: true,
    },
    approval_process_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tapproval_hdr",
    },
    weather_condition: String,
    executor: String,
    allowed_employee_name: String,
    direct_supervisor: String,
    work_supervisor: String,
    department_name: String,
    job_type: String,
    job_location: String,
    workers: String,
    activity_description: String,
    execution_time: String,
    issue_date: Date,
    issue_time: String,
    job_start_time: String,
    job_end_time: String,
    overtime_hours: String,
    required_personal_protective_equipment: {
      required: false,
      type: String
    },
    emergency_response_team_number: String,
    notes: {
      required: false,
      type: String
    },
    general_ppe: String,
    specific_ppe: String,
    safety_officer_number: {
      required: false,
      type: String
    },
    emergency_response_availability_number: {
      required: false,
      type: String
    },
    job_status: String,
    job_completion_notes: String,
    request_date: Date,
    heavy_equipment_operator_name: String,
    heavy_equipment_supervisor_name: String,
    excavation_location: String,
    heavy_equipment_registration_number: String,
    company_driving_licenses: String, 
    o2: String,
    h2s: String,
    co: String,
    hcn: String,
    waste_produced: {
      type: String,
      required: false,
    },
    updated_by: {
      type: String,
      required: false,
    },
    updated_at: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: { createdAt: "created_at" },
    toJSON: { virtuals: true },
  }
);

async function fillPermitSchema() {
  try {
    const items = await ItemPermit.find({}).exec();

    items.forEach((item) => {
      // Tambahkan properti dengan nilai default false ke skema
      PermitSchema.add({
        ['item_' + item.item_id]: {
          type: Boolean,
          default: false, // Set nilai default ke false
        },
      });
    });

    return PermitSchema;

  } catch (err) {
    console.error("Error:", err);
  }
}

PermitSchema.virtual("user", {
  ref: "muser",
  localField: "user_id",
  foreignField: "nik",
  justOne: true,
});

PermitSchema.virtual("approval_process", {
  ref: "tapproval_hdr",
  localField: "approval_process_id",
  foreignField: "_id",
  justOne: true,
});

PermitSchema.virtual("comments", {
  ref: 'tcomment',
  foreignField: "form_submit_id",
  localField: "id_record",
})

PermitSchema.virtual("validation", {
  ref: "t_validation_permit",
  localField: "id_record",
  foreignField: "id_permit",
});

const Permit = mongoose.model("t_working_permit", PermitSchema);

fillPermitSchema();

// Ekspor model Permit
module.exports = Permit;
