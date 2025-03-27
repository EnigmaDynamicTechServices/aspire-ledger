import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema;

const tokenModelSchema = new Schema({
  token: {
    type: String,
    unique: true,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "UserModel",
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

export default model("usertoken", tokenModelSchema);
