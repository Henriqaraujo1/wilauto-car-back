import connectDB from "../config/dbConfig.js";
import createHttpError from "http-errors";
import pgp from "pg-promise";

const pgPromise = pgp({ capSQL: true });
const client = await connectDB();

export default class UserModel {
  async getInfoUser(dataUser) {
    try {
      const statement = `SELECT * FROM users WHERE username = $1`;
      const infoUser = [dataUser];

      const response = await client.query(statement, infoUser);
      if (response.rowCount > 0) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async getUserPass(dataUser) {
    try {
      const statement = `SELECT * FROM users WHERE "idUser" = $1`;
      const infoUser = [dataUser];

      const response = await client.query(statement, infoUser);
      if (response.rowCount > 0) {
        return response.rows[0];
      } else {
        return false;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async getUsername(dataUser) {
    try {
      const username = dataUser;
      const statement = `SELECT email, "idUser", username FROM users WHERE username = $1`;
      const infoUser = [username];

      const response = await client.query(statement, infoUser);
      if (response.rowCount > 0) {
        return response.rows[0];
      } else {
        return false;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async getEmailUser(dataUser) {
    try {
      const email = [dataUser];
      const statement = `SELECT email, "idUser", "username" FROM users WHERE email = LOWER($1)`;
      const response = await client.query(statement, email);
      if (response.rowCount > 0) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async getAllUsers() {
    try {
      const statement = `SELECT "idUser","firstName", username, email, "lastName", "phoneNumber" FROM users ORDER BY "idUser" ASC`;
      const response = await client.query(statement);
      if (response.rowCount > 0) {
        return response.rows;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }

  async getAllPermissions() {
    try {
      const statement = 'SELECT * FROM "permissions" ORDER BY "idPermission"';

      const response = await client.query(statement);

      if (response.rowCount > 0) {
        return response.rows;
      } else {
        return false;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }

  async getInfoPermission(idUser) {
    try {
      const statement = `SELECT "userPermissions".*, permissions.* FROM "userPermissions" JOIN permissions ON "userPermissions"."idPermission" = permissions."idPermission" WHERE "userPermissions"."idUser" = ${idUser} ORDER BY "userPermissions" ASC`;
      const response = await client.query(statement);
      if (response.rowCount > 0) {
        return response.rows;
      } else {
        return false;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }

  async getUserById(idUser) {
    try {
      const statement = `SELECT "idUser","firstName",
      username,
      email,
      "phoneNumber",
      "lastName" FROM users WHERE "idUser" = ${idUser}`;
      const response = await client.query(statement);
      if (response.rowCount > 0) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }

  async createUser(dataUser) {
    try {
      const value = dataUser;
      const statement =
        pgPromise.helpers.insert(
          value,
          [
            "firstName",
            "username",
            "email",
            "phoneNumber",
            "password",
            "cpassword",
            "lastName",
            "dateCreated",
          ],
          "users"
        ) + `RETURNING "idUser"`;
      const response = await client.query(statement);
      if (response.rowCount > 0) {
        return response.rows[0];
      } else {
        return false;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }

  async createUserPermissions(dataPermissions) {
    try {
      const value = dataPermissions;
      const statement = pgPromise.helpers.insert(
        value,
        ["idUser", "idPermission", "dataCreated"],
        "userPermissions"
      );
      const response = await client.query(statement);
      return response.rowCount > 0;
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }

  async updatePermissions(idUser, infoPermissions) {
    try {
      const permissions = infoPermissions;
      const condition = pgPromise.as.format(` WHERE "idUser" = ${idUser}`);
      const statement =
        pgPromise.helpers.update(permissions, null, "userPermissions") +
        condition;
      const response = await client.query(statement);
      return response.rowCount > 0;
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }

  async updateUserInfo(idUser, dataUser) {
    try {
      const condition = pgPromise.as.format(` WHERE "idUser" = ${idUser}`);
      const statement =
        pgPromise.helpers.update(dataUser, null, "users") + condition;
      const response = await client.query(statement);
      return response.rowCount > 0;
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async updatePassword(idUser, password) {
    try {
      const condition = pgPromise.as.format(` WHERE "idUser" = ${idUser}`);
      const newPassword = password;
      const statement =
        pgPromise.helpers.update(
          newPassword,
          ["password", "cpassword", "dateUpdate"],
          "users"
        ) + condition;
      const response = await client.query(statement);
      return response.rowCount > 0;
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async deleteUser(idUser) {
    try {
      const statement = `DELETE FROM users WHERE "idUser"= ${idUser}`;
      const response = await client.query(statement);
      return response.rowCount > 0;
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }

  async deleteUserPermission(idUserPermission) {
    try {
      const placeholders = idUserPermission
        .map((_, index) => `$${index + 1}`)
        .join(",");

      const statement = `DELETE FROM "userPermissions" WHERE "idUserPermission" IN (${placeholders})`;

      const response = await client.query(statement, idUserPermission);

      return response.rowCount > 0;
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
}
