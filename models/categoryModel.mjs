import connectDB from "../config/dbConfig.js";
import createHttpError from "http-errors";
import pgp from "pg-promise";

const pgPromise = pgp({ capSQL: true });
const client = await connectDB()

export default class CategoryProvider {
  async getNameCategory(infoCategory) {
    try {
      const statement = `SELECT * FROM category WHERE "categoryName" = ($1)`;
      const categoryName = [infoCategory];
      const response = await client.query(statement, categoryName);
      if (response.rowCount > 0) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async getInfoCategory(infoCategory) {
    try {
      const statement = `SELECT * FROM category WHERE "idCategory" = ($1)`;
      const idCategory = [infoCategory];
      const response = await client.query(statement, idCategory);
      if (response.rowCount > 0) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async getAllCategory() {
    try {
      const statement = `SELECT * FROM category ORDER BY "idCategory" ASC`;
      const response = await client.query(statement);
      if (response.rowCount > 0) {
        return response.rows;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }

  async createCategory(dataCategory) {
    try {
      const value = dataCategory;
      const statement = pgPromise.helpers.insert(value, null, "category");
      const response = await client.query(statement);
      return response.rowCount > 0
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }

  async updateCategory(idCategory, data) {
    try {
      const condition = pgPromise.as.format(
        ` WHERE "idCategory" = ${idCategory}`
      );
      const statement =
        pgPromise.helpers.update(data, null, "category") + condition;
      const response = await client.query(statement);
      return response.rowCount > 0
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }

  async deleteCategory(idCategory) {
    try {
      const statement = `DELETE FROM category WHERE "idCategory" = ${idCategory}`;
      const response = await client.query(statement);

      return response.rowCount > 0
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
}
