import { Router } from "express";
import ProductService from "../controllers/ProductService.mjs";
import StockService from "../controllers/StockService.mjs";
import TokenServices from "../services/TokenServices.mjs";
const TokensServicesInstance = new TokenServices();
const router = Router();

const ProductServiceInstance = new ProductService();

const StockServiceInstance = new StockService();

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (app) => {
  app.use("/api/stock", router);

  //GET todos os itens no estoque
  router.get("/", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const responseProductStock =
          await StockServiceInstance.getAllProductStock();

        switch (responseProductStock.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              codeStatus: responseProductStock.codeStatus,
              message: responseProductStock.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              message: responseProductStock.message,
              productStock: responseProductStock.productStock,
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
  //Buscar um item no estoque
  router.get("/:idProduct", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idProduct = parseInt(req.params.idProduct);
        const getIdProduct = await ProductServiceInstance.getIdProduct(
          idProduct
        );
        if (getIdProduct.codeStatus === 404) {
          res.status(404).json({
            errorStatus: true,
            successStatus: false,
            message: getIdProduct.message,
            productStock: getIdProduct.productStock,
          });
        } else {
          const responseProductStock =
            await StockServiceInstance.getProductIdStock(
              getIdProduct.product
            );

          switch (responseProductStock.codeStatus) {
            case 404:
              res.status(404).json({
                errorStatus: responseProductStock.errorStatus,
                successStatus: responseProductStock.successStatus,
                codeStatus: responseProductStock.codeStatus,
                message: responseProductStock.message,
              });
              break;
            case 200:
              res.status(200).json({
                errorStatus: responseProductStock.errorStatus,
                successStatus: responseProductStock.successStatus,
                codeStatus: responseProductStock.codeStatus,
                message: responseProductStock.message,
                productStock: responseProductStock.productStock,
              });
              break;

            default:
              break;
          }
        }
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });

  //Alterar Status de um item no estoque
  router.put("/:idProduct", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idProduct = parseInt(req.params.idProduct);
        const data = req.body;

        const responseProductStock =
          await StockServiceInstance.updateProductId(idProduct, data);
        switch (responseProductStock.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              codeStatus: responseProductStock.codeStatus,
              message: responseProductStock.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              message: responseProductStock.message,
              productStock: responseProductStock.productStock,
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
