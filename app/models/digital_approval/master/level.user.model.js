const mongoose = require("mongoose");

mongoose.pluralize(null);

const LevelUser = mongoose.model(
  "mlevel",
  new mongoose.Schema(
    {
      fullname: String,
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

module.exports = LevelUser;
