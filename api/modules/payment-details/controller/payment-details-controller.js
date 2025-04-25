import PaymentDetailsModel from '../model/payment-details-model.js';
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;
import FileUpload from '../../../common/file_upload.js';
import path from "path";



const addPaymentDetails = async (req, res) => {
    try {

        FileUpload.uploadFile(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            const {
                invoice,
                paymentDate,
                amount,
            } = req.body;

            if (!req.file) {
                return res.status(400).json({ message: "File is required!" });
            }

            // Check if the request body is empty
            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({ message: "Invalid request" });
            }

            // Validate the Client/Agent ID format
            if (!ObjectId.isValid(invoice)) {
                return res.status(400).json({
                    message: "Invalid Invoice Id!",
                });
            }

            const existingPaymentDetails = await PaymentDetailsModel.findOne({
                $and: [
                    {
                        invoice: invoice,
                        paymentDate: paymentDate,
                        amount: amount,
                    },
                ],
            }).lean();
            if (existingPaymentDetails) {
                return res.status(409).json({ message: "Payment Details Already Exists" });
            }

            // Construct the full server path
            const filePath = path.normalize(req.file.path); // Normalize the path
            const fullServerPath = `${req.protocol}://${req.get('host')}/${filePath.replace(/\\/g, '/')}`;


            const paymentDetails = new PaymentDetailsModel({
                invoice,
                paymentDate,
                amount,
                file: await req.protocol + '://' + req.get('host') + '/' + req.file.path.replace("\\", "/")
            });
            await paymentDetails.save();

            // Respond with success
            return res.status(201).json({ message: "Payment Details Added Successfully" });

        })

    } catch (e) {
        FileUpload.deleteFile(req);
        return res.status(500).json({
            message: "Something went wrong!",
        });
    }
};


const getAllPaymentDetails = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;


        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid Invoice Id!",
            });
        }
        const paymentDetails = await PaymentDetailsModel.find({ invoice: req.params.id })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();
        const totalPayments = await PaymentDetailsModel.countDocuments();

        return res.status(200).json({
            message: paymentDetails.length
                ? "Payment Details listed successfully"
                : "No details found!",
            data: paymentDetails,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalPayments / limit),
                totalItems: totalPayments,
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
    addPaymentDetails,
    getAllPaymentDetails,
};