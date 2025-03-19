import PermissionModel from "../model/permission_model.js";
import CustomStrings from "../../common/custom_strings.js";

/**
 * Validates the permission creation request body.
 * @param {object} body - The request body to validate.
 * @returns {object} - The result of the validation.
 */
const validatePermission = (body) => {
  const schema = Joi.object({
    path: Joi.string().required().label("path"),
    method: Joi.string().required().label("method"),
    name: Joi.string().required().label("name"),
  });
  return schema.validate(body);
};

export async function createPermission(req, res) {
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(CustomStrings.STATUS_CODE_400).json({
        message: CustomStrings.INVALID_REQUEST_BODY,
      });
    }

    // Validate request body
    const { error } = validatePermission(req.body);
    if (error) {
      return res.status(CustomStrings.STATUS_CODE_400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    let permission = new PermissionModel(req.body);
    await permission.save();
    return res.json({
      message: CustomStrings.PERMISSION_CREATED_SUCCESSFULLY,
    });
  } catch (e) {
    ErrorHandler.catchErrors(res, e, CustomStrings.PERMISSION);
  }
}

const updatePermission = async (req, res) => {
  try {
    const id = req.params.id;
    if (Object.keys(req.body).length === 0) {
      return res.status(CustomStrings.STATUS_CODE_400).json({
        message: CustomStrings.INVALID_REQUEST_BODY,
      });
    }
    if (!ObjectId.isValid(id)) {
      return res.status(CustomStrings.STATUS_CODE_404).json({
        message: CustomStrings.PERMISSION_DOES_NOT_EXISTS,
      });
    }
    let permission = await PermissionModel.findByIdAndUpdate(id, req.body);
    if (!permission) {
      return res.status(CustomStrings.STATUS_CODE_404).json({
        message: CustomStrings.PERMISSION_DOES_NOT_EXISTS,
      });
    }
    return res.json({
      message: CustomStrings.PERMISSION_UPDATED_SUCCESSFULLY,
    });
  } catch (e) {
    ErrorHandler.catchErrors(res, e, CustomStrings.PERMISSION);
  }
};

const getPermissions = async (req, res) => {
  try {
    var mysort = { name: 1 };
    let permissions = await PermissionModel.find().sort(mysort);
    if (permissions != null && permissions.length > 0) {
      return res.json({
        message: CustomStrings.PERMISSION_FETCHED_SUCCESSFULLY,
        data: permissions,
      });
    } else {
      return res.status(CustomStrings.STATUS_CODE_404).json({
        message: CustomStrings.PERMISSION_NOT_FOUND,
      });
    }
  } catch (e) {
    return res.status(CustomStrings.STATUS_CODE_500).json({
      message: CustomStrings.SOMETHING_WENT_WRONG,
    });
  }
};

const getPermissionsWithLimit = async (req, res) => {
  try {
    const limit = req.params.limit;
    if (!limit) {
      return res.status(CustomStrings.STATUS_CODE_500).json({
        message: CustomStrings.SOMETHING_WENT_WRONG,
      });
    }
    const sortCallback = { name: 1 };
    let permissions = await PermissionModel.find()
      .limit(limit)
      .sort(sortCallback);
    if (permissions != null && permissions.length > 0) {
      return res.json({
        message: CustomStrings.PERMISSION_FETCHED_SUCCESSFULLY,
        data: permissions,
      });
    } else {
      return res.status(CustomStrings.STATUS_CODE_404).json({
        message: CustomStrings.PERMISSION_NOT_FOUND,
      });
    }
  } catch (e) {
    return res.status(CustomStrings.STATUS_CODE_500).json({
      message: CustomStrings.SOMETHING_WENT_WRONG,
    });
  }
};

const getPermissionById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(CustomStrings.STATUS_CODE_404).json({
        message: CustomStrings.PERMISSION_DOES_NOT_EXISTS,
      });
    }
    let permission = await PermissionModel.findById(id);
    if (permission) {
      return res.json({
        message: CustomStrings.PERMISSION_FETCHED_SUCCESSFULLY,
        data: permission,
      });
    } else {
      return res.status(CustomStrings.STATUS_CODE_404).json({
        message: CustomStrings.PERMISSION_NOT_FOUND,
      });
    }
  } catch (e) {
    return res.status(CustomStrings.STATUS_CODE_500).json({
      message: CustomStrings.SOMETHING_WENT_WRONG,
    });
  }
};

const deletePermission = async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(CustomStrings.STATUS_CODE_404).json({
        message: CustomStrings.PERMISSION_DOES_NOT_EXISTS,
      });
    }
    const permission = await PermissionModel.findByIdAndDelete(id);
    if (!permission) {
      return res.status(CustomStrings.STATUS_CODE_404).json({
        message: CustomStrings.PERMISSION_DOES_NOT_EXISTS,
      });
    }
    return res.json({
      message: CustomStrings.PERMISSION_DELETED_SUCCESSFULLY,
    });
  } catch (e) {
    return res.status(CustomStrings.STATUS_CODE_500).json({
      message: CustomStrings.SOMETHING_WENT_WRONG,
    });
  }
};

export default {
  createPermission,
  updatePermission,
  getPermissions,
  getPermissionsWithLimit,
  getPermissionById,
  deletePermission,
};
