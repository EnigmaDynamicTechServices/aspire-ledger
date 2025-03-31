import { Router } from "express";
const router = Router();
import tokenValidator from "../../../middleware/route_protect.js";
import ClientAgentController from "../controller/client-agent-controller.js";

router.post(
  "/addClientAgent",
  tokenValidator,
  ClientAgentController.addClientAgent
);
router.get(
  "/getAllClientAgent",
  tokenValidator,
  ClientAgentController.getAllClientAgent
);

router.put(
  "/updateClientAgent/:id",
  tokenValidator,
  ClientAgentController.updateClientAgent
);

export default router;
