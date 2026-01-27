import { Router } from "express";
import ProviderService from "../controllers/ProviderService.mjs";
import TokenServices from "../services/TokenServices.mjs";
const TokensServicesInstance = new TokenServices();
const router = Router();
const ProviderServiceInstance = new ProviderService();

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (app, passport) => {
  app.use("/api/provider", router);

  //GET todos os fornecedores
  router.get("/", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const responseProvider =
          await ProviderServiceInstance.getAllProviders();
        switch (responseProvider.codeStatus) {
          case 404:
            res.status(404).json(responseProvider)
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              message: responseProvider.message,
              provider: responseProvider.provider,
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
  //GET id de um fornecedor
  router.get("/:cnpj", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idProvider = req.params.cnpj;
        const responseProvider = await ProviderServiceInstance.getProvider(
          idProvider
        );
        switch (responseProvider.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              codeStatus: responseProvider.codeStatus,
              message: responseProvider.message,
            });
            break;
          case 200:
            res.status(200).json(responseProvider);
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
  //POST um novo fornecedor
  router.post("/new-provider", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const provider = req.body;
        const responseProvider =
          await ProviderServiceInstance.createProvider(provider);
        switch (responseProvider.codeStatus) {
          case 409:
            res.status(409).json({
              errorStatus: true,
              codeStatus: responseProvider.codeStatus,
              message: responseProvider.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              message: responseProvider.message,
              provider: responseProvider.provider,
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
  //PUT atualiza um fornecedor
  router.put("/:idProvider", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idProvider = parseInt(req.params.idProvider);
        const data = req.body;
        const responseProvider =
          await ProviderServiceInstance.updateProvider(idProvider, data);
        switch (responseProvider.codeStatus) {
          case 409:
            res.status(409).json(responseProvider);
            break;
          case 404:
            res.status(404).json(responseProvider);
            break;
          case 200:
            res.status(200).json(responseProvider);
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
  //DELETE um fornecedor existente
  router.delete("/delete-provider/:idProvider", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idProvider = parseInt(req.params.idProvider);
        const responseProvider =
          await ProviderServiceInstance.deleteProvider(idProvider);
        switch (responseProvider.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              codeStatus: responseProvider.codeStatus,
              message: responseProvider.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              message: responseProvider.message,
              provider: responseProvider.provider,
            });
            break;

          default:
            res.status(responseProvider.codeStatus).json({
              errorStatus: responseProvider.errorStatus,
              successStatus: responseProvider.successStatus,
              codeStatus: responseProvider.codeStatus,
              message: responseProvider.message,
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
