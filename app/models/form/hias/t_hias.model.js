const mongoose = require('mongoose');

mongoose.pluralize(null);

// Define the Mongoose schema for hias
const hiasSchema = new mongoose.Schema({
    id_record: { 
        type: String,
        unique: true
    },
    number_phone: String,
    employee_id: String,
    reporter_name: String,
    report_date: String,
    position: String,
    department_division: String,
    report_time: String,
    current_company: String,
    location: String,
    information_category: String,
    category_suggestions: String,
    observation_results: String,
    direct_cause: String,
    immediate_corrective_actions: String,
    recommendations_improvement_inputs: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    created_by: {
        type: String,
        required: true,
    },
    updated_by: {
        type: String,
        required: true,
    },
},
{
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
});

hiasSchema.virtual("attachments", {
    ref: "m_hias_attachment",
    localField: "id_record",
    foreignField: "id_record",
    justOne: false,
  });

const Hias = mongoose.model('t_hias', hiasSchema);

module.exports = Hias;
