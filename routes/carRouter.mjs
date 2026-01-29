import { Router } from "express";
import CarService from "../controllers/CarService.mjs";
import TokenServices from "../services/TokenServices.mjs";

const TokensServicesInstance = new TokenServices();
const router = Router();
const CarServiceInstance = new CarService();

export default (app) => {
  app.use("/api/car", router);

  /** Busca a placa do car */
  router.get("/:carPlate", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const carPlate = req.params.carPlate;

        const responseCar = await CarServiceInstance.getCarPlate(carPlate);

        switch (responseCar.codeStatus) {
          case 404:
            res.status(404).json(responseCar);
            break;
          case 200:
            res.status(200).json(responseCar);
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

  /** Busca os carros pelo cliente */
  router.get("/info-client/:idClient", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idClient = parseInt(req.params.idClient);

        const responseCar = await CarServiceInstance.getCarByIdClient(idClient);

        switch (responseCar.codeStatus) {
          case 404:
            res.status(404).json(responseCar);
            break;
          case 200:
            res.status(200).json(responseCar);
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

  // /** Buscar os checklist do carro*/
  router.get("checklist/:idCar", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idCar = parseInt(req.params.idCar);

        const responseCar = await CarServiceInstance.getCheckListCar(idCar);

        switch (responseCar.codeStatus) {
          case 404:
            res.status(404).json(responseCar);
            break;
          case 200:
            res.status(200).json(responseCar);
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

  // /** Cria novo car com associação do id do Produto pai */
  router.post("/new-car", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const newCar = req.body;
        const responseCar = await CarServiceInstance.createCar(newCar);

        switch (responseCar.codeStatus) {
          case 404:
            res.status(404).json(responseCar);
            break;
          case 200:
            res.status(200).json(responseCar);
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

  // /** Atualiza novo car com associação do id do Produto pai */
  router.put("/:idCar", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idCar = parseInt(req.params.idCar);
        const dataCar = req.body;

        const responseCar = await CarServiceInstance.updateCar(idCar, dataCar);

        switch (responseCar.codeStatus) {
          case 404:
            res.status(404).json(responseCar);
            break;
          case 200:
            res.status(200).json(responseCar);
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
