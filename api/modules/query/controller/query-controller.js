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
        destination,
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
      if (!ObjectId.isValid(destination)) {
        return res.status(400).json({
          message: "Invalid Destination!",
        });
      }

      const existingQuery = await QueryModel.findOne({
        $and: [
          {
            clientAgent: clientAgent,
            destination: destination,
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
        destination,
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
    const page = Math.max(1, parseInt(req.query.page) || 1); // Ensure positive page number
    const limit = Math.max(1, Math.min(parseInt(req.query.limit) || 10, 100)); // Ensure limit is within a reasonable range

    const [queries, totalQueries] = await Promise.all([
      QueryModel.find()
        .populate({ path: "assignTo" })
        .populate({ path: "clientAgent" })
        .populate({ path: "destination" })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      QueryModel.countDocuments(),
    ]);

    res.json({
      queries,
      totalQueries,
      totalPages: Math.ceil(totalQueries / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({
      message: "Oops! Something went wrong",
    });
  }
};


export default {
  addQuery,
  getAllQuery,
};
