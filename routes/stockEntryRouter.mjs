import { Router } from "express";
import StockEntryService from "../controllers/StockEntryService.mjs";
import TokenServices from "../services/TokenServices.mjs";
const TokensServicesInstance = new TokenServices();
const router = Router();

const StockEntryServiceInstance = new StockEntryService();

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (app) => {
  app.use("/api/stock-entry", router);
  //Buscar todos os itens que entraram
  router.get("/", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const responseProductEntry =
          await StockEntryServiceInstance.getAllProductEntryStock();
        switch (responseProductEntry.codeStatus) {
          case 404:
            res.status(400).json({
              errorStatus: true,
              codeStatus: responseProductEntry.codeStatus,
              message: responseProductEntry.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              message: responseProductEntry.message,
              productEntry: responseProductEntry.product,
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

  router.get("/:stockOrder", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idStockEntry = req.params.stockOrder
        let responseProductEntry =
          await StockEntryServiceInstance.getIdStockEntry(idStockEntry);

        switch (responseProductEntry.codeStatus) {
          case 404:
            res.status(404).json(responseProductEntry);
            break;
          case 200:
            res.status(200).json(responseProductEntry);
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

  //Buscar um item do pedido que foi adicionado no estoque
  router.get("/:idProduct", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idProduct = parseInt(req.params.idProduct);
        const responseProductEntry =
          await StockEntryServiceInstance.getProductEntryId(idProduct);

        switch (responseProductEntry.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: responseProductEntry.errorStatus,
              successStatus: responseProductEntry.successStatus,
              codeStatus: responseProductEntry.codeStatus,
              message: responseProductEntry.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: responseProductEntry.errorStatus,
              successStatus: responseProductEntry.successStatus,
              codeStatus: responseProductEntry.codeStatus,
              message: responseProductEntry.message,
              productEntry: responseProductEntry.productEntry,
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

  //Adicionar um produto a entrada de estoque e no estoque
  router.post("/new-entry", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const newProductEntry = req.body;
        const responseStockEntry =
          await StockEntryServiceInstance.createEntryStock(newProductEntry);

        switch (responseStockEntry.codeStatus) {
          case 400:
            res.status(400).json(responseStockEntry);
            break;
          case 200:
            res.status(200).json(responseStockEntry);
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
  //Atualizar uma entrada de um produto na entrada e no estoque atual
  router.put("/update-stock-entry/:idStockEntry", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idStockEntry = parseInt(req.params.idStockEntry);
        const upEntryItem = req.body;
        const responseProductEntry =
          await StockEntryServiceInstance.updateProductEntryStock(
            idStockEntry,
            upEntryItem
          );

        switch (responseProductEntry.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: responseProductEntry.codeStatus,
              successStatus: responseProductEntry.successStatus,
              codeStatus: responseProductEntry.codeStatus,
              message: responseProductEntry.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: responseProductEntry.codeStatus,
              successStatus: responseProductEntry.successStatus,
              codeStatus: responseProductEntry.codeStatus,
              message: responseProductEntry.message,
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
  router.delete("/:idProduct", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idProduct = parseInt(req.params.idProduct);
        const responseProductEntry =
          await StockEntryServiceInstance.deleteProductEntryStock(idProduct);
        switch (responseProductEntry.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              codeStatus: responseProductEntry.codeStatus,
              message: responseProductEntry.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              message: responseProductEntry.message,
              productEntry: responseProductEntry.product,
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
