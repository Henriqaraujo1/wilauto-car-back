import { Router } from "express";
import ResumeClientsService from "../controllers/ResumeClientsService.mjs";
import TokenServices from "../services/TokenServices.mjs";
const TokensServicesInstance = new TokenServices();
const router = Router();
const ResumeClientsServiceInstance = new ResumeClientsService();

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (app) => {
  app.use("/api/financial/resume-client", router);

  router.get("/:idClient", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        //Buscar informações de pedido desse cliente
        const idClient = req.params.idClient;

        const infoOrderClient =
          await ResumeClientsServiceInstance.getInfoOrdersByClient(idClient);
          
        switch (infoOrderClient.codeStatus) {
          case 400:
            res.status(400).json(infoOrderClient);
            break;

          case 200:
            res.status(200).json(infoOrderClient);
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

  router.get("/items-orders/:idOrder", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idOrder = parseInt(req.params.idOrder);
        const itemsByOrder = await ResumeClientsServiceInstance.getItemsByOrder(
          idOrder
        );

        switch (itemsByOrder.codeStatus) {
          case 404:
            res.status(404).json(itemsByOrder);
            break;
          case 200:
            res.status(200).json(itemsByOrder);
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
