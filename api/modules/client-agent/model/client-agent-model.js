import mongoose, { Schema } from "mongoose";

const clientAgentSchema = new Schema(
  {
    honorifics: { type: Number },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: Number, required: true },
    countryCode: { type: Number, required: true },
    status: { type: Boolean, default: true },
    country: {
      type: Schema.Types.ObjectId,
      ref: "CountryModel",
      required: true,
    },
    city: {
      type: Schema.Types.ObjectId,
      ref: "CityModel",
      required: true,
    },
    address: { type: String },
    companyName: { type: String },
    gstPan: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ClientAgentModel", clientAgentSchema);
