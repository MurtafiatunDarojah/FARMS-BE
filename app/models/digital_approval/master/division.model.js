const mongoose = require("mongoose");

mongoose.pluralize(null);

const Division = mongoose.model(
  "mdivision",
  new mongoose.Schema(
    {
      name: String,
      created_by: {
        type: String,
        required: true,
      },
      company_by:
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "mcompany",
      },
      updated_by: {
        type: String,
        required: true,
      },
    },
    { timestamps: { createdAt: "created_at" } }
  )
);
module.exports = Division;
