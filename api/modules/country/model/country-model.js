import mongoose, { Schema } from "mongoose";

const countrySchema = new Schema(
  {
    name: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("CountryModel", countrySchema);
