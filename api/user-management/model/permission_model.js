import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema;

const permissionModelSchema = new Schema(
  {
    path: {
      type: String,
      required: true,
      unique: true,
    },
    method: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("PermissionModel", permissionModelSchema);
