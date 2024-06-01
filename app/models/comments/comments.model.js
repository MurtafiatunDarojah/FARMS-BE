const mongoose = require("mongoose");

mongoose.pluralize(null);

const Comment = mongoose.model(
  "tcomment",
  new mongoose.Schema(
    {
      uid:
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "muser",
      },
      form_submit_id:
      {
        type: String,
        required: true,
      },
      text_plain: {
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
module.exports = Comment;
