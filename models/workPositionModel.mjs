import connectDB from "../config/dbConfig.js";
import createHttpError from "http-errors";
import pgp from "pg-promise";

const pgPromise = pgp({ capSQL: true });
const client = await connectDB();

export default class WorkPositionModel {
  async getAllPosition() {
    try {
      const statement = `SELECT * FROM "workPosition" ORDER BY "idPosition" ASC`;
      const response = await client.query(statement);

      if (response.rowCount > 0) {
        return response.rows;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async getPositionById(idPosition) {
    try {
      const statement = `SELECT * FROM "workPosition" WHERE "idPosition" = $1`;
      const positionId = [idPosition];
      const response = await client.query(statement, positionId);
      if (response.rowCount > 0) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async getPositionByName(dataPosition) {
    try {
      const statement = `SELECT * FROM "workPosition" WHERE "namePosition" = $1`;
      const namePosition = [dataPosition];
      const response = await client.query(statement, namePosition);
      if (response.rowCount > 0) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async createPosition(dataPosition) {
    try {
      const value = dataPosition;
      const statement =
        pgPromise.helpers.insert(value, null, "workPosition") + "RETURNING *";
      const response = await client.query(statement);
      if (response.rowCount > 0) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async updatePosition(idPosition, dataPosition) {
    try {
      const positionId = idPosition;
      const condition = pgPromise.as.format(
        ` WHERE "idPosition" = ${positionId}`
      );

      const statement =
        pgPromise.helpers.update(dataPosition, null, "workPosition") +
        condition;
      const response = await client.query(statement);

      return response.rowCount > 0;
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async deletePosition(idPosition) {
    try {
      const statement = `DELETE FROM "workPosition" WHERE "idPosition" = ${idPosition}`;

      const response = await client.query(statement);

      return response.rowCount > 0;
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
}
