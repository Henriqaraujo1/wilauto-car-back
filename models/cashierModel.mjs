import connectDB from "../config/dbConfig.js";
import createHttpError from "http-errors";
import pgp from "pg-promise";

const pgPromise = pgp({ capSQL: true });
const client = await connectDB()

export default class CashierModel {
  async getDayCashier() {
    try {
      const statement = `SELECT * FROM cashier ORDER BY "dateOpen" DESC`;
      const response = await client.query(statement);
      if (response.rowCount) {
        return response.rows;
      } else {
        return false
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async getCashierByUser(idUser) {
    try {
      const statement = `SELECT * FROM cashier WHERE id_user = ${idUser}`;
      const response = await client.query(statement);
      if (response.rows) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async getAllCashier() {
    try {
      const statement = `SELECT * FROM cashier ORDER BY "idCashier" ASC`;
      const response = await client.query(statement);
      if (response.rows) {
        return response.rows;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async createCashier(dataCashier) {
    try {
      const value = dataCashier;
      const statement =
        pgPromise.helpers.insert(
          value,
          ["dateOpen", "initialValueOpen", "status", "idUser"],
          "cashier"
        ) + "RETURNING *";
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
  async updateCashier(idCashier, dataCashier) {
    try {
      const condition = pgPromise.as.format(
        ` WHERE "idCashier" = ${idCashier}`
      );
      const statement =
        pgPromise.helpers.update(dataCashier, null, "cashier") + condition;
      const response = await client.query(statement);
      return response.rowCount > 0
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async deleteCashier(idCashier) {
    try {
      const statement = `DELETE FROM cashier id_cashier = ${idCashier} RETURNING *`;
      const response = await client.query(statement);
      if (response.rows) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
}
