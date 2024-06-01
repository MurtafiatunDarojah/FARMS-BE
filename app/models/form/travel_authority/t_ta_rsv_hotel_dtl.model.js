const mongoose = require("mongoose");

mongoose.pluralize(null);

const TaReservationHotelSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "muser",
        },
        t_ta_user_dtl_id: {
            type: String,
            required: true,
        },
        accomodation : {
            type: String,
            required: true,
        },
        accomodation_date_in: {
            type: Date,
            required: true,
        },
        accomodation_date_out: {
            type: Date, 
            required: true,
        },
        price_estimation: {
            type: Number,
            required: false,
        },
    },
    {
        timestamps: { createdAt: "created_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

// One to Many
TaReservationHotelSchema.virtual("muser", {
    ref: "muser",
    localField: "user_id",
    foreignField: "_id",
    justOne: true,
});

const TaReservationHotel = mongoose.model("t_ta_rsv_hotel_dtl", TaReservationHotelSchema);

module.exports = TaReservationHotel;
