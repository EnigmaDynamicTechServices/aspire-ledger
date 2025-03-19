import { Router } from "express";
const router = Router();
import UserController from "../controller/user_controller.js";
import tokenValidator from "../../middleware/route_protect.js";
import RoleController from "../controller/role_controller.js";
import PermissionController from "../controller/permission_controller.js";

router.post("/signup", tokenValidator, UserController.signup);
router.post("/login", UserController.login);
router.get("/getAllUsers", tokenValidator, UserController.getAllUsers);
router.post("/resetPassword", UserController.resetPassword);

router.get("/getRoles", tokenValidator, RoleController.getRoles);
router.get("/getRoleById/:id", tokenValidator, RoleController.getRoleById);

router.get(
  "/getPermissions",
  tokenValidator,
  PermissionController.getPermissions
);

export default router;
