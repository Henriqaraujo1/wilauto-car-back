import createHttpError from "http-errors";
import jwt from "jsonwebtoken";

export default class TokenServices {
  verifyTokens(authToken) {
    try {
      const tokenToVerify = authToken;

      if (!tokenToVerify) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 401,
          message: "Necessario fazer login",
        });
      }
      const token = tokenToVerify.replace("Bearer ", "");

      const user = jwt.verify(token, process.env.SESSION_SECRET);



      return {
        codeStatus: 200,
        message: "Usuario autenticado",
        user: user.username,
        idUser: user.idUser,
        permissions: user.permissions,
        path: user.path,
        welcomeMsg: user.welcomeMsg
      };
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return {
          errorStatus: true,
          successStatus: false,
          codeStatus: 401,
          message: "Necessário fazer um novo login",
        };
        // configurar para renovar token
      } else {
        return {
          errorStatus: true,
          successStatus: false,
          codeStatus: 400,
          message: "Necessário fazer um novo login",
        };
        // Configurar com falhas de verificação
      }
    }
  }

  generateTokens(infoUser) {
    const infoUserToToken = {
      username: infoUser.username,
      idUser: infoUser.idUser,
      permissions: infoUser.permissions,
      path: infoUser.path,
      welcomeMsg: infoUser.welcomeView
    };

    return jwt.sign(infoUserToToken, process.env.SESSION_SECRET, {
      expiresIn: "12h",
    });
  }
}
