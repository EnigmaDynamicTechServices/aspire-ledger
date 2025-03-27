import mongoose, { Schema } from "mongoose";

const citySchema = new Schema(
    {
        id: { type: String },
        country: {
            type: Schema.Types.ObjectId,
            ref: "CountryModel",
            required: true,
        },
        name: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("CityModel", citySchema);