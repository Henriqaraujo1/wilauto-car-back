import { Router, json } from "express";
import ReceiveService from "../controllers/ReceiveService.mjs";
import TokenServices from "../services/TokenServices.mjs";
const TokensServicesInstance = new TokenServices();
const router = Router();
const ReceiveServiceInstance = new ReceiveService();

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (app) => {
  app.use("/api/financial/receive", router);
  router.use(json());

  //Buscar e validar por pedido
  router.get("/:idOrder", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idOrder = req.params.idOrder;

        const responseReceiveByOrder =
          await ReceiveServiceInstance.getReceiveByOrder(idOrder);
        switch (responseReceiveByOrder.codeStatus) {
          case 400:
            res.status(400).json(responseReceiveByOrder);
            break;
          case 200:
            res.status(200).json(responseReceiveByOrder);
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

  router.put("/:idReceive", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idReceive = parseInt(req.params.idReceive);
        const data = req.body;

        const responseUpdateReceive =
          await ReceiveServiceInstance.updateReceive(idReceive, data);

        switch (responseUpdateReceive.codeStatus) {
          case 404:
            res.status(404).json(responseUpdateReceive);
            break;
          case 200:
            res.status(200).json(responseUpdateReceive);
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
  //Buscar e validar Todos os despesas
  // router.get("/", async (req, res, next) => {
  //   try {
  //     const token = req.headers.authorization;
  //     const tokenToVerify = TokensServicesInstance.verifyTokens(token);

  //     if (tokenToVerify.codeStatus === 200) {
  //       const responseGetAllReceive =
  //         await ReceiveServiceInstance.getAllReceive();

  //       switch (responseGetAllReceive.codeStatus) {
  //         case 400:
  //           res.status(400).json(responseGetAllReceive);
  //           break;
  //         case 200:
  //           res.status(200).json(responseGetAllReceive);
  //           break;

  //         default:
  //           break;
  //       }
  //     } else {
  //       res.status(tokenToVerify.codeStatus).json(tokenToVerify);
  //     }
  //   } catch (err) {
  //     next(err);
  //   }
  // });

  // Busca as depesas do mes que o usuario escolher
  // router.get("/info-month", async (req, res, next) => {
  //   try {
  //     const token = req.headers.authorization;
  //     const tokenToVerify = TokensServicesInstance.verifyTokens(token);

  //     if (tokenToVerify.codeStatus === 200) {
  //       const infoMonth = req.query.infoDate;

  //       const receivesByMonth = await ReceiveServiceInstance.getReceivesByMonth(
  //         infoMonth
  //       );

  //       switch (receivesByMonth.codeStatus) {
  //         case 404:
  //           res.status(404).json(receivesByMonth);
  //           break;
  //         case 200:
  //           res.status(200).json(receivesByMonth);
  //           break;

  //         default:
  //           break;
  //       }
  //     } else {
  //       res.status(tokenToVerify.codeStatus).json(tokenToVerify);
  //     }
  //   } catch (err) {
  //     next(err);
  //   }
  // });

  // //Buscar receiveos pelo tipo de receiveo
  // router.get("getType/:idReceive", async (req, res, next) => {
  //   try {
  //     const token = req.headers.authorization;
  //     const tokenToVerify = TokensServicesInstance.verifyTokens(token);

  //     if (tokenToVerify.codeStatus === 200) {
  //       const TypeReceive = req.body.TypeReceive;
  //       const responseGetTypeReceive =
  //         await ReceiveServiceInstance.getTypeReceive(TypeReceive);
  //       switch (responseGetTypeReceive.codeStatus) {
  //         case 404:
  //           res.status(404).json({
  //             errorStatus: true,
  //             codeStatus: responseGetTypeReceive.codeStatus,
  //             message: responseGetTypeReceive.message,
  //           });
  //           break;
  //         case 200:
  //           res.status(200).json({
  //             errorStatus: false,
  //             successStatus: true,
  //             message: responseGetTypeReceive.message,
  //             receive: responseGetTypeReceive.receive,
  //           });
  //           break;

  //         default:
  //           break;
  //       }
  //     } else {
  //       res.status(tokenToVerify.codeStatus).json(tokenToVerify);
  //     }
  //   } catch (err) {
  //     next(err);
  //   }
  // });
  // //Criar um novo receiveo
  // router.post("/new-receive", async (req, res, next) => {
  //   try {
  //     const token = req.headers.authorization;
  //     const tokenToVerify = TokensServicesInstance.verifyTokens(token);

  //     if (tokenToVerify.codeStatus === 200) {
  //       const dataReceive = req.body;
  //       const responsePostReceive = await ReceiveServiceInstance.createReceive(
  //         dataReceive
  //       );
  //       switch (responsePostReceive.codeStatus) {
  //         case 400:
  //           res.status(400).json(responsePostReceive);
  //           break;
  //         case 200:
  //           res.status(200).json(responsePostReceive);
  //           break;

  //         default:
  //           break;
  //       }
  //     } else {
  //       res.status(tokenToVerify.codeStatus).json(tokenToVerify);
  //     }
  //   } catch (err) {
  //     next(err);
  //   }
  // });
  // //Buscar e alterar um receive
  // router.put("/:idReceive", async (req, res, next) => {
  //   try {
  //     const token = req.headers.authorization;
  //     const tokenToVerify = TokensServicesInstance.verifyTokens(token);

  //     if (tokenToVerify.codeStatus === 200) {
  //       const idReceive = parseInt(req.params.idReceive);
  //       const data = req.body;

  //       const responseUpdateReceive =
  //         await ReceiveServiceInstance.updateReceive(idReceive, data);

  //       switch (responseUpdateReceive.codeStatus) {
  //         case 404:
  //           res.status(404).json(responseUpdateReceive);
  //           break;
  //         case 200:
  //           res.status(200).json(responseUpdateReceive);
  //           break;

  //         default:
  //           break;
  //       }
  //     } else {
  //       res.status(tokenToVerify.codeStatus).json(tokenToVerify);
  //     }
  //   } catch (err) {
  //     next(err);
  //   }
  // });

  // //Buscar e apagar um receiveo
  // router.delete("/:idReceive", async (req, res, next) => {
  //   try {
  //     const token = req.headers.authorization;
  //     const tokenToVerify = TokensServicesInstance.verifyTokens(token);

  //     if (tokenToVerify.codeStatus === 200) {
  //       const idReceive = parseInt(req.params.idReceive);
  //       const responseDeleteReceive =
  //         await ReceiveServiceInstance.deleteReceive(idReceive);

  //       switch (responseDeleteReceive.codeStatus) {
  //         case 400:
  //           res.status(400).json({
  //             errorStatus: true,
  //             codeStatus: responseDeleteReceive.codeStatus,
  //             message: responseDeleteReceive.message,
  //           });
  //           break;
  //         case 200:
  //           res.status(200).json({
  //             errorStatus: false,
  //             successStatus: true,
  //             message: responseDeleteReceive.message,
  //           });
  //           break;

  //         default:
  //           break;
  //       }
  //     } else {
  //       res.status(tokenToVerify.codeStatus).json(tokenToVerify);
  //     }
  //   } catch (err) {
  //     next(err);
  //   }
  // });
};
