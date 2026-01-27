import connectDB from "../db/dbConfig.js";
import createHttpError from "http-errors";
import pgp from "pg-promise";

const pgPromise = pgp({ capSQL: true });
const client = await connectDB()

export default class CartItemModel {
  async createCartItem(data) {
    try {
      const statement =
        pgPromise.helpers.insert(data, null, "cart_item") + "RETURNING *";
      const response = await client.query(statement);

      if (response.rows) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError(500, err);
    }
  }
  async updateCartItem(idCartItem, data) {
    try {
      const condition = pgPromise.as.format("WHERE id_cart_item = {id}", {
        id: idCartItem,
      });
      const statement =
        pgPromise.helpers.update(data, null, "cart_item") + condition;

      const response = await client.query(statement);
      if (response.rows) {
        return response.rows[0];
      }
    } catch (err) {}
  }
  async findCartItem(idCartItem) {
    try {
      const statement = `SELECT ci.qtd, ci.id_cart_item as "cartItemId",p.* FROM cart_item ci INNER JOIN products p ON p.id = ci.id_product WHERE id_cart = ${idCartItem}`;

      const response = await client.query(statement);
      if (response.rows) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError(500, err);
    }
  }
}
