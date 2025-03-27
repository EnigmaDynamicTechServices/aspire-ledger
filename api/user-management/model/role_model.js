import mongoose, { Schema } from "mongoose";

const roleModelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    permissions: [{ type: Schema.Types.ObjectId, ref: "PermissionModel" }],
    inheritedRole: { type: Schema.Types.ObjectId, ref: "RoleModel" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("RoleModel", roleModelSchema);
