const mongoose = require("mongoose");

mongoose.pluralize(null);

const Application = mongoose.model(
  "mapplication",
  new mongoose.Schema(
    {
      app_id: {
        type: String,
        unique: true,
        required: true,
      },
      name: {
        type: String,
        required: true,
        text: true
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
    { timestamps: { createdAt: "created_at" }},
  )

);
module.exports = Application;
