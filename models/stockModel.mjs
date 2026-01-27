import connectDB from "../config/dbConfig.js";
import createHttpError from "http-errors";
import pgp from "pg-promise";

const pgPromise = pgp({ capSQL: true });
const client = await connectDB()

export default class StockModel {
  async getAllStock() {
    try {
      const statement = `SELECT * FROM stock ORDER BY "idStock" DESC`;
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

  async getIdStock(idStock) {
    try {
      const statement = `SELECT * FROM stock WHERE "idStock" = ($1)`;
      const value = [idStock];
      const response = await client.query(statement, value);
      if (response.rowCount > 0) {
        return response.rows;
      } else {
        return false;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }

  async getStockCodProd(codProd) {
    try {
      const statement = `SELECT * FROM stock WHERE "codProd" = ($1) ORDER BY "idStock" ASC`;
      const value = [codProd];
      const response = await client.query(statement, value);
      if (response.rowCount > 0) {
        return response.rows;
      } else {
        return false;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  // async getStockProductIdByBatch(idProduct, productBatch) {
  //   try {
  //     const statement = `SELECT * FROM stock WHERE "idProduct" = ($1) AND "productBatch" = ($2) ORDER BY "productBatch" ASC`;
  //     const value = [idProduct, productBatch];
  //     const response = await client.query(statement, value);
  //     if (response.rowCount > 0) {
  //       return response.rows;
  //     } else {
  //       return false;
  //     }
  //   } catch (err) {
  //     return createHttpError({ codeStatus: 500, info: err });
  //   }
  // }

  async createProductStock(dataProduct) {
    try {
      const value = dataProduct;
      const statement =
        pgPromise.helpers.insert(value, null, "stock") + `RETURNING "idStock"`;
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

  async updateProduct(dataProduct) {
    try {
      const idStock = dataProduct.idStock;
      const condition = pgPromise.as.format(` WHERE "idStock" = ${idStock}`);
      const statement =
        pgPromise.helpers.update(dataProduct, ["qtd", "priceTotal"], "stock") +
        condition;
      const response = await client.query(statement);
      return response.rowCount > 0
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async updateProductByOrder(dataProduct) {
    try {
      const idProduct = dataProduct.idProduct;
      const condition = pgPromise.as.format(
        ` WHERE "idProduct" = ${idProduct}`
      );
      const statement =
        pgPromise.helpers.update(dataProduct, ["qtd", "priceTotal"], "stock") +
        condition;
      const response = await client.query(statement);
      return response.rowCount > 0
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  /*Testar se realmente precisa atualizar somente o status, pq
   * podemos atualizar todos os campos na função acima
   */
  // async updateStatus(idProduct, data) {
  //   try {
  //     const condition = pgPromise.as.format("WHERE id_product = {id} RETURNING *", {
  //       id: idProduct,
  //     });
  //     const statement = pgPromise.helpers.update(data, null, "stock") + condition;
  //     const response = await client.client.query(statement);
  //     if (response.rows) {
  //       return response.rows[0];
  //     }
  //   } catch (err) {
  //     return createHttpError({ codeStatus: 500, info: err });
  //   }
  // }

  async deleteProductQtdZero(idStock) {
    try {
      const statement = `DELETE FROM stock WHERE "idStock" = ${idStock}`;
      const response = await client.query(statement);
      return response.rowCount > 0
    } catch (err) {
      return createHttpError({
        codeStatus: 500,
        message: "Contate o administrador",
        info: err,
      });
    }
  }
}
