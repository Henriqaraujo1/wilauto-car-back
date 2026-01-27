import { Router, json } from "express";
import ExpenseService from "../controllers/ExpenseService.mjs";
import TokenServices from "../services/TokenServices.mjs";
const TokensServicesInstance = new TokenServices();
const router = Router();
const ExpenseServiceInstance = new ExpenseService();

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (app) => {
  app.use("/api/financial/expense", router);
  router.use(json());

  //Buscar e validar Todos os despesas
  router.get("/", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const responseGetAllExpense =
          await ExpenseServiceInstance.getAllExpense();

        switch (responseGetAllExpense.codeStatus) {
          case 400:
            res.status(400).json(responseGetAllExpense);
            break;
          case 200:
            res.status(200).json(responseGetAllExpense);
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
  // Busca as depesas do mes que o usuario escolher
  router.get("/info-month", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const infoMonth = req.query.infoDate;

        const expensesByMonth = await ExpenseServiceInstance.getExpensesByMonth(
          infoMonth
        );

        switch (expensesByMonth.codeStatus) {
          case 404:
            res.status(404).json(expensesByMonth);
            break;
          case 200:
            res.status(200).json(expensesByMonth);
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
  //Buscar e validar por recebedor
  router.get("get-receiver/:idReceiver", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const NameReceiver = req.body.NameReceiver;
        const responseExpenseByReceiver =
          await ExpenseServiceInstance.getExpenseByReceiver(NameReceiver);
        switch (responseExpenseByReceiver.codeStatus) {
          case 400:
            res.status(400).json({
              errorStatus: true,
              codeStatus: responseExpenseByReceiver.codeStatus,
              message: responseExpenseByReceiver.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              message: responseExpenseByReceiver.message,
              expense: responseExpenseByReceiver.expense,
            });
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
  //Buscar expenseos pelo tipo de expenseo
  router.get("getType/:idExpense", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const TypeExpense = req.body.TypeExpense;
        const responseGetTypeExpense =
          await ExpenseServiceInstance.getTypeExpense(TypeExpense);
        switch (responseGetTypeExpense.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              codeStatus: responseGetTypeExpense.codeStatus,
              message: responseGetTypeExpense.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              message: responseGetTypeExpense.message,
              expense: responseGetTypeExpense.expense,
            });
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
  //Criar um novo expenseo
  router.post("/new-expense", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const dataExpense = req.body;
        const responsePostExpense = await ExpenseServiceInstance.createExpense(
          dataExpense
        );
        switch (responsePostExpense.codeStatus) {
          case 400:
            res.status(400).json(responsePostExpense);
            break;
          case 200:
            res.status(200).json(responsePostExpense);
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
  //Buscar e alterar um expense
  router.put("/:idExpense", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idExpense = parseInt(req.params.idExpense);
        const data = req.body;

        const responseUpdateExpense =
          await ExpenseServiceInstance.updateExpense(idExpense, data);

        switch (responseUpdateExpense.codeStatus) {
          case 404:
            res.status(404).json(responseUpdateExpense);
            break;
          case 200:
            res.status(200).json(responseUpdateExpense);
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
  router.put("/provider/:idExpense", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idExpense = parseInt(req.params.idExpense);
        const data = req.body;

        const responseUpdateExpense =
          await ExpenseServiceInstance.updateExpenseByProvider(idExpense, data);

        switch (responseUpdateExpense.codeStatus) {
          case 404:
            res.status(404).json(responseUpdateExpense);
            break;
          case 200:
            res.status(200).json(responseUpdateExpense);
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
  //Buscar e apagar um expenseo
  router.delete("/:idExpense", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idExpense = parseInt(req.params.idExpense);
        const responseDeleteExpense =
          await ExpenseServiceInstance.deleteExpense(idExpense);

        switch (responseDeleteExpense.codeStatus) {
          case 400:
            res.status(400).json({
              errorStatus: true,
              codeStatus: responseDeleteExpense.codeStatus,
              message: responseDeleteExpense.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              message: responseDeleteExpense.message,
            });
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
