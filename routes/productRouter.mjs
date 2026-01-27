import { Router } from "express";
import ProductService from "../controllers/ProductService.mjs";
import TokenServices from "../services/TokenServices.mjs";
const router = Router();
const TokensServicesInstance = new TokenServices();
const ProductServiceInstance = new ProductService();

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (app) => {
  app.use("/api/product", router);

  router.get("/", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const responseProduct = await ProductServiceInstance.getAllProduct();

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

  router.get("/cod-product/", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const codProduct = req.query.codProd;

        const responseProduct = await ProductServiceInstance.getCodProduct(
          codProduct
        );

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

  router.get("/info-product/", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const nameProduct = req.query;

        const responseProduct = await ProductServiceInstance.getProductByName(
          nameProduct
        );

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

  router.get("/:idProduct", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idProduct = req.params.idProduct;
        const responseProduct = await ProductServiceInstance.getCodProduct(
          idProduct
        );

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

  router.post("/new-product", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const dataProduct = req.body;
        const responseProduct = await ProductServiceInstance.createProduct(
          dataProduct
        );

        switch (responseProduct.codeStatus) {
          case 409:
            res.status(409).json(responseProduct);
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

  router.put("/", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idProduct = req.body.idProduct;
        const data = req.body;

        const responseProduct = await ProductServiceInstance.updateProduct(
          idProduct,
          data
        );
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

  router.delete("/delete-product/:idProduct", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idProduct = parseInt(req.params.idProduct);
        const responseProduct = await ProductServiceInstance.deleteProduct(
          idProduct
        );
        switch (responseProduct.codeStatus) {
          case 404:
            res.status(404).json(responseProduct);
            break;
          case 200:
            res.status(200).json(responseProduct);
            break;

          default:
            res.status(responseProduct.codeStatus).json(responseProduct);
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
