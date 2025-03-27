import RoleModel from "../model/role_model.js";
import CustomStrings from "../../common/custom_strings.js";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

const createRole = async (req, res) => {
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(CustomStrings.STATUS_CODE_400).json({
        message: CustomStrings.INVALID_REQUEST_BODY,
      });
    }
    let role = new RoleModel(req.body);
    await role.save();
    return res.json({
      message: CustomStrings.ROLE_CREATED_SUCCESSFULLY,
    });
  } catch (e) {
    ErrorHandler.catchErrors(res, e, CustomStrings.ROLE);
  }
};

const updateRole = async (req, res) => {
  try {
    const id = req.params.id;
    if (Object.keys(req.body).length === 0) {
      return res.status(CustomStrings.STATUS_CODE_400).json({
        message: CustomStrings.INVALID_REQUEST_BODY,
      });
    }
    if (!ObjectId.isValid(id)) {
      return res.status(CustomStrings.STATUS_CODE_404).json({
        message: CustomStrings.ROLE_DOES_NOT_EXISTS,
      });
    }
    let role = await RoleModel.findByIdAndUpdate(id, req.body);
    if (!role) {
      return res.status(CustomStrings.STATUS_CODE_404).json({
        message: CustomStrings.ROLE_DOES_NOT_EXISTS,
      });
    }
    return res.json({
      message: CustomStrings.ROLE_UPDATED_SUCCESSFULLY,
    });
  } catch (e) {
    ErrorHandler.catchErrors(res, e, CustomStrings.ROLE);
  }
};

const getRoles = async (req, res, next) => {
  try {
    let roles;
    if (next.user.role.name === process.env.MAIN_ROLE) {
      roles = await RoleModel.find()
        .populate({
          path: "inheritedRole",
          populate: {
            path: "permissions",
          },
        })
        .populate({
          path: "permissions",
        });
    } else {
      roles = await RoleModel.find({ name: { $ne: process.env.MAIN_ROLE } })
        .populate({
          path: "inheritedRole",
          populate: {
            path: "permissions",
          },
        })
        .populate({
          path: "permissions",
        });
    }
    if (roles != null && roles.length > 0) {
      return res.json({
        message: CustomStrings.ROLE_FETCHED_SUCCESSFULLY,
        data: roles,
      });
    } else {
      return res.status(CustomStrings.STATUS_CODE_404).json({
        message: CustomStrings.ROLE_NOT_FOUND,
      });
    }
  } catch (e) {
    return res.status(CustomStrings.STATUS_CODE_500).json({
      message: CustomStrings.SOMETHING_WENT_WRONG,
    });
  }
};

const getRolesExceptMain = async (req, res) => {
  try {
    let roles = await RoleModel.find({ name: { $ne: "Super Admin" } })
      .populate({
        path: "inheritedRole",
        populate: {
          path: "permissions",
        },
      })
      .populate({
        path: "permissions",
      });
    if (roles != null && roles.length > 0) {
      return res.json({
        message: CustomStrings.ROLE_FETCHED_SUCCESSFULLY,
        data: roles,
      });
    } else {
      return res.status(CustomStrings.STATUS_CODE_404).json({
        message: CustomStrings.ROLE_NOT_FOUND,
      });
    }
  } catch (e) {
    return res.status(CustomStrings.STATUS_CODE_500).json({
      message: CustomStrings.SOMETHING_WENT_WRONG,
    });
  }
};

const getRoleById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(CustomStrings.STATUS_CODE_404).json({
        message: CustomStrings.ROLE_DOES_NOT_EXISTS,
      });
    }
    let role = await RoleModel.findById(id)
      .populate({
        path: "inheritedRole",
        populate: {
          path: "permissions",
        },
      })
      .populate({
        path: "permissions",
      });
    if (role) {
      return res.json({
        message: CustomStrings.ROLE_FETCHED_SUCCESSFULLY,
        data: role,
      });
    } else {
      return res.status(CustomStrings.STATUS_CODE_404).json({
        message: CustomStrings.ROLE_NOT_FOUND,
      });
    }
  } catch (e) {
    console.log(e);
    return res.status(CustomStrings.STATUS_CODE_500).json({
      message: CustomStrings.SOMETHING_WENT_WRONG,
    });
  }
};

const getRoleByName = async (req, res) => {
  try {
    const roleName = req.params.name;

    let role = await RoleModel.findOne({ name: roleName })
      .populate({
        path: "inheritedRole",
        populate: {
          path: "permissions",
        },
      })
      .populate({
        path: "permissions",
      });
    if (role) {
      return res.json({
        message: CustomStrings.ROLE_FETCHED_SUCCESSFULLY,
        data: role,
      });
    } else {
      return res.status(CustomStrings.STATUS_CODE_404).json({
        message: CustomStrings.ROLE_NOT_FOUND,
      });
    }
  } catch (e) {
    console.log(e);
    return res.status(CustomStrings.STATUS_CODE_500).json({
      message: CustomStrings.SOMETHING_WENT_WRONG,
    });
  }
};

const deleteRole = async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(CustomStrings.STATUS_CODE_404).json({
        message: CustomStrings.ROLE_DOES_NOT_EXISTS,
      });
    }
    const role = await RoleModel.findByIdAndDelete(id);
    if (!role) {
      return res.status(CustomStrings.STATUS_CODE_404).json({
        message: CustomStrings.ROLE_DOES_NOT_EXISTS,
      });
    }
    return res.json({
      message: CustomStrings.ROLE_DELETED_SUCCESSFULLY,
    });
  } catch (e) {
    return res.status(CustomStrings.STATUS_CODE_500).json({
      message: CustomStrings.SOMETHING_WENT_WRONG,
    });
  }
};

export default {
  createRole,
  updateRole,
  getRoles,
  getRolesExceptMain,
  getRoleById,
  getRoleByName,
  deleteRole,
};
