import { Router } from "express";
const router = Router();
import tokenValidator from "../../../middleware/route_protect.js";
import CityController from "../controller/city-controller.js";

router.post("/addCity", tokenValidator, CityController.addCity);
router.get(
    "/getAllCities",
    tokenValidator,
    CityController.getAllCities
);
router.put(
    "/updateCity/:id",
    tokenValidator,
    CityController.updateCity
);
router.delete(
    "/deleteCity/:id",
    tokenValidator,
    CityController.deleteCity
);

export default router;