const mongoose = require("mongoose");

mongoose.pluralize(null);

const Role = mongoose.model(
  "mrole",
  new mongoose.Schema(
    {
      name: {
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

module.exports = Role;
