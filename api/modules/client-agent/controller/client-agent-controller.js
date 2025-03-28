import ClientAgentModel from "../model/client-agent-model.js";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

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

const getAllClients = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const clientAgents = await ClientAgentModel.find({
      companyName: {
        $or: [
          { companyName: null },
          { companyName: "" },
          { companyName: { $exists: false } }
        ]
      }
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
        ? "Clients listed successfully"
        : "No client found!",
      data: clientAgents,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalClientAgents / limit),
        totalItems: totalClientAgents,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "An internal server error occurred.",
    });
  }
};


const getAllAgents = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const clientAgents = await ClientAgentModel.find({
      companyName: {
        companyName: { $nin: [null, ""] },
        companyName: { $exists: true }
      }
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
        ? "Agents listed successfully"
        : "No agent found!",
      data: clientAgents,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalClientAgents / limit),
        totalItems: totalClientAgents,
      },
    });
  } catch (error) {
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

export default {
  addClientAgent,
  getAllClients,
  getAllAgents,
  updateClientAgent,
};
