import { Router } from "express";
import StockOutService from "../controllers/StockOutService.mjs";
import TokenServices from "../services/TokenServices.mjs";
const TokensServicesInstance = new TokenServices();
const router = Router();

const StockOutServiceInstance = new StockOutService();

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (app) => {
  app.use("/api/stock-out", router);

  //Buscar todas as saidas
  router.get("/", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const infoDate = req.query.infoDate;

        const responseProductOut =
          await StockOutServiceInstance.getStockOutByMonth(infoDate);

        switch (responseProductOut.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: responseProductOut.errorStatus,
              successStatus: responseProductOut.successStatus,
              codeStatus: responseProductOut.codeStatus,
              message: responseProductOut.message,
            });
            break;
          case 200:
            res.status(200).json(responseProductOut);
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
  //Buscar uma saida pelo ID
  router.get("/:idProduct", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idProduct = parseInt(req.params.idProduct);
        const responseProductOut =
          await StockOutServiceInstance.getProductOutId(idProduct);
        switch (responseProductOut.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              codeStatus: responseProductOut.codeStatus,
              message: responseProductOut.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              message: responseProductOut.message,
              productOut: responseProductOut.productOut,
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

  /*Necessario inserir as info no banco 
  de saida para ter historico de saida por avaria*/
  router.post("/new-stock-out", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        // Criar o construtor com as infor
        const data = req.body;
        const dataOutProduct =
          await StockOutServiceInstance.createOutProduct(data);

        switch (dataOutProduct.codeStatus) {
          case 400:
            res.status(400).json(dataOutProduct);
            break;
          case 200:
            res.status(200).json(dataOutProduct);
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

  //Atualizar uma saida de produto
  router.put("/:idStockOut", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idStockOut = parseInt(req.params.idStockOut);
        const outProduct = req.body;

        const responseProductOut =
          await StockOutServiceInstance.updateProductOut(
            idStockOut,
            outProduct
          );

        switch (responseProductOut.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              successStatus: false,
              codeStatus: responseProductOut.codeStatus,
              message: responseProductOut.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              codeStatus: responseProductOut.codeStatus,
              message: responseProductOut.message,
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
  //Apagar uma saida errada
  router.delete("/delete-product/:idProduct", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idProduct = parseInt(req.params.idProduct);
        const responseProductOut =
          await StockOutServiceInstance.deleteProductOut(idProduct);
        switch (responseProductOut.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              codeStatus: responseProductOut.codeStatus,
              message: responseProductOut.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              message: responseProductOut.message,
              productOut: responseProductOut.product,
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
