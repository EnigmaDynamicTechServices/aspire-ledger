import ClientAgentModel from "../model/client-agent-model.js";
import QueryModel from "../../query/model/query-model.js";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;
import CustomStrings from "../../../common/custom_strings.js";

const addClientAgent = async (req, res) => {
  try {
    const {
      honorifics,
      firstName,
      lastName,
      email,
      mobile,
      countryCode,
      country,
      city,
      address,
      companyName,
      gstPan,
      status,
    } = req.body;

    // Check if the request body is empty
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Invalid request" });
    }

    // Validate the Country ID format
    if (!ObjectId.isValid(country)) {
      return res.status(400).json({
        message: "Invalid Country!",
      });
    }

    // Validate the City ID format
    if (!ObjectId.isValid(city)) {
      return res.status(400).json({
        message: "Invalid City!",
      });
    }

    const existingClientAgent = await ClientAgentModel.findOne({
      $or: [
        { email: email.toLowerCase() }, // Normalize email to lowercase for case-insensitive search
        {
          $and: [
            {
              mobile: mobile,
            },
            {
              countryCode: countryCode,
            },
          ],
        },
      ],
    }).lean();
    if (existingClientAgent) {
      return res.status(409).json({ message: "Client/Agent Already Exists" });
    }

    const clientAgent = new ClientAgentModel({
      honorifics,
      firstName,
      lastName,
      email,
      mobile,
      countryCode,
      country,
      city,
      address,
      companyName,
      gstPan,
      status,
    });
    await clientAgent.save();

    // Respond with success
    return res.status(201).json({ message: "Client/Agent Added Successfully" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

const getAllClientAgent = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const clientAgents = await ClientAgentModel.find({
    })
      .populate({
        path: 'country',
        select: '_id, name'
      })
      .populate({
        path: 'city',
        select: '_id, name'
      })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();
    const totalClientAgents = await ClientAgentModel.countDocuments();

    return res.status(200).json({
      message: clientAgents.length
        ? "Client/Agent listed successfully"
        : "No data found!",
      data: clientAgents,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalClientAgents / limit),
        totalItems: totalClientAgents,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An internal server error occurred.",
    });
  }
};


const updateClientAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      honorifics,
      firstName,
      lastName,
      email,
      mobile,
      countryCode,
      country,
      city,
      address,
      companyName,
      gstPan,
      status,
    } = req.body;

    // Check if the request body is empty
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Invalid request" });
    }

    // Validate the ID
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Request Parameter",
      });
    }

    // Validate the Country ID format
    if (!ObjectId.isValid(country)) {
      return res.status(400).json({
        message: "Invalid Country!",
      });
    }

    // Validate the City ID format
    if (!ObjectId.isValid(city)) {
      return res.status(400).json({
        message: "Invalid City!",
      });
    }

    const clientAgent = await ClientAgentModel.findByIdAndUpdate(
      id,
      {
        honorifics,
        firstName,
        lastName,
        email,
        mobile,
        countryCode,
        country,
        city,
        address,
        companyName,
        gstPan,
        status,
      }, // Directly pass the updated field
      { new: true } // Only if the updated data is needed, otherwise remove this
    );

    if (!clientAgent) {
      return res.status(404).json({
        message: "Client/Agent does not exist",
      });
    }

    return res.json({
      message: "Client/Agent Updated Successfully",
      data: clientAgent,
    });
  } catch (e) {
    return res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

const deleteClientAgent = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Request Parameter",
      });
    }

    // Check if the clientAgent ID is referenced in Query model
    const queryExists = await QueryModel.exists({ clientAgentId: id });

    let result;

    if (queryExists) {
      // Soft delete
      result = await ClientAgentModel.findByIdAndUpdate(
        id,
        { status: false },
        { new: true }
      );
    } else {
      // Hard delete
      result = await ClientAgentModel.findByIdAndDelete(id);
    }

    if (!result) {
      return res.status(CustomStrings.STATUS_CODE_404).json({
        message: CustomStrings.CLIENT_AGENT_DOES_NOT_EXISTS,
      });
    }

    return res.json({
      message: CustomStrings.CLIENT_AGENT_DELETED_SUCCESSFULLY,
    });
  } catch (e) {
    console.error("Error deleting client agent:", e); // Optional: log for debugging
    return res.status(500).json({
      message: CustomStrings.SOMETHING_WENT_WRONG,
    });
  }
};


export default {
  addClientAgent,
  getAllClientAgent,
  updateClientAgent,
  deleteClientAgent
};
