import InvoiceModel from '../model/invoice-model.js';
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

export const createInvoice = async (req, res) => {
    try {

        // Check if the request body is empty
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "Invalid request. Request body is empty." });
        }

        const {
            queryId,
            invoiceDate,
            details,
            discount,
            total,
            paymentDetailsId
        } = req.body;

        // Validate required ObjectId fields
        if (![queryId, paymentDetailsId].every(id => ObjectId.isValid(id))) {
            return res.status(400).json({ message: "Invalid ID(s) provided" });
        }

        // Check for existing invoice
        const existingInvoice = await InvoiceModel.findOne({ queryId }).select('_id').lean();

        if (existingInvoice) {
            return res.status(409).json({ message: "Invoice Already Exists" });
        }


        const newInvoice = new InvoiceModel(
            {
                queryId,
                invoiceDate,
                details,
                discount,
                total,
                paymentDetailsId
            }
        )
        await newInvoice.save();

        return res.status(201).json({ message: "Invoice Created Successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong! Please try again later.",
        });
    }
};



const getAllInvoice = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const invoices = await InvoiceModel.find()
            .populate([
                { path: "queryId" },
            ])
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();
        const totalInvoices = await InvoiceModel.countDocuments();

        return res.status(200).json({
            message: invoices.length
                ? "Invoice listed successfully"
                : "No invoice found!",
            data: invoices,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalInvoices / limit),
                totalItems: totalInvoices,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong! Please try again later.",
        });
    }
};


export default {
    createInvoice,
    getAllInvoice,
};