import mongoose, { Schema } from "mongoose";

const hotelCategorySchema = new Schema(
  {
    id: { type: String},
    name: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("HotelCategoryModel", hotelCategorySchema);