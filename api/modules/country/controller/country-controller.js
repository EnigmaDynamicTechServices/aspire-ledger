import CountryModel from "../model/country-model.js";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

const addCountry = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate input
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ message: "Invalid country!!" });
    }

    const existingCountry = await CountryModel.findOne({
      name: name,
    }).lean();
    if (existingCountry) {
      return res.status(409).json({ message: "Country Already Exists" });
    }

    const country = new CountryModel({ name });
    await country.save();

    // Respond with success
    return res.status(201).json({ message: "Country Added Successfully" });
  } catch (e) {
    return res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

const getAllCountries = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const countries = await CountryModel.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();
    const totalCountries = await CountryModel.countDocuments();

    return res.status(200).json({
      message: countries.length
        ? "Countries listed successfully"
        : "No country found!",
      data: countries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCountries / limit),
        totalItems: totalCountries,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "An internal server error occurred.",
    });
  }
};

const updateCountry = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Validate the ID
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Request Parameter",
      });
    }

    // Check if the request body is empty
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const country = await CountryModel.findByIdAndUpdate(
      id,
      {
        name,
      }, // Directly pass the updated field
      { new: true } // Only if the updated data is needed, otherwise remove this
    );

    if (!country) {
      return res.status(404).json({
        message: "Country does not exist",
      });
    }

    return res.json({
      message: "Country Updated Successfully",
      data: country,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

const deleteCountry = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Country ID is required.",
      });
    }

    // Validate the ID format
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    // Use findByIdAndDelete and check for result directly
    const deletedCountry = await CountryModel.findByIdAndDelete(id, {
      lean: true,
    });

    if (!deletedCountry) {
      return res.status(404).json({
        message: "Country not found",
      });
    }

    // Respond immediately after successful deletion
    return res.status(200).json({
      message: "Country deleted successfully",
    });
  } catch (e) {
    print(e);
    return res.status(500).json({
      message: "Oops! Something went wrong",
    });
  }
};

export default {
  addCountry,
  getAllCountries,
  updateCountry,
  deleteCountry,
};
