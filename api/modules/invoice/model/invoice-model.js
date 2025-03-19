import mongoose, { Schema } from "mongoose";

const invoiceSchema = new Schema(
    {
        queryId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "QueryModel" },
        invoiceDate: { type: Date, default: Date.now }, // Auto-set invoice date
        details: [
            {
                description: { type: String, required: true },
                additionalDetails: { type: String, default: "" },
                rate: { type: Number, required: true },
                quantity: { type: Number, required: true },
            }
        ],
        paymentDetailsId: { type: mongoose.Schema.Types.ObjectId, ref: "PaymentDetailsModel" },
        discount: { type: Number, default: 0 },
        total: { type: Number, required: true }
    },
    { timestamps: true } // Adds createdAt and updatedAt fields
);


export default mongoose.model("InvoiceModel", invoiceSchema);