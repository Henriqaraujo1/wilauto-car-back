import { Router } from "express";
import AuthController from "../controllers/AuthService.mjs";
// import jwt from "jsonwebtoken";
import TokenServices from "../services/TokenServices.mjs";

const router = Router();

const AuthControllerInstance = new AuthController();
const TokensServicesInstance = new TokenServices();
/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (app, passport) => {
  app.use("/api/auth", router);

  router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return res.status(500).json({ error: "Erro interno do servidor" });
      }

      if (!user) {
        // 401 - Credenciais inválidas ou 404 - Usuário não encontrado
        // Contém informações sobre a falha de autenticação
        if (info.codeStatus === 401 || info.codeStatus === 404) {
          return res.status(info.codeStatus).json(info);
        }

        // Se chegou aqui, trata como um erro não especificado
        return res.status(500).json({ error: "Erro interno do servidor" });
      }

      // Autenticação bem-sucedida
      req.logIn(user, (errInfo) => {
        if (errInfo) {
          return res.status(500).json({ error: "Erro interno do servidor" });
        }

        // Redireciona ou envia uma resposta de sucesso
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  router.put("/user/:idUser", async (req, res, next) => {
    try {
      const { idUser } = req.params;
      const password = req.body;

      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      if (tokenToVerify.codeStatus === 200) {
        const response = await AuthControllerInstance.matchPasswordLogin(
          idUser,
          password
        );
        if (!response) {
          res.status(403).json({
            erro: true,
            message: "Senha já Utilizada",
          });
        } else {
          res
            .status(200)
            .json({ erro: false, message: "Nova senha cadastrada com sucesso" })
            .redirect("/login");
        }
      } else {
        res.status(tokenToVerify.codeStatus).json(tokenToVerify);
      }
    } catch (err) {
      next(err);
    }
  });

  // ! - Abordagem 2
  router.get("/check-user-status", (req, res, next) => {
    try {
      const token = req.headers.authorization;
      const tokenToVerify = TokensServicesInstance.verifyTokens(token);

      switch (tokenToVerify.codeStatus) {
        case 400:
          return res.status(400).json(tokenToVerify);

        case 401:
          return res.status(401).json(tokenToVerify);

        case 200:
          return res.status(200).json(tokenToVerify);

        default:
          break;
      }
    } catch (err) {
      next();
    }
  });

  router.post("/logout", (req, res, next) => {
    try {
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            res.status(500).json({
              errorStatus: true,
              successStatus: false,
              codeStatus: 500,
              message: "Erro durante o logout",
            });
          } else {
            res.status(200).json({
              errorStatus: false,
              successStatus: true,
              codeStatus: 200,
              message: "Logout Bem sucedido",
            });
          }
        });
      } else {
        res.end();
      }
    } catch (err) {
      next();
    }
  });
};
