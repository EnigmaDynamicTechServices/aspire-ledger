import mongoose, { Schema } from "mongoose";

const voucherSchema = new Schema(
    {
        query: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "QueryModel" },
        bookingID: { type: String }, //Auto Generate
        hotel: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "HotelModel" },
        checkInDate: { type: Date, default: Date.now },
        checkOutDate: { type: Date, default: Date.now },
        roomType: { type: String, required: true },
        doubleRooms: { type: Number, required: true },
        singleRooms: { type: Number, default: 0 },
        extraBed: { type: Number, default: 0 },
        mealPlan: { type: Number, required: true },
        inclusions: { type: Array, required: true },
    },
    { timestamps: true }
);

export default mongoose.model("VoucherModel", voucherSchema);