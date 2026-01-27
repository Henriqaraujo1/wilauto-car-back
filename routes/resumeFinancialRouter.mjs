import { Router } from "express";
import FinancialService from "../controllers/FinancialService.mjs";
import TokenServices from "../services/TokenServices.mjs";
const TokensServicesInstance = new TokenServices();
const router = Router();
const FinancialServiceInstance = new FinancialService();

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (app) => {
  app.use("/api/financial", router);

  router.get("/", async (req, res, next) => {
    const resumeFinancial = {
      orders: {},
    };
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const [totalFinancialDay, financialMonth, allOrders] =
          await Promise.all([
            FinancialServiceInstance.getFinancialDay(),
            FinancialServiceInstance.getFinancialMonth(),
            FinancialServiceInstance.getAllOrders(),
          ]);

        resumeFinancial.totalFinancialDay = totalFinancialDay.resumeToday || 0;
        resumeFinancial.totalFinancialMonth =
          financialMonth.totalByOrders.totalSell;
        resumeFinancial.totalOrdersByMonth =
          financialMonth.totalByOrders.totalOrders;
        resumeFinancial.orders = allOrders;

        res.status(200).json(resumeFinancial);
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });

  router.get("/info-month/", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const infoDate = req.query.infoDate;

        const resumeMonth = await FinancialServiceInstance.getFinancialMonth(
          infoDate
        );

        switch (resumeMonth.codeStatus) {
          case 404:
            res.status(404).json(resumeMonth);
            break;
          case 200:
            res.status(200).json(resumeMonth);
            break;

          default:
            break;
        }
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });
  router.get("/resume-sell/", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const infoDate = req.query.infoDate;

        const resumeMonth = await FinancialServiceInstance.getFinancialResume(
          infoDate
        );

        switch (resumeMonth.codeStatus) {
          case 404:
            res.status(404).json(resumeMonth);
            break;
          case 200:
            res.status(200).json(resumeMonth);
            break;

          default:
            break;
        }

      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });
};
