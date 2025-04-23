import mongoose, { Schema } from "mongoose";

const voucherSchema = new Schema(
    {
        query: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "QueryModel" },
        bookingID: { type: String }, //Auto Generate
        hotel: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "HotelModel" },
        checkInDate: { type: Date, default: Date.now },
        checkOutDate: { type: Date, default: Date.now },
        roomDetails: [
            {
                roomType: { type: String, required: true },
                noOfRooms: { type: Number, required: true },
                extraBed: { type: Number, default: 0 },
            }
        ],
        mealPlan: { type: Number, required: true },
        inclusions: { type: Array, required: true },
    },
    { timestamps: true }
);

export default mongoose.model("VoucherModel", voucherSchema);