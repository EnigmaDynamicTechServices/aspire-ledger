import mongoose, { Schema } from "mongoose";

const paymentDetailsSchema = new Schema(
    {
        invoice: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "InvoiceModel" },
        paymentDate: { type: Date, required: true },
        file: { type: String, required: true },
        amount: { type: Number, required: true }
    },
    { timestamps: true } // Adds createdAt and updatedAt fields
);


export default mongoose.model("PaymentDetailsModel", paymentDetailsSchema);