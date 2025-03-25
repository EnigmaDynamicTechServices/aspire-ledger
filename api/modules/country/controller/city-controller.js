import CityModel from "../model/city-model.js";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;


const addCity = async (req, res) => {
    try {
        const { name, country } = req.body;


        if (!name || typeof name !== "string" || name.trim() === "") {
            return res.status(400).json({ message: "Invalid City!" });
        }
        // Validate the Country Id
        if (!ObjectId.isValid(country)) {
            return res.status(400).json({
                message: "Invalid Country!",
            });
        }

        const existingCity = await CityModel.findOne({
            name: name,
        }).lean();

        if (existingCity) {
            return res.status(409).json({ message: "City Already Exists" });
        }

        const city = new CityModel({ name, country });
        await city.save();

        // Respond with success
        return res.status(201).json({ message: "City Added Successfully" });
    } catch (e) {
        return res.status(500).json({
            message: "Oops! Something went wrong!",
        });
    }
};

const getAllCities = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const cities = await CityModel.find()
        .populate({
            path: 'country',
            select : '_id, name'
        })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();
        const totalCities = await CityModel.countDocuments();

        return res.status(200).json({
            message: cities.length
                ? "Cities listed successfully"
                : "No city found!",
            data: cities,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCities / limit),
                totalItems: totalCities,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: "Oops! Something went wrong!",
        });
    }
};

const updateCity = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, country } = req.body;

        // Check if the request body is empty
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "Invalid request" });
        }

        if (!name || typeof name !== "string" || name.trim() === "") {
            return res.status(400).json({ message: "Invalid City!" });
        }

        // Validate the Country
        if (!ObjectId.isValid(id) || !ObjectId.isValid(country)) {
            return res.status(400).json({
                message: "Invalid Country!",
            });
        }


        const city = await CityModel.findByIdAndUpdate(
            id,
            {
                name,
                country
            }, // Directly pass the updated field
            { new: true } // Only if the updated data is needed, otherwise remove this
        );

        if (!city) {
            return res.status(404).json({
                message: "City does not exist",
            });
        }

        return res.json({
            message: "City Updated Successfully",
            data: city,
        });
    } catch (e) {
        return res.status(500).json({
            message: "Something went wrong!",
        });
    }
};

const deleteCity = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: "City ID is required.",
            });
        }

        // Validate the ID format
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid ID format",
            });
        }

        // Use findByIdAndDelete and check for result directly
        const deletedCity = await CityModel.findByIdAndDelete(id, {
            lean: true,
        });

        if (!deletedCity) {
            return res.status(404).json({
                message: "City not found",
            });
        }

        // Respond immediately after successful deletion
        return res.status(200).json({
            message: "City deleted successfully",
        });
    } catch (e) {
        print(e);
        return res.status(500).json({
            message: "Oops! Something went wrong",
        });
    }
};


export default {
    addCity,
    getAllCities,
    updateCity,
    deleteCity,
};