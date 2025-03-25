import mongoose, { Schema } from "mongoose";

const hotelSchema = new Schema(
  {
    id: { type: String },
    name: { type: String, required: true },
    hotelCategory: {
      type: Schema.Types.ObjectId,
      ref: "HotelCategoryModel",
      required: true,
    },
    contactPerson: { type: String, required: true },
    contactNumber: { type: Number, required: true },
    countryCode: { type: Number, required: true },
    countryId: {
      type: Schema.Types.ObjectId,
      ref: "CountryModel",
      required: true,
    },
    cityId: {
      type: Schema.Types.ObjectId,
      ref: "CityModel",
      required: true,
    },
    address: { type: String, required: true },
    image: { type: String, default: "" },
    email: { type: String, required: true },
    website: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("HotelModel", hotelSchema);
