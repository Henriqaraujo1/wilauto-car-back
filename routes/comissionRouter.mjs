import { Router } from "express";
import ComissionService from "../controllers/ComissionService.mjs";
import TokenServices from "../services/TokenServices.mjs";

const router = Router();
const ComissionServiceInstance = new ComissionService();
const TokensServicesInstance = new TokenServices();

export default (app) => {
  app.use("/api/financial/comission", router);

  router.get("/resume-orders", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const orders = req.query.infoOrder;

        if (orders) {
          const responseOrders =
            await ComissionServiceInstance.getOrdersByEmployee(orders);

          switch (responseOrders.codeStatus) {
            case 404:
              res.status(404).json({
                errorStatus: true,
                successStatus: false,
                codeStatus: responseOrders.codeStatus,
                message: responseOrders.message,
              });
              break;
            case 200:
              res.status(200).json({
                errorStatus: false,
                successStatus: true,
                codeStatus: responseOrders.codeStatus,
                orders: responseOrders.ordersByEmployee,
                resumeSells: responseOrders.resumeSells,
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

  router.get("/info-month", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const infoDate = req.query.infoMonth;
        const responseComission =
          await ComissionServiceInstance.getComissionByMonth(infoDate);

        switch (responseComission.codeStatus) {
          case 404:
            res.status(404).json({
              codeStatus: responseComission.codeStatus,
              errorStatus: responseComission.errorStatus,
              successStatus: responseComission.successStatus,
              message: responseComission.message,
            });
            break;
          case 200:
            res.status(200).json({
              codeStatus: responseComission.codeStatus,
              errorStatus: responseComission.errorStatus,
              successStatus: responseComission.successStatus,
              message: responseComission.message,
              comissions: responseComission.comissions,
              resumeComission: responseComission.resumeComission,
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
  // router.get("/:idComission", async (req, res, next) => {
  //   try {
  //     const token = req.headers.authorization;
  //     const tokenToVerify = TokensServicesInstance.verifyTokens(token);

  //     if (tokenToVerify.codeStatus === 200) {

  //     } else {
  //       res.status(tokenToVerify.codeStatus).json(tokenToVerify);
  //     }
  //   } catch (err) {
  //     next(err);
  //   }
  // });

  // router.get("/:idEmployee", async (req, res, next) => {
  //   try {
  //     const token = req.headers.authorization;
  //     const tokenToVerify = TokensServicesInstance.verifyTokens(token);

  //     if (tokenToVerify.codeStatus === 200) {
  //       const responseComission =
  //         await ComissionServiceInstance.getOrdersByEmployee(infoDate);

  //       switch (responseComission.codeStatus) {
  //         case 404:
  //           res.status(404).json({
  //             codeStatus: responseComission.codeStatus,
  //             errorStatus: responseComission.errorStatus,
  //             successStatus: responseComission.successStatus,
  //             message: responseComission.message,
  //           });
  //           break;
  //         case 200:
  //           res.status(200).json({
  //             codeStatus: responseComission.codeStatus,
  //             errorStatus: responseComission.errorStatus,
  //             successStatus: responseComission.successStatus,
  //             message: responseComission.message,
  //             comissions: responseComission.comissions,
  //             resumeComission: responseComission.resumeComission,
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
  // router.post("/", async (req, res, next) => {
  //   try {
  //     const token = req.headers.authorization;
  //     const tokenToVerify = TokensServicesInstance.verifyTokens(token);

  //     if (tokenToVerify.codeStatus === 200) {
  //               const responseComission =
  //         await ComissionServiceInstance.getOrdersByEmployee(infoDate);

  //       switch (responseComission.codeStatus) {
  //         case 404:
  //           res.status(404).json({
  //             codeStatus: responseComission.codeStatus,
  //             errorStatus: responseComission.errorStatus,
  //             successStatus: responseComission.successStatus,
  //             message: responseComission.message,
  //           });
  //           break;
  //         case 200:
  //           res.status(200).json({
  //             codeStatus: responseComission.codeStatus,
  //             errorStatus: responseComission.errorStatus,
  //             successStatus: responseComission.successStatus,
  //             message: responseComission.message,
  //             comissions: responseComission.comissions,
  //             resumeComission: responseComission.resumeComission,
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
  router.put("/up-comission", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const infoComission = req.body;

        const responseComission =
          await ComissionServiceInstance.updateComission(infoComission);

        switch (responseComission.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              successStatus: false,
              codeStatus: responseComission.codeStatus,
              message: responseComission.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              codeStatus: responseComission.codeStatus,
              message: responseComission.message,
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
  router.delete("/", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });
};
