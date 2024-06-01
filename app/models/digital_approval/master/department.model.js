const mongoose = require("mongoose");

mongoose.pluralize(null);

const Department = mongoose.model(
  "mdepartment",
  new mongoose.Schema(
    {
      fullname: String,
      code: String,
      created_by: {
        type: String,
        required: true,
      },
      company_by:
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "mcompany",
      },
      division_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "mdivision",
      },
      updated_by: {
        type: String,
        required: true,
      },
      job_positions: [
        {
          uid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'muser'
          },
          order: {
            type: Number,
            required: true
          }
        }
      ]
    },
    { timestamps: { createdAt: "created_at" } }
  )
);
module.exports = Department;
