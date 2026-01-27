import { Router } from "express";
import SubProductService from "../controllers/SubProductService.mjs";
import TokenServices from "../services/TokenServices.mjs";

const TokensServicesInstance = new TokenServices();
const router = Router();
const SubProductServiceInstance = new SubProductService();

export default (app) => {
  app.use("/api/sub-product", router);

  /** Busca o nome do subproduct */
  router.get("/name-subproduct", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const nameProduct = req.query.nameSubProduct;

        const responseProduct =
          await SubProductServiceInstance.getSubProductByName(nameProduct);

        switch (responseProduct.codeStatus) {
          case 404:
            res.status(404).json(responseProduct);
            break;
          case 200:
            res.status(200).json(responseProduct);
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

  router.get("/list/:idProduct", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idProduct = req.params.idProduct;

        const responseProduct =
          await SubProductServiceInstance.getSubProductByIdProduct(idProduct);

        switch (responseProduct.codeStatus) {
          case 404:
            res.status(404).json(responseProduct);
            break;
          case 200:
            res.status(200).json(responseProduct);
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

  /** Busca Id do subproduct */
  router.get("/cod-subProduct/:codSubProduct", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const codSubProduct = req.params.codSubProduct;

        const responseProduct =
          await SubProductServiceInstance.getCodSubProduct(codSubProduct);

        switch (responseProduct.codeStatus) {
          case 404:
            res.status(404).json(responseProduct);
            break;
          case 200:
            res.status(200).json(responseProduct);
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

  /** Busca subproduct por id do Produto pai */
  router.get("/:idProduct", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idProduct = parseInt(req.params.idProduct);

        const responseProduct =
          await SubProductServiceInstance.getSubProductByIdProduct(idProduct);

        switch (responseProduct.codeStatus) {
          case 404:
            res.status(404).json(responseProduct);
            break;
          case 200:
            res.status(200).json(responseProduct);
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

  /** Cria novo subproduct com associação do id do Produto pai */
  router.post("/new-sub-product", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const newSubProduct = req.body;
        const responseProduct =
          await SubProductServiceInstance.createSubProduct(newSubProduct);

        switch (responseProduct.codeStatus) {
          case 404:
            res.status(404).json(responseProduct);
            break;
          case 200:
            res.status(200).json(responseProduct);
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

  /** Atualiza novo subproduct com associação do id do Produto pai */
  router.put("/:idSubProduct", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idSubProduct = parseInt(req.params.idSubProduct);
        const dataSubProduct = req.body;
        const responseProduct =
          await SubProductServiceInstance.updateSubProduct(
            idSubProduct,
            dataSubProduct
          );

        console.log(responseProduct);

        switch (responseProduct.codeStatus) {
          case 404:
            res.status(404).json(responseProduct);
            break;
          case 200:
            res.status(200).json(responseProduct);
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
