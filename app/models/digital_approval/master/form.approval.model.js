const mongoose = require("mongoose");

mongoose.pluralize(null);

const FormApproval = mongoose.model(
  "mformapproval",
  new mongoose.Schema(
    {
      Forms:
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "mform",
      },
      direct_spv: { type: Boolean, required: true },
      approved_by: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "muser",
        },
      ],
      pic: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "muser",
      }],
      company_by:
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "mcompany",
      },
      company_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "mcompany",
      },
      created_by: {
        type: String,
        required: true,
      },
      updated_by: {
        type: String,
        required: true,
      },
    },
    { timestamps: { createdAt: "created_at" } }
    
  )
);

module.exports = FormApproval;
