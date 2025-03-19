import mongoose, { Schema } from "mongoose";

const vehicleCategorySchema = new Schema(
  {
    id: { type: String },
    category: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("VehicleCategoryModel", vehicleCategorySchema);
