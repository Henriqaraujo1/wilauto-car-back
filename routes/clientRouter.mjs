import { Router } from "express";
import ClientService from "../controllers/ClientService.mjs";
import TokenServices from "../services/TokenServices.mjs";
import axios from "axios";
const TokensServicesInstance = new TokenServices();
const router = Router();
const ClientServiceInstance = new ClientService();

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (app) => {
  app.use("/api/client", router);

  router.get("/", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const responseClient = await ClientServiceInstance.getAllClient();
        switch (responseClient.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              successStatus: false,
              codeStatus: responseClient.codeStatus,
              message: responseClient.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              codeStatus: responseClient.codeStatus,
              message: responseClient.message,
              client: responseClient.client,
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
  router.get("/:cpf", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const docClient = req.params.cpf;
        const responseClient = await ClientServiceInstance.getClientInfo(
          docClient
        );

        switch (responseClient.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              codeStatus: responseClient.codeStatus,
              message: responseClient.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: true,
              codeStatus: responseClient.codeStatus,
              message: responseClient.message,
              client: responseClient.client,
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
  router.post("/new-client", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const client = req.body;

        const responseClient = await ClientServiceInstance.createClient(client);

        switch (responseClient.codeStatus) {
          case 409:
            res.status(409).json({
              errorStatus: true,
              successStatus: false,
              codeStatus: responseClient.codeStatus,
              message: responseClient.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              codeStatus: responseClient.codeStatus,
              message: responseClient.message,
            });
            break;

          default:
            res.status(500).json({
              responseClient,
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
  router.put("/:idClient", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idClient = parseInt(req.params.idClient);
        const data = req.body;
        const responseClient = await ClientServiceInstance.updateClient(
          idClient,
          data
        );

        switch (responseClient.codeStatus) {
          case 409:
            res.status(409).json(responseClient);
            break;
          case 404:
            res.status(404).json(responseClient);
            break;
          case 200:
            res.status(200).json(responseClient);
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
  router.delete("/:idClient", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idClient = parseInt(req.params.idClient);
        const responseClient = await ClientServiceInstance.deleteClient(
          idClient
        );
        switch (responseClient.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              codeStatus: responseClient.codeStatus,
              message: responseClient.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: true,
              codeStatus: responseClient.codeStatus,
              message: responseClient.message,
              client: responseClient.client,
            });
            break;

          default:
            res.status(responseClient.codeStatus).json({
              errorStatus: responseClient.errorStatus,
              successStatus: responseClient.successStatus,
              codeStatus: responseClient.codeStatus,
              message: responseClient.message,
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
  router.get("/cep/:cep", async (req, res) => {
    const cep = req.params.cep.replace(/\D/g, "");

    if (!/^\d{8}$/.test(cep)) {
      return res.status(400).json({ error: "CEP inválido" });
    }

    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);

      if (response.data.erro) {
        return res.status(404).json({ error: "CEP não encontrado" });
      }

      res.status(200).json(response.data);
    } catch (error) {
      res.status(500).json({ error: "Erro ao consultar ViaCEP" });
    }
  });
};
