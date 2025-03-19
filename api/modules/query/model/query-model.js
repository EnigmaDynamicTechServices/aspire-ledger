import mongoose, { Schema } from "mongoose";

const querySchema = new Schema(
  {
    queryId: { type: String, required: true, unique: true },
    clientAgent: { type: Schema.Types.ObjectId, required: true, ref: "ClientAgentModel" },
    destination: {
      type: Schema.Types.ObjectId,
      ref: "CountryModel",
      required: true,
    },
    startingPoint: { type: String, required: true },
    endingPoint: { type: String, required: true },
    travelMonth: { type: Number, required: true, min: 1, max: 12 }, //This accepts Month Enum from App
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    adult: { type: Number, required: true, default: 1, min: 1 },
    child: { type: Number, default: 0 },
    priority: { type: Number, default: 0 }, //General or Hot Query
    assignTo: {
      type: Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    }, //Assign to any user
    service: { type: Number, default: 0 }, //Full Package or Vehicle Only or Hotel Only
    file: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

// Adding indexes for faster query performance
querySchema.index({ clientAgent: 1 });
querySchema.index({ destination: 1 });
querySchema.index({ assignTo: 1 });

export default mongoose.model("QueryModel", querySchema);
