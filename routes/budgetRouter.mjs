import { Router } from "express";
import BudgetService from "../controllers/BudgetService.mjs";
import TokenServices from "../services/TokenServices.mjs";
const TokensServicesInstance = new TokenServices();
const router = Router();

const BudgetServiceInstance = new BudgetService();

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (app, passport) => {
  app.use("/api/comercial/", router);

  router.get("/all-budgets", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const response = await BudgetServiceInstance.getAllBudgets();

        if (!response) {
          res.status(404).json(response);
        } else {
          res.status(200).json(response);
        }
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });
  router.get("/next-budget", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const responseNextBudget = await BudgetServiceInstance.getNextBudget();

        let lastBudget;
        if (responseNextBudget.codeStatus === 404) {
          lastBudget = 0;
        } else {
          lastBudget = parseInt(JSON.stringify(responseNextBudget.budget));
        }
        switch (responseNextBudget.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              codeStatus: responseNextBudget.codeStatus,
              message: responseNextBudget.messageError,
              lastNumber: lastBudget,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              message: responseNextBudget.message,
              lastNumber: lastBudget,
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

  router.post("/new-budget", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const budgetInfo = req.body;

        const responseBudget = await BudgetServiceInstance.createBudget(
          budgetInfo
        );

        switch (responseBudget.codeStatus) {
          case 400:
            res.status(400).json(responseBudget);
            break;
          case 200:
            res.status(200).json(responseBudget);
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
  router.put("/up-itens/:idBudget", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idBudget = parseInt(req.params.idBudget);
        const dataBudget = req.body;

        const responseBudget = await BudgetServiceInstance.updateBudgetItens(
          idBudget,
          dataBudget
        );

        switch (responseBudget.codeStatus) {
          case 404:
            res.status(404).json(responseBudget);
            break;
          case 200:
            res.status(200).json(responseBudget);
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
  router.put("/up-budget/:idBudget", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const dataBudget = req.body;

        const responseBudget = await BudgetServiceInstance.updateBudget(
          dataBudget
        );

        switch (responseBudget.codeStatus) {
          case 404:
            res.status(404).json(responseBudget);
            break;
          case 200:
            res.status(200).json(responseBudget);
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
  router.put("/up-budget/new-client/:idClient", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const newClientId = req.body;
        const responseBudget = await BudgetServiceInstance.updateBudgetClient(
          newClientId
        );

        switch (responseBudget.codeStatus) {
          case 404:
            res.status(404).json(responseBudget);
            break;
          case 200:
            res.status(200).json(responseBudget);
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

  router.get("/info-budgets/:idBudget", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idBudget = parseInt(req.params.idBudget);

        const itemsByBudget = await BudgetServiceInstance.getItemsByIdBudget(
          idBudget
        );

        switch (itemsByBudget.codeStatus) {
          case 404:
            res.status(404).json(itemsByBudget);
            break;
          case 200:
            res.status(200).json(itemsByBudget);
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
