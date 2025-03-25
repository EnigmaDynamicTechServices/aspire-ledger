import QueryModel from "../model/query-model.js";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;
import FileUpload from '../../../common/file_upload.js';
import RandomQueryIdGenerator from '../../../common/random-query-id-generator.js';
import path from "path";

const addQuery = async (req, res) => {
  try {

    FileUpload.uploadFile(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const {
        clientAgent,
        country,
        startingPoint,
        endingPoint,
        travelMonth,
        fromDate,
        toDate,
        adult,
        child,
        priority,
        assignTo,
        service,
      } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "File is required!" });
      }

      // Check if the request body is empty
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Invalid request" });
      }

      // Validate the Client/Agent ID format
      if (!ObjectId.isValid(clientAgent)) {
        return res.status(400).json({
          message: "Invalid Client/Agent!",
        });
      }

      // Validate the Country ID format
      if (!ObjectId.isValid(country)) {
        return res.status(400).json({
          message: "Invalid Country ID!",
        });
      }

      const existingQuery = await QueryModel.findOne({
        $and: [
          {
            clientAgent: clientAgent,
            country: country,
            travelMonth: travelMonth,
            fromDate: fromDate,
            adult: adult,
          },
        ],
      }).lean();
      if (existingQuery) {
        return res.status(409).json({ message: "Query Already Exists" });
      }
      const queryCode = await RandomQueryIdGenerator.getNextCode();
      console.log("Generated Code:", queryCode);

      // Construct the full server path
      const filePath = path.normalize(req.file.path); // Normalize the path
      const fullServerPath = `${req.protocol}://${req.get('host')}/${filePath.replace(/\\/g, '/')}`;

      // Store or use the fullServerPath as needed
      console.log('Full server path:', fullServerPath);

      const query = new QueryModel({
        queryId: queryCode,
        clientAgent,
        country,
        startingPoint,
        endingPoint,
        travelMonth,
        fromDate,
        toDate,
        adult,
        child,
        priority,
        assignTo,
        service,
        file: await req.protocol + '://' + req.get('host') + '/' + req.file.path.replace("\\", "/")
      });
      await query.save();

      // Respond with success
      return res.status(201).json({ message: "Query Added Successfully" });

    })

  } catch (e) {
    FileUpload.deleteFile(req);
    return res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

const getAllQuery = async (req, res) => {
  try {
      const { page = 1, limit = 10 } = req.query;
      const queries = await QueryModel.find()
        .populate([
          { path: "clientAgent", select: "_id honorifics firstName lastName companyName mobile countryCode" },
          { path: "country", select: "_id name" },
          { path: "assignTo", select: "_id fullName" },
        ])
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean();
      const totalQueries = await QueryModel.countDocuments();
  
      return res.status(200).json({
        message: queries.length
          ? "Queries listed successfully"
          : "No query found!",
        data: queries,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalQueries / limit),
          totalItems: totalQueries,
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: "An internal server error occurred.",
      });
    }
};


export default {
  addQuery,
  getAllQuery,
};
