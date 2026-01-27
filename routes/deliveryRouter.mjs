import { Router } from "express";
import DeliveryService from "../controllers/DeliveryService.mjs";
import TokenServices from "../services/TokenServices.mjs";
const TokensServicesInstance = new TokenServices();
const router = Router();

const DeliveryServiceInstance = new DeliveryService();

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (app) => {
  app.use("/api/delivery", router);

  router.get("/", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const responseAllDeveliry =
          await DeliveryServiceInstance.getAllDelivery();

        switch (responseAllDeveliry.codeStatus) {
          case 404:
            res.status(404).json(responseAllDeveliry);
            break;
          case 200:
            res.status(200).json(responseAllDeveliry);
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
  router.get("/info-delivery/", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const infoDelivery = req.query.deliveryName;

        console
        const responseNameDelivery =
          await DeliveryServiceInstance.getIdDelivery(infoDelivery);
        switch (responseNameDelivery.codeStatus) {
          case 404:
            res.status(404).json(responseNameDelivery);
            break;
          case 200:
            res.status(200).json(responseNameDelivery);
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
  router.post("/new-delivery", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const createDelivery = req.body;
        const newDelivery = await DeliveryServiceInstance.createDelivery(
          createDelivery
        );
        switch (newDelivery.codeStatus) {
          case 409:
            res.status(409).json(newDelivery);
            break;
          case 200:
            res.status(200).json(newDelivery);
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
  router.put("/:idDelivery", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idDelivery = parseInt(req.body.idDelivery);
        const dataDelivery = req.body;
        const updateDelivery = await DeliveryServiceInstance.updateDelivery(
          idDelivery,
          dataDelivery
        );
        switch (updateDelivery.codeStatus) {
          case 404:
            res.status(404).json(updateDelivery);
            break;
          case 200:
            res.status(200).json(updateDelivery);
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
  router.delete("/delete-delivery/:idDelivery", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idDelivery = parseInt(req.params.idDelivery);
        const responseDelivery =
          await DeliveryServiceInstance.deleteDelivery(idDelivery);
        switch (responseDelivery.codeStatus) {
          case 404:
            res.status(404).json(responseDelivery);
            break;
          case 200:
            res.status(200).json(responseDelivery);
            break;
          default:
            res.status(responseDelivery.codeStatus).json(responseDelivery);
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
