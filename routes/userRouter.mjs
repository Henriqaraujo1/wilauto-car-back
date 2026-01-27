import { Router } from "express";
import UserService from "../controllers/UserService.mjs";
import TokenServices from "../services/TokenServices.mjs";
const TokensServicesInstance = new TokenServices();
const router = Router();
const UserServiceInstance = new UserService();

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (app) => {
  app.use("/api/users", router);

  router.get("/", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);
      if (tokenToVerify.codeStatus === 200) {
        const responseUser = await UserServiceInstance.getAllUser();

        switch (responseUser.codeStatus) {
          case 404:
            res.status(404).json(responseUser);
            break;
          case 200:
            res.status(200).json(responseUser);
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
  router.get("/info-user/:idUser", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idUser = parseInt(req.params.idUser);
        const responseUser = await UserServiceInstance.getUserById(idUser);

        switch (responseUser.codeStatus) {
          case 404:
            res.status(404).json(responseUser);
            break;
          case 200:
            res.status(200).json(responseUser);
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

  router.get("/username", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const username = req.query.infoUser;

        const responseUser = await UserServiceInstance.getUsername(username);

        switch (responseUser.codeStatus) {
          case 404:
            res.status(404).json(responseUser);
            break;
          case 200:
            res.status(200).json(responseUser);
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
  router.get("/email/", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const email = req.query.infoUser;
        const responseUser = await UserServiceInstance.getEmailUser(email);

        switch (responseUser.codeStatus) {
          case 404:
            res.status(404).json(responseUser);
            break;
          case 200:
            res.status(200).json(responseUser);
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
  router.post("/new-user", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const user = req.body;
        const responseUser = await UserServiceInstance.createUser(user);

        switch (responseUser.codeStatus) {
          case 409:
            res.status(409).json(responseUser);
            break;
          case 200:
            res.status(200).json(responseUser);
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
  router.put("/update-user/:idUser", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idUser = parseInt(req.params.idUser);
        const data = req.body;

        const responseUser = await UserServiceInstance.updateUser(
          idUser,
          data
        );

        switch (responseUser.codeStatus) {
          case 400:
            res.status(400).json(responseUser);
            break;
          case 404:
            res.status(404).json(responseUser);
            break;
          case 409:
            res.status(409).json(responseUser);
            break;
          case 200:
            res.status(200).json(responseUser);
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
  //PUT updatePassWord
  router.put("/change-password/:idUser", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idUser = parseInt(req.params.idUser);
        const dataUser = req.body;
        const responseUser = await UserServiceInstance.updateUserPassword(
          idUser,
          dataUser
        );

        switch (responseUser.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              message: responseUser.message,
            });
            break;
          case 409:
            res.status(409).json({
              errorStatus: true,
              message: responseUser.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              message: responseUser.message,
            });
            break;
          default:
            res.status(400).json({
              errorStatus: true,
              successStatus: false,
              message: responseUser.message,
            });
        }
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });
  router.delete("/delete-user/:idUser", async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const idUser = parseInt(req.params.idUser);
        const responseUser = await UserServiceInstance.deleteUser(idUser);
        switch (responseUser.codeStatus) {
          case 404:
            res.status(404).json({
              errorStatus: true,
              codeStatus: responseUser.codeStatus,
              message: responseUser.message,
            });
            break;
          case 200:
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              message: responseUser.message,
              productOut: responseUser.product,
            });
            break;

          default:
            res.status(responseUser.codeStatus).json({
              errorStatus: responseUser.errorStatus,
              successStatus: responseUser.successStatus,
              codeStatus: responseUser.codeStatus,
              message: responseUser.message,
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
