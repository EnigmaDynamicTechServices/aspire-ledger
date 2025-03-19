import HotelCategoryModel from "../model/hotel-category-model.js";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

const addHotelCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // Check if the request body is empty
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Invalid request" });
    }

    // Check if the category already exists using lean() for better performance
    const existingCategory = await HotelCategoryModel.findOne({
      name: name,
    }).lean();
    if (existingCategory) {
      return res.status(409).json({ message: "Hotel Category Already Exists" });
    }

    // Save the new category to the database
    const hotelCategory = new HotelCategoryModel({ name });
    await hotelCategory.save();

    // Respond with success
    return res
      .status(201)
      .json({ message: "Hotel Category Added Successfully" });
  } catch (e) {
    return res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

const getAllHotelCategory = async (req, res) => {
  try {
    let result = await HotelCategoryModel.find().lean();
    if (result && result.length > 0) {
      return res.status(200).json({
        message: "Hotel Categories listed successfully",
        data: result,
      });
    }
    return res.status(400).json({
      message: "No category found!",
    });
  } catch (e) {
    return res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

const updateHotelCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const { name } = req.body;

    // Validate the request body
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Invalid 'name' field",
      });
    }

    // Validate the ID
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Request Parameter",
      });
    }

    // Attempt to update the hotel category
    const hotelCategory = await CategoryModel.findByIdAndUpdate(
      id,
      { name } // Directly pass the updated field
      //{ new: true } // Only if the updated data is needed, otherwise remove this
    );

    // Check if the category was found and updated
    if (!hotelCategory) {
      return res.status(404).json({
        success: false,
        message: "Category does not exist",
      });
    }

    return res.json({
      success: true,
      message: "Category Updated Successfully",
      data: hotelCategory,
    });
  } catch (e) {
    return res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

const deleteHotelCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Hotel Category ID is required.",
      });
    }

    // Validate the ID format
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    // Use findByIdAndDelete and check for result directly
    const deletedHotelCategory = await HotelCategoryModel.findByIdAndDelete(
      id,
      {
        lean: true,
      }
    );

    if (!deletedHotelCategory) {
      return res.status(404).json({
        message: "Hotel Category not found",
      });
    }

    // Respond immediately after successful deletion
    return res.status(200).json({
      message: "Hotel Category deleted successfully",
    });
  } catch (e) {
    return res.status(500).json({
      message: "Oops! Something went wrong",
    });
  }
};

export default {
  addHotelCategory,
  getAllHotelCategory,
  updateHotelCategory,
  deleteHotelCategory,
};
