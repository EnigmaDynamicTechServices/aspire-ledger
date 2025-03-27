import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    uId: { type: String },
    fullName: { type: String, required: true },
    mobileNumber: { type: Number, required: true },
    countryCode: { type: Number, required: true },
    email: { type: String, match: /\S+@\S+\.\S+/ },
    isVerified: { type: Boolean, default: false },
    userType: { type: Number, required: true },
    status: { type: Boolean, default: true },
    password: { type: String, required: true },
    image: { type: String, default: "" },
    role: {
      type: Schema.Types.ObjectId,
      ref: "role",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("UserModel", userSchema);
