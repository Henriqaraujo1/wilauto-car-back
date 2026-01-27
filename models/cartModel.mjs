import connectDB from "../config/dbConfig.js";
import createHttpError from "http-errors";
import pgp from "pg-promise";

const pgPromise = pgp({ capSQL: true });
const client = await connectDB();

export default class CartModel {
  async createCartItemByOrder(dataItemCart) {
    try {
      const value = dataItemCart;
      const statement = pgPromise.helpers.insert(
        value,
        [
          "codProd",
          "qtd",
          "priceWithDiscount",
          "priceNoDiscount",
          "percentDiscount",
          "priceSell",
          "idOrder",
          "valueDiscount",
        ],
        "itemsCart"
      );
      const response = await client.query(statement);
      return response.rowCount > 0;
    } catch (err) {
      return createHttpError(500, err);
    }
  }
  async findCartOneByUser(idUser) {
    try {
      const statement = `SELECT * FROM cart WHERE id_user = ${idUser}`;
      const response = await client.query(statement);

      if (response.rows) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError(500, err);
    }
  }
  async getCartByOrder(idOrder) {
    try {
      const statement = `SELECT * FROM "itemsCart" WHERE "idOrder" = ${idOrder}`;
      const response = await client.query(statement);

      if (response.rowCount > 0) {
        return response.rows;
      }
    } catch (err) {
      return createHttpError(500, err);
    }
  }
}
