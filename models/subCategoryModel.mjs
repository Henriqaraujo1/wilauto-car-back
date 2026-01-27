import connectDB from "../config/dbConfig.js";
import createHttpError from "http-errors";
import pgp from "pg-promise";

const pgPromise = pgp({ capSQL: true });
const client = await connectDB()

export default class SubCategoryModel {
  async getAllSubCategoryByIdCategory(infoCategory) {
    try {
      const statement = `SELECT * FROM "subCategory" WHERE "idCategory" = ($1) ORDER BY "idSubCategory" ASC`;
      const idCategory = [infoCategory];
      const response = await client.query(statement, idCategory);
      if (response.rowCount > 0) {
        return response.rows;
      } else {
        return false;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }

  async getSubCategoryByOrder(dataCategory) {
    try {
      const statement = `SELECT * FROM "subCategory" WHERE "idCategory" = ($1) AND "idSubCategory" = ($2) ORDER BY "idSubCategory" ASC`;
      const idSubCategory = [
        dataCategory.idCategory,
        dataCategory.idSubCategory,
      ];
      const response = await client.query(statement, idSubCategory);
      if (response.rowCount > 0) {
        return response.rows[0];
      } else {
        return false;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }

  async getNameSubCategory(subCategoryName) {
    try {
      const statement = `SELECT * FROM "subCategory" WHERE "subCategoryName" = ($1) ORDER BY "idSubCategory" ASC`;
      const nameSubCategory = [subCategoryName];
      const response = await client.query(statement, nameSubCategory);
      if (response.rowCount > 0) {
        return response.rows;
      } else {
        return false;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async getSubCategoryById(idSubCategory) {
    try {
      const statement = `SELECT * FROM "subCategory" WHERE "idSubCategory" = ($1) ORDER BY "idSubCategory" ASC`;
      const response = await client.query(statement, [idSubCategory]);
      if (response.rowCount > 0) {
        return response.rows;
      } else {
        return false;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }

  async getAllSubCategory() {
    try {
      const statement = `SELECT * FROM "subCategory" ORDER BY "idSubCategory" ASC`;
      const response = await client.query(statement);
      if (response.rowCount > 0) {
        return response.rows;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }

  async createSubCategory(dataSubCategory) {
    try {
      const value = dataSubCategory;
      const statement =
        pgPromise.helpers.insert(value, null, "subCategory") + "RETURNING *";
      const response = await client.query(statement);

      return response.rowCount > 0
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async updateSubCategory(idSubCategory, data) {
    try {
      const condition = pgPromise.as.format(
        ` WHERE "idSubCategory" = ${idSubCategory}`
      );
      const statement =
        pgPromise.helpers.update(data, null, "subCategory") + condition;
      const response = await client.query(statement);
      return response.rowCount > 0
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async deleteSubCategory(idSubCategory) {
    try {
      const statement = `DELETE FROM "subCategory" WHERE "idSubCategory" = ${idSubCategory}`;
      const response = await client.query(statement);

      return response.rowCount > 0
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
}
