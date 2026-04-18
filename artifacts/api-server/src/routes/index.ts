import { Router, type IRouter } from "express";
import healthRouter from "./health";
import proxyRouter from "./proxy";
import statusRouter from "./status";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/v1", proxyRouter);
router.use(statusRouter);

export default router;
