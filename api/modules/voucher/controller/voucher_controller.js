import VoucherModel from "../model/voucher_model.js";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;


export const createVoucher = async (req, res) => {
    try {

        // Check if the request body is empty
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "Invalid request. Request body is empty." });
        }

        const {
            query,
            hotel,
            checkInDate,
            checkOutDate,
            roomDetails,
            mealPlan,
            inclusions,
        } = req.body;

        // Validate required ObjectId fields
        if (![query].every(id => ObjectId.isValid(id))) {
            return res.status(400).json({ message: "Invalid ID(s) provided" });
        }

        // Check for existing voucher
        const existingVoucher = await VoucherModel.findOne({ query }).select('_id').lean();

        if (existingVoucher) {
            return res.status(409).json({ message: "Voucher Already Exists" });
        }


        const newVoucher = new VoucherModel(
            {
                query,
                hotel,
                checkInDate,
                checkOutDate,
                roomDetails,
                mealPlan,
                inclusions,
            }
        )
        await newVoucher.save();

        return res.status(201).json({ message: "Voucher Created Successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong! Please try again later.",
        });
    }
};

const getAllVoucher = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const vouchers = await VoucherModel.find()
        .populate({
            path: "query",
            select: "_id clientAgent adult child",
            populate: {
                path: "clientAgent",
                select: "_id honorifics firstName lastName",
            },
        }).populate({
            path: "hotel",
            select: "_id name address",
        })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();
        const totalVouchers = await VoucherModel.countDocuments();

        return res.status(200).json({
            message: vouchers.length
                ? "Vouchers listed successfully"
                : "No voucher found!",
            data: vouchers,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalVouchers / limit),
                totalItems: totalVouchers,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: "Something went wrong! Please try again later.",
        });
    }
};

export default {
    createVoucher,
    getAllVoucher,
};