import { Router } from "express";
const router = Router();
import tokenValidator from "../../../middleware/route_protect.js";
import VehicleCategoryController from "../controller/vehicle-category-controller.js";

//Vehicle Category Routes
router.post(
  "/addVehicleCategory",
  tokenValidator,
  VehicleCategoryController.addVehicleCategory
);
router.get(
  "/getAllVehicleCategories",
  tokenValidator,
  VehicleCategoryController.getAllVehicleCategories
);
router.put(
  "/updateVehicleCategory/:id",
  tokenValidator,
  VehicleCategoryController.updateVehicleCategory
);
router.delete(
  "/deleteVehicleCategory/:id",
  tokenValidator,
  VehicleCategoryController.deleteVehicleCategory
);

export default router;
