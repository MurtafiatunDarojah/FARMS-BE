const mongoose = require("mongoose");

mongoose.pluralize(null);

const User = mongoose.model(
  "muser",
  new mongoose.Schema(
    {
      nik: {
        type: String,
        unique: true,
        required: false,
      },
      fullname: {
        type: String,
        required: true,
        text: true
      },
      position: {
        type: String,
        required: true,
      },
      phone_number: {
        type: String,
        required: false,
        default: null
      },
      no_ktp: {
        type: String,
        required: false,
      },
      date_birth: {
        type: String,
        required: false,
      },
      place_of_birth: {
        type: String,
        required: false,
      },
      email: {
        type: String,
        required: false,
      },
      username: {
        type: String,
        required: false,
      },
      position: {
        type: String,
        required: false,
      },
      employee_status: {
        type: String,
        enum: ["Contract", "Permanent", "Contractor", "Internship", "Non Employee"],
        default: "Contract",
      },
      exp_date: {
        type: String,
        required: false,
      },
      password: {
        type: String,
        required: true,
      },
      direct_spv: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "muser",
          required: false
        },
      ],
      roles: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "mrole",
          required: true
        },
      ],
      department:
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "mdepartment",
        required: false
      },
      level:
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "mlevel",
        required: false
      },
      company:
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "mcompany",
        required: true
      },
      created_by: {
        type: String,
        required: true,
      },
      updated_by: {
        type: String,
        required: true,
      },
      active: {
        type: Boolean,
        default: true
      },
      number_phone_activation: {
        type: Boolean,
        default: false,
      }
    },
    { timestamps: { createdAt: "created_at" } }
  )
);
module.exports = User;
