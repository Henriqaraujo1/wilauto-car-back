import connectDB from "../config/dbConfig.js";
import createHttpError from "http-errors";
import pgp from "pg-promise";

const pgPromise = pgp({ capSQL: true });
const client = await connectDB()

export default class ProviderModel {
  async getProvider(cnpjProvider) {
    try {
      const statement = `SELECT * FROM providers WHERE cnpj = ($1)`;
      const cnpj = cnpjProvider;
      const response = await client.query(statement, [cnpj]);
      if (response.rowCount > 0) {
        return response.rows[0];
      } else {
        return false;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async getProviderById(idProvider) {
    try {
      const statement = `SELECT * FROM providers WHERE "idProvider" = ${idProvider}`;
      const response = await client.query(statement);
      if (response.rowCount > 0) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        info: err,
      });
    }
  }
  async getAllProvider() {
    try {
      const statement = `SELECT * FROM providers ORDER BY "idProvider" ASC`;
      const response = await client.query(statement);
      if (response.rowCount > 0) {
        return response.rows;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async createProvider(dataProvider) {
    try {
      const value = dataProvider;
      const statement = pgPromise.helpers.insert(value, null, "providers");
      const response = await client.query(statement);
      if (response.rows) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async updateProvider(idProvider, data) {
    try {
      const condition = pgPromise.as.format(
        ` WHERE "idProvider" = ${idProvider}`
      );
      const statement =
        pgPromise.helpers.update(data, null, "providers") + condition;
      const response = await client.query(statement);
      return response.rowCount > 0
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async deleteProvider(idProvider) {
    try {
      const statement = `DELETE FROM providers WHERE "idProvider" = ${idProvider}`;
      const response = await client.query(statement);
      return response.rowCount > 0
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
}
