import { Router } from "express";
const router = Router();
import tokenValidator from "../../../middleware/route_protect.js";
import PaymentDetailsController from "../controller/payment-details-controller.js";


router.post("/addPaymentDetails", tokenValidator, PaymentDetailsController.addPaymentDetails);
router.get(
    "/getAllPaymentDetails/:id",
    tokenValidator,
    PaymentDetailsController.getAllPaymentDetails
);

export default router;