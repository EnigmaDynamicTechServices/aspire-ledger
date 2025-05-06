import { Router } from "express";
const router = Router();
import tokenValidator from "../../../middleware/route_protect.js";
import VoucherController from "../controller/voucher_controller.js";

router.post("/createVoucher", tokenValidator, VoucherController.createVoucher);
router.get(
    "/getAllVoucher/:id",
    tokenValidator,
    VoucherController.getAllVoucher
);
router.put('/updateVoucher/:id', tokenValidator, VoucherController.updateVoucher);
router.delete('/deleteVoucher/:id', tokenValidator, VoucherController.deleteVoucher);

export default router;