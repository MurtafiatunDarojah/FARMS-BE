    const mongoose = require('mongoose');

mongoose.pluralize(null);

// Define the Mongoose schema for hias_attachment
const hiasAttachmentSchema = new mongoose.Schema({
    file_name: String,
    file_url: String,
    id_record: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
},
    {
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    });

const HiasAttachment = mongoose.model('m_hias_attachment', hiasAttachmentSchema);

module.exports = HiasAttachment;