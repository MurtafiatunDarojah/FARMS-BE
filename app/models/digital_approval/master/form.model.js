const mongoose = require("mongoose");

mongoose.pluralize(null);

const MFormSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      unique: false,
      required: true,
    },
    company_by:
    {
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
  {
    timestamps: { createdAt: "created_at" },
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
)

// For connect header to details.
MFormSchema.virtual("form_setting", {
  ref: 'mformapproval',
  localField: "_id",
  foreignField: "Forms",
  justOne: true
})

const Form = mongoose.model(
  "mform",
  MFormSchema
);

module.exports = Form;
