//Uma rota unica que busca os valores de um Fornecedor passado pelo front
import { Router } from "express";
import ResumeProviderService from "../controllers/ResumeProviderService.mjs";
import TokenServices from "../services/TokenServices.mjs";
const TokensServicesInstance = new TokenServices();
const router = Router();

const ResumeProviderServiceInstance = new ResumeProviderService();

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (app) => {
  app.use("/api/financial/financial-entry-order", router);

  router.get("/:idProvider", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        // Busca as informações de pedido desse cliente
        const idProvider = req.params.idProvider;
        const infoProviderEntryOrders =
          await ResumeProviderServiceInstance.getInfoOrdersByProvider(
            idProvider
          );

        switch (infoProviderEntryOrders.codeStatus) {
          case 404:
            res.status(404).json(infoProviderEntryOrders);
            break;
          case 200:
            res.status(200).json(infoProviderEntryOrders);
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

  router.get("/items-order/:idStockEntry", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idStockEntry = parseInt(req.params.idStockEntry);
        const infoItemsEntryOrders =
          await ResumeProviderServiceInstance.getItemsByOrder(idStockEntry);

        switch (infoItemsEntryOrders.codeStatus) {
          case 404:
            res.status(404).json(infoItemsEntryOrders);
            break;
          case 200:
            res.status(200).json(infoItemsEntryOrders);
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
  router.get("/payments/:idStockEntry", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idStockEntry = parseInt(req.params.idStockEntry);

        const infoItemsEntryOrders =
          await ResumeProviderServiceInstance.getPaymentsByOrder(idStockEntry);

        switch (infoItemsEntryOrders.codeStatus) {
          case 404:
            res.status(404).json(infoItemsEntryOrders);
            break;
          case 200:
            res.status(200).json(infoItemsEntryOrders);
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
