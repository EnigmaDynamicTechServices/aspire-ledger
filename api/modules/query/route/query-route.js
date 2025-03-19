import { Router } from "express";
const router = Router();
import tokenValidator from "../../../middleware/route_protect.js";
import QueryController from "../controller/query-controller.js";


router.post("/addQuery", tokenValidator, QueryController.addQuery);
router.get(
    "/getAllQuery",
    tokenValidator,
    QueryController.getAllQuery
);

export default router;