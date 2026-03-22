import { Router, type IRouter } from "express";
import healthRouter from "./health";
import quoteRequestsRouter from "./quoteRequests";
import quotesRouter from "./quotes";
import invoicesRouter from "./invoices";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(quoteRequestsRouter);
router.use(quotesRouter);
router.use(invoicesRouter);
router.use(dashboardRouter);

export default router;
