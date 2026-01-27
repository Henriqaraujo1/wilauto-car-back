import connectDB from "../config/dbConfig.js";
import createHttpError from "http-errors";
import pgp from "pg-promise";

const pgPromise = pgp({ capSQL: true });
const client = await connectDB()

export default class BrandModel {
  async createBrand(dataBrand) {
    try {
      const value = dataBrand;
      const statement = pgPromise.helpers.insert(value, null, "brand") + "RETURNING *";
      const response = await client.query(statement);
      if(response.rowCount > 0) {
        return response.rows[0]
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }

  async getBrandInfo(dataBrand) {
    try {
      const statement = `SELECT * FROM brand WHERE "brandName" = $1`;
      const brandName = [dataBrand];
      const response = await client.query(statement, brandName);
      if (response.rowCount > 0) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }

  async getBrandById(dataBrand) {
    try {
      const statement = `SELECT * FROM brand WHERE "idBrand" = $1`;
      const brandName = [dataBrand];
      const response = await client.query(statement, brandName);
      if (response.rowCount > 0) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }

  async getAllBrand() {
    try {
      const statement = `SELECT * FROM brand ORDER BY "idBrand" ASC`;
      const response = await client.query(statement);

      if (response.rowCount > 0) {
        return response.rows;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }

  async updateBrand(dataBrand) {
    try {
      const idBrand = dataBrand.idBrand;
      const condition = pgPromise.as.format(` WHERE "idBrand" = ${idBrand}`);

      
      const statement =
        pgPromise.helpers.update(dataBrand, null, "brand") + condition;
      const response = await client.query(statement);

      return response.rowCount > 0;
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }

  async deleteBrand(idBrand) {
    try {
      const statement = `DELETE FROM brand WHERE "idBrand" = ${idBrand}`;

      const response = await client.query(statement);

      return response.rowCount > 0;
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
}
