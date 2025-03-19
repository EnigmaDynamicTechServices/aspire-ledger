import VehicleCategoryModel from "../model/vehicle-category-model.js";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

const addVehicleCategory = async (req, res) => {
  try {
    const { category } = req.body;

    // Check if the request body is empty
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Invalid request" });
    }

    // Check if the category already exists using lean() for better performance
    const existingCategory = await VehicleCategoryModel.findOne({
      category: category,
    }).lean();
    if (existingCategory) {
      return res
        .status(409)
        .json({ message: "Vehicle Category Already Exists" });
    }

    // Save the new category to the database
    const vehicleCategory = new VehicleCategoryModel({ category });
    await vehicleCategory.save();

    // Respond with success
    return res
      .status(201)
      .json({ message: "Vehicle Category Added Successfully" });
  } catch (e) {
    return res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

const getAllVehicleCategories = async (req, res) => {
  try {
    let result = await VehicleCategoryModel.find().lean();
    if (result && result.length > 0) {
      return res.status(200).json({
        message: "Vehicle Categories listed successfully",
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

const updateVehicleCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const { category } = req.body;

    // Validate the request body
    if (!category || typeof category !== "string" || category.trim() === "") {
      return res.status(400).json({
        message: "Invalid category",
      });
    }

    // Validate the ID
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Request Parameter",
      });
    }

    // Attempt to update the hotel category
    const vehicleCategory = await VehicleCategoryModel.findByIdAndUpdate(
      id,
      { category }, // Directly pass the updated field
      { new: true } // Only if the updated data is needed, otherwise remove this
    );

    // Check if the category was found and updated
    if (!vehicleCategory) {
      return res.status(404).json({
        message: "Category does not exist",
      });
    }

    return res.json({
      message: "Category Updated Successfully",
      data: vehicleCategory,
    });
  } catch (e) {
    return res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

const deleteVehicleCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Vehicle Category ID is required.",
      });
    }

    // Validate the ID format
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    // Use findByIdAndDelete and check for result directly
    const deletedVehicleCategory = await VehicleCategoryModel.findByIdAndDelete(
      id,
      {
        lean: true,
      }
    );

    if (!deletedVehicleCategory) {
      return res.status(404).json({
        message: "Vehicle Category not found",
      });
    }

    // Respond immediately after successful deletion
    return res.status(200).json({
      message: "Vehicle Category deleted successfully",
    });
  } catch (e) {
    return res.status(500).json({
      message: "Oops! Something went wrong",
    });
  }
};

export default {
  addVehicleCategory,
  getAllVehicleCategories,
  updateVehicleCategory,
  deleteVehicleCategory,
};
