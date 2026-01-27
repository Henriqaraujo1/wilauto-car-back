import { Router } from "express";
import BrandController from "../controllers/BrandService.mjs";
import TokenServices from "../services/TokenServices.mjs";
const TokensServicesInstance = new TokenServices();
const router = Router();

const BrandControllerInstance = new BrandController();

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (app) => {
  app.use("/api/brand", router);
  //Buscar todas as marcas
  router.get("/", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const responseBrand = await BrandControllerInstance.getAllBrand();

        switch (responseBrand.codeStatus) {
          case 404:
            res.status(404).json({
              codeStatus: responseBrand.codeStatus,
              errorStatus: true,
              message: responseBrand.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              codeStatus: responseBrand.codeStatus,
              brand: responseBrand.brands,
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

  router.get("/info-brand/", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const nameBrand = req.query.brand;
        const responseBrand = await BrandControllerInstance.getNameBrand(
          nameBrand
        );
        switch (responseBrand.codeStatus) {
          case 404:
            res.status(404).json({
              codeStatus: responseBrand.codeStatus,
              errorStatus: true,
              message: responseBrand.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              codeStatus: responseBrand.codeStatus,
              successStatus: true,
              message: responseBrand.message,
              brand: responseBrand.brand,
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
  // Cadastrar nova marca
  router.post("/new-brand", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const dataBrand = req.body;
        const responseBrand = await BrandControllerInstance.createBrand(
          dataBrand
        );
        switch (responseBrand.codeStatus) {
          case 403:
            res.status(403).json({
              codeStatus: responseBrand.codeStatus,
              errorStatus: true,
              message: responseBrand.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              codeStatus: responseBrand.codeStatus,
              successStatus: true,
              message: responseBrand.message,
              brand: responseBrand.brand,
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
  // Atualizar uma marca
  router.put("/:idBrand", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idBrand = parseInt(req.params.idBrand);
        const dataBrand = req.body;
        const responseBrand = await BrandControllerInstance.updateBrand(
          idBrand,
          dataBrand
        );

        switch (responseBrand.codeStatus) {
          case 404:
            res.status(404).json({
              codeStatus: responseBrand.codeStatus,
              errorStatus: true,
              message: responseBrand.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              codeStatus: responseBrand.codeStatus,
              successStatus: true,
              message: responseBrand.message,
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
  //Deletar uma marca
  router.delete("/delete-brand/:idBrand", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idBrand = parseInt(req.params.idBrand);
        const responseBrand = await BrandControllerInstance.deleteBrand(
          idBrand
        );

        switch (responseBrand.codeStatus) {
          case 404:
            res.status(404).json({
              codeStatus: responseBrand.codeStatus,
              errorStatus: true,
              message: responseBrand.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              codeStatus: responseBrand.codeStatus,
              successStatus: true,
              message: responseBrand.message,
              brand: responseBrand.brand,
            });
            break;

          default:
            res.status(responseBrand.codeStatus).json({
              errorStatus: responseBrand.errorStatus,
              successStatus: responseBrand.successStatus,
              codeStatus: responseBrand.codeStatus,
              message: responseBrand.message,
            });
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
