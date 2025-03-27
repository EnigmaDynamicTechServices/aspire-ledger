import mongoose, { Schema } from "mongoose";

const invoiceSchema = new Schema(
    {
        query: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "QueryModel" },
        invoiceDate: { type: Date, default: Date.now }, // Auto-set invoice date
        details: [
            {
                description: { type: String, required: true },
                additionalDetails: { type: String, default: "" },
                rate: { type: Number, required: true },
                quantity: { type: Number, required: true },
            }
        ],
        currency: { type: String, default: "USD", required: true },
        discount: { type: Number, default: 0 },
        total: { type: Number, required: true }
    },
    { timestamps: true }
);


export default mongoose.model("InvoiceModel", invoiceSchema);