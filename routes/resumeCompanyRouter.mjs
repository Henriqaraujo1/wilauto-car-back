import { Router } from "express";
import InvoiceService from "../controllers/info/InvoiceService.mjs";
import ExpenseInfoService from "../controllers/info/ExpenseInfoService.mjs";
import ProfitService from "../controllers/info/ProfitService.mjs";
import StockInfoService from "../controllers/info/StockInfoService.mjs";
import TokenServices from "../services/TokenServices.mjs";
const TokensServicesInstance = new TokenServices();

const router = Router();
const InvoiceServiceInstance = new InvoiceService();
const InfoExpenseInstance = new ExpenseInfoService();
const ProfitServiceInstance = new ProfitService();
const StockInfoInstance = new StockInfoService();
// eslint-disable-next-line import/no-anonymous-default-export
export default (app) => {
  app.use("/api/resume", router);

  // Rota de faturamento
  router.get("/invoice", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const infoDate = req.query.infoDate;

        const resumeCompany = {
          success: {},
          errors: {},
        };

        const [orders, stock, expenses] = await Promise.all([
          InvoiceServiceInstance.getResumeOrders(infoDate),
          InvoiceServiceInstance.getResumeStockIn(infoDate),
          InvoiceServiceInstance.getResumeExpenses(infoDate),
        ]);

        const allStatus200 = [orders, stock, expenses].every(
          (result) => result.codeStatus === 200
        );
        const noStatus404 = [orders, stock, expenses].every(
          (result) => result.codeStatus !== 404
        );

        if (allStatus200 && noStatus404) {
          resumeCompany.success.infoOrders = orders;
          resumeCompany.success.infoStockEntry = stock;
          resumeCompany.success.infoExpense = expenses;
          res.status(200).json(resumeCompany.success);
        } else {
          // Caso contrário, atribuir os resultados a errors e enviar resposta com status 500
          resumeCompany.errors = {
            infoOrders: orders,
            infoStockEntry: stock,
            infoExpense: expenses,
          };
          res.status(404).json(resumeCompany.errors);
        }
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });
  // Rota de Despesas
  router.get("/expense", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const infoDate = req.query.infoDate;
        const resumeExpense = {
          success: {},
          errors: {},
        };

        const [expensePayed, expenseNoPayed] = await Promise.all([
          InfoExpenseInstance.getExpensePayed(infoDate),
          InfoExpenseInstance.getExpenseNoPayed(infoDate),
        ]);

        const allStatus200 = [expenseNoPayed, expensePayed].every(
          (result) => result.codeStatus === 200
        );
        const noStatus404 = [expenseNoPayed, expensePayed].every(
          (result) => result.codeStatus !== 404
        );

        if (allStatus200 && noStatus404) {
          resumeExpense.success.expensePayed = expensePayed;
          resumeExpense.success.expenseNoPayed = expenseNoPayed;
          res.status(200).json(resumeExpense.success);
        } else {
          // Caso contrário, atribuir os resultados a errors e enviar resposta com status 500
          resumeExpense.errors = {
            expensePayed: expensePayed,
            expenseNoPayed: expenseNoPayed,
          };
          res.status(404).json(resumeExpense.errors);
        }
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });

  // Rota de Lucro
  router.get("/profit", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const infoDate = req.query.infoDate;
        const resumeProfit = {
          success: {},
          errors: {},
        };
        const [infoProfit] = await Promise.all([
          ProfitServiceInstance.getProfitResume(infoDate),
        ]);

        const allStatus200 = [infoProfit].every(
          (result) => result.codeStatus === 200
        );
        const noStatus404 = [infoProfit].every(
          (result) => result.codeStatus !== 404
        );

        if (allStatus200 && noStatus404) {
          resumeProfit.success.infoProfit = infoProfit;

          res.status(200).json(resumeProfit.success);
        } else {
          // Caso contrário, atribuir os resultados a errors e enviar resposta com status 500
          resumeProfit.errors = {
            infoProfit: infoProfit,
          };
          res.status(404).json(resumeProfit.errors);
        }
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });

  // Rota de Estoque
  router.get("/info-stock", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const stockNow = await StockInfoInstance.getInfoStockNow();

        console.log(stockNow)

        switch (stockNow.codeStatus) {
          case 404:
            res.status(stockNow.codeStatus).json(stockNow);
            break;
          case 200:
            res.status(stockNow.codeStatus).json(stockNow);
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

  router.get("/info-stock-moviments", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const infoDate = req.query.infoDate;
        const resumeCompanyStock = {};

        const [stockOrders, stockOut] = await Promise.all([
          StockInfoInstance.getInfoStockOrder(infoDate),
          StockInfoInstance.getInfoStockOut(infoDate),
        ]);

        resumeCompanyStock.infoStockOrders = stockOrders;
        resumeCompanyStock.infoStockOut = stockOut;

        res.status(200).json(resumeCompanyStock);
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });
};
