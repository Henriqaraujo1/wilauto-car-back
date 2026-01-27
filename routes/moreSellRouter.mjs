import { Router } from "express";
import ProductMoreSellService from "../controllers/ProductMoreSellService.mjs";
import TokenServices from "../services/TokenServices.mjs";
const TokensServicesInstance = new TokenServices();
const router = Router();

const ProductMoreSellInstance = new ProductMoreSellService();

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (app) => {
  app.use("/api/more-sell", router);
  //Buscar todas as marcas
  router.post("/", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const infoDate = req.body.infoMonth;
        const responseProductMoreSell =
          await ProductMoreSellInstance.getAllProductMoreSell(infoDate);

        switch (responseProductMoreSell.codeStatus) {
          case 404:
            res.status(404).json({
              codeStatus: responseProductMoreSell.codeStatus,
              errorStatus: true,
              message: responseProductMoreSell.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              codeStatus: responseProductMoreSell.codeStatus,
              productMoreSell: responseProductMoreSell.productMoreSells,
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

  router.get("/info-product/", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const nameProductMoreSell = req.query.productMoreSell;
        const responseProductMoreSell =
          await ProductMoreSellInstance.getProductMoreSellById(
            nameProductMoreSell
          );
        switch (responseProductMoreSell.codeStatus) {
          case 404:
            res.status(404).json({
              codeStatus: responseProductMoreSell.codeStatus,
              errorStatus: true,
              message: responseProductMoreSell.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              codeStatus: responseProductMoreSell.codeStatus,
              successStatus: true,
              message: responseProductMoreSell.message,
              productMoreSell: responseProductMoreSell.productMoreSell,
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
