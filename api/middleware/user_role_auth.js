import { Admin } from "../models/user/admin_model";
import { deleteFile } from "./file_upload";

// Middleware to check if the super admin has the required role for account creation
const registerAdminRoleAuth = (roles) => {
  return async (req, res, next) => {
    const saId = req.id;

    // Check if the super admin ID exists
    if (!saId) {
      deleteFile(req.file); // Delete the uploaded file if no saId is provided
      return res.status(401).json({
        message: "Unauthorized access!",
      });
    }

    try {
      // Find the super admin by ID
      const superAdmin = await Admin.findById(saId);
      if (!superAdmin) {
        deleteFile(req.file);
        return res.status(400).json({
          message: "User does not exist!",
        });
      }

      // Check if the super admin has one of the required roles
      if (roles.includes(superAdmin.role)) {
        return next();
      } else {
        deleteFile(req.file);
        return res.status(403).json({
          message: "Sorry! You are not authorized to create accounts",
        });
      }
    } catch (error) {
      deleteFile(req.file);
      console.error("Error in authorization middleware: ", error);
      return res.status(500).json({
        message: "Internal server error!",
      });
    }
  };
};

export default {
  registerAdminRoleAuth,
};
