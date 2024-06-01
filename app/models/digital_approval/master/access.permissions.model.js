const mongoose = require("mongoose");

mongoose.pluralize(null);

const AccessPermissionsSchema = new mongoose.Schema(
    {
        user_nik: {
            type: String,
            required: true,
        },
        menu: {
            type: String,
            required: true,
        },
        permission: {
            type: String,
            enum: ["Read", "Write"],
        },
        active: {
            type: Boolean,
            required: true,
        },
        role: {
            enum: ["user", "admin"],
        },
        description: {
            type: String,
            required: false,
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

AccessPermissionsSchema.virtual("muser", {
    ref: "maccess_permissions",
    localField: "user_nik",
    foreignField: "nik",
    justOne: true,
});

AccessPermissionsSchema.virtual("mform", {
    ref: "mform",
    localField: "menu",
    foreignField: "code",
    justOne: true,
});

const AccessPermissions = mongoose.model(
    "maccess_permissions",
    AccessPermissionsSchema
);


module.exports = AccessPermissions;
