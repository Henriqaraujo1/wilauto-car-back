import createHttpError from "http-errors";
import UserModel from "../models/userModel.mjs";
import EncripterUtil from "../utils/EncripterUtils.mjs";
import FormatDates from "../utils/FormatDates.mjs";

const FormatDatesUtils = new FormatDates();
const UserModelInstance = new UserModel();
const EncryptUtilInstance = new EncripterUtil();

export default class UserServices {
  //GET busca todos os usuarios
  async getAllUser() {
    try {
      const allUser = await UserModelInstance.getAllUsers();

      allUser.forEach(async (infoPermission) => {
        const namePermission = await UserModelInstance.getInfoPermission(
          infoPermission.idUser
        );

        if (namePermission) {
          infoPermission.permissions = namePermission;
        }
      });

      const allPermission = await UserModelInstance.getAllPermissions();

      if (!allUser) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi encontrado nenhum usuário",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Usuarios carregados com sucesso",
          users: allUser,
          allPermissions: allPermission,
        };
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }

  async getUserById(idUser) {
    try {
      const infoUser = await UserModelInstance.getUserById(idUser);

      if (infoUser === undefined) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Não foi possivel encontrar esse usuario",
        });
      } else {
        return {
          errorStatus: true,
          successStatus: false,
          codeStatus: 200,
          username: infoUser,
        };
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }

  //GET um usuario pelo username
  async getUsername(username) {
    try {
      const findUsername = await UserModelInstance.getUsername(username);

      if (!findUsername) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Usuario não encontrado",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Usuario encontrado com sucesso",
          user: findUsername,
        };
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }

  async getEmailUser(username) {
    try {
      const findEmailUser = await UserModelInstance.getEmailUser(username);

      if (!findEmailUser) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 404,
          message: "Usuario não encontrado",
        });
      } else {
        return {
          errorStatus: false,
          successStatus: true,
          codeStatus: 200,
          message: "Usuario encontrado com sucesso",
          user: findEmailUser,
        };
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }

  //POST cria um novo usuario
  async createUser(dataUser) {
    try {
      const newUser = dataUser;
      const encripter = await EncryptUtilInstance.encryptPassword(
        newUser.cpassword
      );
      const findUserId = await this.getUsername(newUser);

      if (findUserId.codeStatus === 200) {
        return createHttpError({
          errorStatus: true,
          successStatus: false,
          codeStatus: 409,
          message: "Usuario já cadastrado com esse conta ou email",
        });
      } else {
        newUser.password = encripter;
        newUser.cpassword = encripter;
        newUser.username = dataUser.username.toLowerCase();
        newUser.firstName = dataUser.firstName.toLowerCase();
        newUser.lastName = dataUser.lastName.toLowerCase();
        // ! - Organizar essa data
        newUser.dateCreated = FormatDatesUtils.getDateNoHour();
        const createUser = await UserModelInstance.createUser(newUser);

        // ! - Adiciona as permissões do usuario
        newUser.permissions.forEach(async (permissions) => {
          const userPermissions = {
            idUser: createUser.idUser,
            idPermission: permissions.value,
            dataCreated: FormatDatesUtils.getDateNoHour(),
          };

          await UserModelInstance.createUserPermissions(userPermissions);
        });

        if (createUser) {
          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            message: "Usuario cadastrado com sucesso",
            user: createUser,
          };
        }
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }

  //PUT atualiza um usuario
  async updateUser(idUser, data) {
    try {
      data.dateUpdate = FormatDatesUtils.getDateNoHour();

      if (data.hasOwnProperty("permissions")) {
        const getInfoPermissions = await UserModelInstance.getInfoPermission(
          idUser
        );
        
        if(!getInfoPermissions) {

        } else {

        }
        const newPermissionsToAdd = [];

        for (const [, newPermission] of Object.entries(data.permissions)) {
          const permissionExist = getInfoPermissions.find(
            (permission) => permission.idPermission === newPermission.value
          );

          if (!permissionExist) {
            const createPermission = {
              idUser,
              idPermission: newPermission.value,
              dataCreated: FormatDatesUtils.getDateNoHour(),
            };
            newPermissionsToAdd.push(createPermission);
          }
        }

        if (newPermissionsToAdd.length > 0) {
          UserModelInstance.createUserPermissions(newPermissionsToAdd);
        }
        const deleteOldPermissions = getInfoPermissions.filter(
          (permission) =>
            !data.permissions.some(
              (newPermission) => newPermission.value === permission.idPermission
            )
        );

        if (deleteOldPermissions) {
          const permissionToDelete = [];
          for (const [, oldPermission] of Object.entries(
            deleteOldPermissions
          )) {
            permissionToDelete.push(oldPermission.idUserPermission);
          }
          if (permissionToDelete.length > 0) {
            UserModelInstance.deleteUserPermission(permissionToDelete);
          }
        }

        delete data.permissions;

        const upUser = await UserModelInstance.updateUserInfo(idUser, data);
        if (!upUser) {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 404,
            message: "Usuario não encontrado",
          });
        } else {
          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            message: "Usuario atualizado com sucesso",
            user: upUser,
          };
        }
      } else {
        const upUser = await UserModelInstance.updateUserInfo(idUser, data);
        if (!upUser) {
          return createHttpError({
            errorStatus: true,
            successStatus: false,
            codeStatus: 404,
            message: "Usuario não encontrado",
          });
        } else {
          return {
            errorStatus: false,
            successStatus: true,
            codeStatus: 200,
            message: "Usuario atualizado com sucesso",
            user: upUser,
          };
        }
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }
  //PUT Atualiza senha
  async updateUserPassword(idUser, dataUser) {
    try {
      // ! - 1 - Verificar se o usuario existe
      const compareUser = await UserModelInstance.getUserPass(idUser);

      if (compareUser.idUser === idUser) {
        //Se o usuario existir, Comparar a senha
        const userDbPassword = compareUser.password;
        const oldPassword = dataUser.oldPassword;
        // ! Confirma se a senha antiga é a mesma da senha antiga enviada
        const match = await EncryptUtilInstance.comparePassword(
          oldPassword,
          userDbPassword
        );
        //  ! - Cria um ojbeto para configurar a nova senha
        const newPassword = {
          password: "",
          cpassword: "",
          dateUpdate: "",
        };
        // ! - Se match for true a senha é igual ao do DB, pode alterar a senha
        if (match) {
          // ! - Encriptar a senha
          const encripterPass = await EncryptUtilInstance.encryptPassword(
            dataUser.cpassword
          );
          newPassword.password = encripterPass;
          newPassword.cpassword = encripterPass;
        } else {
          return createHttpError({
            codeStatus: 409,
            message: "Senha atual incorreta",
          });
        }
        //  ! -  Envia o momento que foi atualizada
        newPassword.dateUpdate = FormatDatesUtils.getDateNoHour();
        const updatePW = await UserModelInstance.updatePassword(
          idUser,
          newPassword
        );
        /* No teste de validação, verificar como vem o retorno
         * se tiver como validar se é verdadeiro, manter essa estrutura
         * Se não criar uma validação melhor, pode ser com status.
         * 18/04/2023
         */
        //! Retorna a resposta do servidor
        if (!updatePW) {
          return createHttpError({
            codeStatus: 400,
            message: "Não foi possivel alterar a senha, Tente Novamente",
          });
        } else {
          return createHttpError({
            codeStatus: 200,
            message: "Nova senha alterada com sucesso",
          });
        }
      } else {
        return createHttpError({
          codeStatus: 404,
          message: "Usuario não encontrado",
        });
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }
  //Delete um usuario
  async deleteUser(idUser) {
    try {
      const downUser = await UserModelInstance.deleteUser(idUser);
      if (downUser.codeStatus === 500) {
        if (downUser.info.code === "23503") {
          return {
            errorStatus: true,
            successStatus: false,
            codeStatus: 423,
            message:
              "Esse usuario possui pedidos com seu nome e não pode ser apagado",
          };
        }
      }
      if (!downUser) {
        return createHttpError({
          codeStatus: 404,
          message: "Usuario não encontrado",
        });
      } else {
        return {
          codeStatus: 200,
          message: "Usuario apagado com sucesso",
          user: downUser,
        };
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }
}
