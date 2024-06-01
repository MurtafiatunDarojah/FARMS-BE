const mongoose = require("mongoose");

const TACostEstSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tuser",
      required: true
    },
    t_ta_user_dtl_id: {
      type: String,
      required: true,
    },
    item: {
      type: String,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: { createdAt: "created_at" },
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

const TACostEst = mongoose.model("t_ta_cost_est_dtl", TACostEstSchema);

module.exports = TACostEst;
