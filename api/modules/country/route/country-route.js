import { Router } from "express";
const router = Router();
import tokenValidator from "../../../middleware/route_protect.js";
import CountryController from "../controller/country-controller.js";

router.post("/addCountry", tokenValidator, CountryController.addCountry);
router.get(
  "/getAllCountries",
  tokenValidator,
  CountryController.getAllCountries
);
router.put(
  "/updateCountry/:id",
  tokenValidator,
  CountryController.updateCountry
);
router.delete(
  "/deleteCountry/:id",
  tokenValidator,
  CountryController.deleteCountry
);

export default router;
