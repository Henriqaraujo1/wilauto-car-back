import { Router } from "express";
import CashierService from "../controllers/CashierService.mjs";
import ExpenseService from "../controllers/ExpenseService.mjs";
import FinancialService from "../controllers/FinancialService.mjs";
import HomeService from "../controllers/HomeService.mjs";
import TokenServices from "../services/TokenServices.mjs";
import FormatDates from "../utils/FormatDates.mjs";

const TokensServicesInstance = new TokenServices();
const router = Router();
const ExpenseServiceInstance = new ExpenseService();
const FinancialServiceInstance = new FinancialService();
const FormatDate = new FormatDates();
const HomeServiceInstance = new HomeService();
const CashierServiceInstance = new CashierService();

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (app) => {
  app.use("/api/financial/cashier", router);

  router.get("/", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const response = await CashierServiceInstance.getAllCashier();
        if (!response) {
          res.status(400).json({
            errorStatus: true,
            message: "Erro ao carregar todos os debitos",
          });
        } else {
          res.status(200).json({
            errorStatus: false,
            message: "Os caixas abertos recentementes",
            data: response,
          });
        }
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });
  router.get("/cashier-day", async (req, res, next) => {
    const resumeCashier = {};
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const infoDate = FormatDate.formatDateNoHour(req.query.infoDate);

        const [
          responseCashier,
          responseOrders,
          responseChange,
          responsePayment,
          responseExpense,
        ] = await Promise.all([
          CashierServiceInstance.getCashierDay(infoDate),
          HomeServiceInstance.getOrdersToday(infoDate),
          FinancialServiceInstance.getOrdersByChange(infoDate),
          FinancialServiceInstance.getOrdersByCardByDay(infoDate),
          ExpenseServiceInstance.getExpensePayByDay(infoDate),
        ]);

        resumeCashier.infoCashier = responseCashier;
        resumeCashier.infoOrders = responseOrders;
        resumeCashier.infoChange = responseChange;
        resumeCashier.infoPayment = responsePayment;
        resumeCashier.infoExpense = responseExpense;

        res.status(200).json(resumeCashier);
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });
  router.post("/new-cashier", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const cashier = req.body;

        const responseNewCashier = await CashierServiceInstance.createCashier(
          cashier
        );
        switch (responseNewCashier.codeStatus) {
          case 400:
            res.status(400).json(responseNewCashier);
            break;
          case 200:
            res.status(200).json(responseNewCashier);
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
  router.put("/update-cashier/:idCashier", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idCashier = req.params.idCashier;
        const dataCashier = req.body;

        const responseClosedCashier =
          await CashierServiceInstance.updateCashier(idCashier, dataCashier);

        switch (responseClosedCashier.codeStatus) {
          case 404:
            res.status(404).json(responseClosedCashier);
            break;
          case 200:
            res.status(200).json(responseClosedCashier);
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
  router.delete("cashier/deletecashier/:idCashier", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idCashier = parseInt(req.params.idCashier);
        const response = await CashierServiceInstance.deleteCashier(idCashier);
        if (!response) {
          res.status(404).json({
            errorStatus: true,
            message: "Debito não encontrado",
          });
        } else {
          res.status(200).json({
            errorStatus: false,
            message: "Debito excluido com sucesso",
          });
        }
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });
};
