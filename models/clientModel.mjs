import connectDB from "../config/dbConfig.js";
import createHttpError from "http-errors";
import pgp from "pg-promise";

const pgPromise = pgp({ capSQL: true });
const client = await connectDB();

export default class ClientModel {
  async getClientByDoc(docClient) {
    try {
      const clientInfo = [docClient];
      const statement = `SELECT * FROM client WHERE "docClient" = ($1)`;
      const response = await client.query(statement, clientInfo);
      if (response.rowCount > 0) {
        return response.rows[0];
      } else {
        return false;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async getClientId(idClient) {
    try {
      const clientId = [idClient];
      const statement = `SELECT * FROM client WHERE "idClient" = ($1)`;
      const response = await client.query(statement, clientId);
      if (response.rowCount > 0) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async getAllClient() {
    try {
      const statement = `SELECT * FROM client ORDER BY "idClient" ASC`;
      const response = await client.query(statement);
      if (response.rowCount > 0) {
        return response.rows;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async createClient(dataClient) {
    try {
      const value = dataClient;
      const statement = pgPromise.helpers.insert(value, null, "client");
      const response = await client.query(statement);
      return response.rowCount > 0;
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async updateClient(idClient, data) {
    try {
      const condition = pgPromise.as.format(` WHERE "idClient" = ${idClient}`);

      const statement =
        pgPromise.helpers.update(data, null, "client") + condition;
      const response = await client.query(statement);

      return response.rowCount > 0;
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async deleteClient(idClient) {
    try {
      const statement = `DELETE FROM client WHERE "idClient" = ${idClient}`;
      const response = await client.query(statement);
      return response.rowCount > 0;
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
}
