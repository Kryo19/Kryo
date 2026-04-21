import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import shipmentsRouter from "./shipments";
import inquiriesRouter from "./inquiries";
import usersRouter from "./users";

const router: IRouter = Router();
router.use(healthRouter);
router.use(authRouter);
router.use(shipmentsRouter);
router.use(inquiriesRouter);
router.use(usersRouter);

export default router;
