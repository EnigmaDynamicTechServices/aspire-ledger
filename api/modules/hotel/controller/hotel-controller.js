import HotelModel from "../model/hotel-model.js";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

const addHotel = async (req, res) => {
  try {
    // Check if the request body is empty
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Invalid request. Request body is empty." });
    }

    const {
      name,
      hotelCategory,
      contactPerson,
      contactNumber,
      countryCode,
      countryId,
      cityId,
      address,
      image,
      email,
      website,
    } = req.body;

    // Validate required ObjectId fields
    if (![hotelCategory, countryId, cityId].every(id => ObjectId.isValid(id))) {
      return res.status(400).json({
        message: "Invalid Category, Country, or City ID",
      });
    }

    // Check for existing hotel
    const existingHotel = await HotelModel.findOne({
      name,
      countryId,
      cityId, // Corrected the typo here
    }).lean();

    if (existingHotel) {
      return res.status(409).json({ message: "Hotel Already Exists" });
    }

    // Save the new hotel entry
    const hotel = new HotelModel({
      name,
      hotelCategory,
      contactPerson,
      contactNumber,
      countryCode,
      countryId,
      cityId,
      address,
      image,
      email,
      website,
    });

    await hotel.save();

    return res.status(201).json({ message: "Hotel Added Successfully" });
  } catch (error) {
    console.error("Error in addHotel function:", error.message);

    return res.status(500).json({
      message: "Something went wrong! Please try again later.",
    });
  }
};

const getAllHotels = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const hotels = await HotelModel.find()
      .populate([
        { path: "hotelCategory", select: "_id name" },
        { path: "countryId", select: "_id name" },
        { path: "cityId", select: "_id name" },
      ])
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();
    const totalHotels = await HotelModel.countDocuments();

    return res.status(200).json({
      message: hotels.length
        ? "Hotels listed successfully"
        : "No hotels found!",
      data: hotels,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalHotels / limit),
        totalItems: totalHotels,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "An internal server error occurred.",
    });
  }
};

const updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      hotelCategoryId,
      contactPerson,
      contactNumber,
      countryCode,
      countryId,
      cityId,
      address,
      image,
      email,
      website,
    } = req.body;

    // Validate the ID
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Request Parameter",
      });
    }

    // Attempt to update the hotel category
    const hotel = await HotelModel.findByIdAndUpdate(
      id,
      {
        name,
        hotelCategoryId,
        contactPerson,
        contactNumber,
        countryCode,
        countryId,
        cityId,
        address,
        image,
        email,
        website,
      }, // Directly pass the updated field
      { new: true } // Only if the updated data is needed, otherwise remove this
    ).populate("hotelCategory", "_id name");

    // Check if the category was found and updated
    if (!hotel) {
      return res.status(404).json({
        message: "Hotel does not exist",
      });
    }

    return res.json({
      message: "Hotel Updated Successfully",
      data: hotel,
    });
  } catch (e) {
    return res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

const deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Hotel ID is required.",
      });
    }

    // Validate the ID format
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    // Use findByIdAndDelete and check for result directly
    const deletedHotel = await HotelModel.findByIdAndDelete(id, {
      lean: true,
    });

    if (!deletedHotel) {
      return res.status(404).json({
        message: "Hotel not found",
      });
    }

    // Respond immediately after successful deletion
    return res.status(200).json({
      message: "Hotel deleted successfully",
    });
  } catch (e) {
    return res.status(500).json({
      message: "Oops! Something went wrong",
    });
  }
};

export default {
  addHotel,
  getAllHotels,
  updateHotel,
  deleteHotel,
};
