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
  "/getAllClients",
  tokenValidator,
  ClientAgentController.getAllClients
);

router.get(
  "/getAllAgents",
  tokenValidator,
  ClientAgentController.getAllAgents
);
router.put(
  "/updateClientAgent/:id",
  tokenValidator,
  ClientAgentController.updateClientAgent
);

export default router;
