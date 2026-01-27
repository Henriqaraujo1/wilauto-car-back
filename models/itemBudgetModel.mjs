import connectDB from "../config/dbConfig.js";
import createHttpError from "http-errors";
import pgp from "pg-promise";

const pgPromise = pgp({ capSQL: true });
const client = await connectDB();

export default class ItemBudgetModel {
  async createItemByBudget(dataItem) {
    try {
      const value = dataItem;
      const statement = pgPromise.helpers.insert(
        value,
        [
          "codProd",
          "qtd",
          "priceWithDiscount",
          "priceNoDiscount",
          "priceSell",
          "idBudget",
          "valueDiscount",
          "percentDiscount",
        ],
        "itemsBudget"
      );
      const response = await client.query(statement);
      return response.rowCount > 0;
    } catch (err) {
      return createHttpError(500, err);
    }
  }
  async findOneByUser(idUser) {
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
  async getByBudget(idBudget) {
    try {
      const statement = `SELECT * FROM "itemsBudget" WHERE "idBudget" = ${idBudget}`;
      const response = await client.query(statement);

      if (response.rowCount > 0) {
        return response.rows;
      }
    } catch (err) {
      return createHttpError(500, err);
    }
  }
  async deleteByItemBudget(idBudgetItem) {
    try {
      const statement = `DELETE FROM "itemsBudget" WHERE "idBudgetItem" = ${idBudgetItem}`;
      const response = await client.query(statement);

      if (response.rowCount > 0) {
        return response.rows;
      }
    } catch (err) {
      return createHttpError(500, err);
    }
  }
}
