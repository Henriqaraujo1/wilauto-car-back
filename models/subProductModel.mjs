import connectDB from "../config/dbConfig.js";
import createHttpError from "http-errors";
import pgp from "pg-promise";

const pgPromise = pgp({ capSQL: true });
const client = await connectDB();

export default class ProductModel {
  async createSubProduct(dataProduct) {
    try {
      const value = dataProduct;
      const statement = pgPromise.helpers.insert(value, null, "subProduct");
      const response = await client.query(statement);
      if (response.rowCount > 0) {
        return true;
      }
    } catch (err) {
      createHttpError(500, err);
    }
  }
  async getCodProduct(productCod) {
    try {
      const statement = `SELECT * FROM "subProduct" WHERE "codProd" = ($1)`;
      const codProd = [productCod];
      const response = await client.query(statement, codProd);
      if (response.rowCount > 0) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async getSubProductById(idSubProduct) {
    try {
      const statement = `SELECT * FROM "subProduct" WHERE "idSubProduct" = ($1)`;
      const idProd = [idSubProduct];
      const response = await client.query(statement, idProd);
      if (response.rowCount > 0) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async getSubProductByIdProduct(idProduct) {
    try {
      const statement = `SELECT * FROM "subProduct" WHERE "idProduct" = ($1)`;
      const response = await client.query(statement, [idProduct]);
      if (response.rowCount > 0) {
        return response.rows;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async getProductByName(productName) {
    try {
      const statement = `SELECT * FROM "subProduct" WHERE "nameSubProduct" = $1`;
      const nameProd = [productName];
      const response = await client.query(statement, nameProd);
      if (response.rowCount > 0) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }

  async getAllProduct() {
    try {
      const statement = `SELECT * FROM product ORDER BY "idSubProduct" ASC`;
      const response = await client.query(statement);
      if (response.rowCount > 0) {
        return response.rows;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }

  async getNextCodProd() {
    try {
      const statement = `SELECT "codSubProd" FROM "subProduct" ORDER BY "codSubProd" DESC LIMIT 1`;
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
  async updateSubProduct(idProduct, dataProduct) {
    try {
      const condition = pgPromise.as.format(
        ` WHERE "idSubProduct" = ${idProduct}`
      );
      const statement =
        pgPromise.helpers.update(dataProduct, null, "subProduct") + condition;
      const response = await client.query(statement);
      return response.rowCount > 0;
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  // async deleteProduct(idProduct) {
  //   try {
  //     const statement = `DELETE FROM "subProduct" WHERE "idSubProduct" = ${idProduct}`;
  //     const response = await client.query(statement);
  //     return response.rowCount > 0;
  //   } catch (err) {
  //     return createHttpError({ codeStatus: 500, info: err });
  //   }
  // }
}
