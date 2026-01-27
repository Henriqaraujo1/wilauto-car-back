import { Router } from "express";
import WorkPositionService from "../controllers/WorkPositionService.mjs";
import TokenServices from "../services/TokenServices.mjs";

const WorkPositionInstance = new WorkPositionService();
const TokensServicesInstance = new TokenServices();
const router = Router();

export default (app) => {
  app.use("/api/work-position/", router);

  router.get("/", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);
      if (tokenToVerify.codeStatus === 200) {
        const responsePosition = await WorkPositionInstance.getAllPositions();
        switch (responsePosition.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              successStatus: false,
              codeStatus: responsePosition.codeStatus,
              message: responsePosition.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              codeStatus: responsePosition.codeStatus,
              message: responsePosition.message,
              positions: responsePosition.allPosition,
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
  router.get("/info-position", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);
      if (tokenToVerify.codeStatus === 200) {
        const namePosition = req.query.namePosition;
        const responsePosition = await WorkPositionInstance.getNamePosition(
          namePosition
        );

        switch (responsePosition.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              codeStatus: responsePosition.codeStatus,
              message: responsePosition.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: true,
              codeStatus: responsePosition.codeStatus,
              message: responsePosition.message,
              position: responsePosition.infoPosition,
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
  router.get("/:idPosition", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);
      if (tokenToVerify.codeStatus === 200) {
        const idPosition = parseInt(req.params.idPosition);
        const responsePosition = await WorkPositionInstance.getIdPosition(
          idPosition
        );

        switch (responsePosition.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              codeStatus: responsePosition.codeStatus,
              message: responsePosition.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: true,
              codeStatus: responsePosition.codeStatus,
              message: responsePosition.message,
              position: responsePosition.infoPosition,
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
  router.post("/new-position", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);
      if (tokenToVerify.codeStatus === 200) {
        const position = req.body;

        const responsePosition = await WorkPositionInstance.createPosition(
          position
        );

        switch (responsePosition.codeStatus) {
          case 409:
            res.status(409).json({
              errorStatus: true,
              successStatus: false,
              codeStatus: responsePosition.codeStatus,
              message: responsePosition.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              codeStatus: responsePosition.codeStatus,
              message: responsePosition.message,
            });
            break;

          default:
            res.status(500).json({
              responsePosition,
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
  router.put("/:idPosition", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);
      if (tokenToVerify.codeStatus === 200) {
        const idPosition = parseInt(req.params.idPosition);
        const data = req.body;
        const responsePosition = await WorkPositionInstance.updatePosition(
          idPosition,
          data
        );

        switch (responsePosition.codeStatus) {
          case 409:
            res.status(409).json(responsePosition);
            break;
          case 404:
            res.status(404).json(responsePosition);
            break;
          case 200:
            res.status(200).json(responsePosition);
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
  router.delete("/:idPosition", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);
      if (tokenToVerify.codeStatus === 200) {
        const idPosition = parseInt(req.params.idPosition);
        const responsePosition = await WorkPositionInstance.deletePosition(
          idPosition
        );
        switch (responsePosition.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              codeStatus: responsePosition.codeStatus,
              message: responsePosition.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: true,
              codeStatus: responsePosition.codeStatus,
              message: responsePosition.message,
              position: responsePosition.position,
            });
            break;

          default:
            res.status(responsePosition.codeStatus).json({
              errorStatus: responsePosition.errorStatus,
              successStatus: responsePosition.successStatus,
              codeStatus: responsePosition.codeStatus,
              message: responsePosition.message,
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
