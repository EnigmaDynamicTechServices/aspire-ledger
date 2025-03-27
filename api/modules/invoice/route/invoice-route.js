import { Router } from "express";
const router = Router();
import tokenValidator from "../../../middleware/route_protect.js";
import InvoiceController from "../controller/invoice-controller.js";


router.post("/createInvoice", tokenValidator, InvoiceController.createInvoice);
router.get(
    "/getAllInvoice",
    tokenValidator,
    InvoiceController.getAllInvoice
);

export default router;