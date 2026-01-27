import { Router } from "express";
import OrderService from "../controllers/OrderService.mjs";
import TokenServices from "../services/TokenServices.mjs";
const TokensServicesInstance = new TokenServices();
const router = Router();

const OrderServiceInstance = new OrderService();

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (app, passport) => {
  app.use("/api/comercial", router);

  router.get("/", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const { id } = req.user;

        const response = await OrderServiceInstance.listOrders(id);
        if (!response) {
          res.status(404).json({
            erro: true,
            message: "Erro ao buscar os pedidos",
          });
        } else {
          res.status(200).json({
            erro: false,
            data: response,
          });
        }
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });
  router.get("/next-number", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const responseNextOrder = await OrderServiceInstance.getNextOrder();

        let lastOrder;
        if (responseNextOrder.codeStatus === 404) {
          lastOrder = 0;
        } else {
          lastOrder = parseInt(JSON.stringify(responseNextOrder.order));
        }
        switch (responseNextOrder.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              codeStatus: responseNextOrder.codeStatus,
              message: responseNextOrder.messageError,
              lastNumber: lastOrder,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              message: responseNextOrder.message,
              lastNumber: lastOrder,
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

  router.post("/checkout", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const orderInfo = req.body;

        const responseOrder = await OrderServiceInstance.createOrder(orderInfo);

        console.log(responseOrder)

        switch (responseOrder.codeStatus) {
          case 404:
            res.status(400).json(responseOrder);
            break;
          case 200:
            res.status(200).json(responseOrder);
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

  router.get("/orderid", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const { idOrder } = req.params.id;

        const response = await OrderServiceInstance.findOrderByClient(idOrder);

        if (!response) {
          res.status(404).json({
            erro: true,
            message: "Erro ao buscar esse pedido",
          });
        } else {
          res.status(200).json({
            erro: false,
            data: response,
          });
        }
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });
};
