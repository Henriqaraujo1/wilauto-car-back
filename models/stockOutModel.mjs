import connectDB from "../config/dbConfig.js";
import createHttpError from "http-errors";
import pgp from "pg-promise";

const pgPromise = pgp({ capSQL: true });
const client = await connectDB()

export default class StockOutModel {
  async getAllStockOut() {
    try {
      const statement = `SELECT * FROM "stockOut" ORDER BY "idStockOut" ASC`;
      const response = await client.query(statement);
      if (response.rowCount > 0) {
        return response.rows;
      } else {
        return false
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async getProductStockOut(idProduct) {
    try {
      const statement = `SELECT * FROM "stockOut" WHERE "idProduct" = ($1)`;
      const value = [idProduct];
      const response = await client.query(statement, value);
      if (response.rowCount > 0) {
        return response.rows;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async createItemStockOut(dataProductOut) {
    try {
      const value = dataProductOut;
      // ! - Por em quanto remove o valor de idStock
      const statement =
        pgPromise.helpers.insert(value, null, "stockOut") + "RETURNING *";
      const response = await client.query(statement);
      return response.rowCount > 0
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
  async updateItem(idStockOut, data) {
    try {
      /**
       * Criar uma tabela para saida de pedido por avarias e outros problemas
       * E uma tabela que retire por pedido de venda
       * acho qpode ficar mais organizado do que ta atualizado dois tipos
       * de informações em uma tabela só
       */
      const condition = pgPromise.as.format(
        ` WHERE "idStockOut" = ${idStockOut}`
      );
      const statement =
        pgPromise.helpers.update(data, null, "stockOut") + condition;
      const response = await client.query(statement);
      return response.rowCount > 0
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
}
