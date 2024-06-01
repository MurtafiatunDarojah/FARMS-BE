const mongoose = require("mongoose");

mongoose.pluralize(null);

const Company = mongoose.model(
  "mcompany",
  new mongoose.Schema(
    {
      fullname: {
        type: String,
        required: true,
      },
      code: {
        type: String,
        required: true,
      },
      business_entity: {
        type: String,
        required: true,
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
module.exports = Company;
