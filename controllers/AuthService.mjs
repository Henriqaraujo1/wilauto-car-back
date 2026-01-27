import createHttpError from "http-errors";
import UserModel from "../models/userModel.mjs";
import EncryptUtils from "../utils/EncripterUtils.mjs";
import TokenServices from "../services/TokenServices.mjs";
const UserModelsInstance = new UserModel();
const EncryptUtilsInstance = new EncryptUtils();
const TokensServicesInstance = new TokenServices();

export default class AuthService {
  async signup(data) {
    try {
      const { idUser } = data;
      const userExists = await UserModelsInstance.getIdUser(idUser);
      if (userExists) {
        return createHttpError(409, "Email já existe");
      } else {
        const encryptPassword = await EncryptUtilsInstance.encryptPassword(
          idUser.password
        );
        return await UserModelsInstance.createUser(idUser, encryptPassword);
      }
    } catch (err) {
      return createHttpError(500, err);
    }
  }

  async matchPasswordLogin(idUser, password) {
    try {
      const userPassword = await UserModelsInstance.getIdUser(idUser);

      if (userPassword.rowCount === 0) {
        return false;
      }

      const userDbPassword = userPassword.password;

      return await EncryptUtilsInstance.comparePassword(
        password,
        userDbPassword
      );
    } catch (err) {
      return createHttpError(500, err);
    }
  }

  async LoginUser(data) {
    try {
      const getUsernameLogin = await UserModelsInstance.getInfoUser(
        data.username
      );

      if (!getUsernameLogin) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não existe esse usuário",
        });
      } else {
        const getPath = await UserModelsInstance.getInfoPermission(
          getUsernameLogin.idUser
        );

        const listPermissions = [];

        for (const infoPermissions of getPath) {
          listPermissions.push(infoPermissions.idPermission);
        }

        getUsernameLogin.permissions = listPermissions;
        getUsernameLogin.path = getPath[0].path;

        if (!getUsernameLogin) {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            message: "Usuario não encontrado",
            codeStatus: 404,
          });
        }

        const passwordCompare = await EncryptUtilsInstance.comparePassword(
          data.password,
          getUsernameLogin.password
        );

        if (!passwordCompare) {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 401,
            message: "Usuario ou senha incorreta",
          });
        } else {
          const token = TokensServicesInstance.generateTokens(getUsernameLogin);

          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            message: "Bem vindo",
            path: getUsernameLogin.path,
            permissions: getUsernameLogin.permissions,
            welcomeMsg: getUsernameLogin.welcomeView,
            infoUser: {
              token: token,
              username: getUsernameLogin.username,
              firstName: getUsernameLogin.firstName,
              lastName: getUsernameLogin.lastName,
              idUser: getUsernameLogin.idUser,
              jobFunction: getUsernameLogin.jobFunction,
              email: getUsernameLogin.email,
              phoneNumber: getUsernameLogin.phoneNumber,
            },
          };
        }
      }
    } catch (err) {
      return createHttpError(500, err);
    }
  }
  //PUT update senha sem está logado
  async updatePassword(idUser, password) {
    try {
      const getUser = await UserModelsInstance.getIdUser(idUser);
      if (getUser) {
        return createHttpError(404, "E-mail não encontrado");
      } else {
        const newPassword = await EncryptUtilsInstance.encryptPassword(
          password
        );
        const updatePW = await UserModelsInstance.updatePassword(
          idUser,
          newPassword
        );
        return updatePW;
      }
    } catch (err) {
      return createHttpError(500, err);
    }
  }
}
