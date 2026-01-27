import connectDB from "../config/dbConfig.js";
import createHttpError from "http-errors";
import pgp from "pg-promise";

const pgPromise = pgp({ capSQL: true });
const client = await connectDB();

export default class ProductMoreSellModel {
  async getProductMoreSellById(dataProductMoreSell) {
    try {
      const statement = `SELECT * FROM "itemsCart" WHERE "codProd" = $1`;
      const productMoreSellName = [dataProductMoreSell];
      const response = await client.query(statement, productMoreSellName);
      if (response.rowCount > 0) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }

  async getAllProductMoreSell(idOrders) {
    try {
      const statement = `SELECT * FROM "itemsCart" WHERE "idOrder" = ANY($1) ORDER BY "codProd" ASC`;
      const response = await client.query(statement, [idOrders]);

      if (response.rowCount > 0) {
        return response.rows;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, info: err });
    }
  }
}
