import { Router } from "express";
const router = Router();
import tokenValidator from "../../../middleware/route_protect.js";
import HotelCategoryController from "../controller/hotel-category-controller.js";
import HotelController from "../controller/hotel-controller.js";

//Hotel Category Routes
router.post(
  "/addHotelCategory",
  tokenValidator,
  HotelCategoryController.addHotelCategory
);
router.get(
  "/getAllHotelCategory",
  tokenValidator,
  HotelCategoryController.getAllHotelCategory
);
router.put(
  "/updateHotelCategory/:id",
  tokenValidator,
  HotelCategoryController.updateHotelCategory
);
router.delete(
  "/deleteHotelCategory/:id",
  tokenValidator,
  HotelCategoryController.deleteHotelCategory
);

//Hotel Routes
router.post("/addHotel", tokenValidator, HotelController.addHotel);
router.get("/getAllHotels", tokenValidator, HotelController.getAllHotels);
router.put("/updateHotel/:id", tokenValidator, HotelController.updateHotel);
router.delete("/deleteHotel/:id", tokenValidator, HotelController.deleteHotel);

export default router;
