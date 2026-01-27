import { Router } from "express";
import ResumeEntryOrderService from "../controllers/ResumeEntryOrdersService.mjs";
import TokenServices from "../services/TokenServices.mjs";
const TokensServicesInstance = new TokenServices();
const router = Router();

const ResumeEntryControlerInstance = new ResumeEntryOrderService();

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (app) => {
  app.use("/api/financial/resume-entry-orders", router);

  router.get("/", async (req, res, next) => {
    const resumeEntryOrders = {
      entryOrders: {},
    };
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const [totalProviders, totalInStock, allEntryOrders] =
          await Promise.all([
            ResumeEntryControlerInstance.getAllProvider(),
            ResumeEntryControlerInstance.getTotalInStock(),
            ResumeEntryControlerInstance.getAllEntryOrders(),
          ]);

          console.log(allEntryOrders)

        resumeEntryOrders.totalProviders = totalProviders.allProviders;
        resumeEntryOrders.totalInStock = totalInStock.totalInStock;
        resumeEntryOrders.entryOrders = allEntryOrders.entryOrders;

        res.status(200).json(resumeEntryOrders);
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });

  router.get("/info-month", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const infoMonth = req.query.infoDate;

        const resumeMonth = await ResumeEntryControlerInstance.getOrdersByMonth(
          infoMonth
        );

        if (resumeMonth.codeStatus === 200) {
          res.status(200).json(resumeMonth);
        } else {
          res.status(resumeMonth.codeStatus).json(resumeMonth);
        }
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });
};
