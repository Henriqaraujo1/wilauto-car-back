import connectDB from "../config/dbConfig.js";
import createHttpError from "http-errors";
import pgp from "pg-promise";

const pgPromise = pgp({ capSQL: true });
const client = await connectDB();

export default class RegisterModel {
  async newRegisterEntry(dataRegisterStock) {
    try {
      const value = dataRegisterStock;
      const statement = pgPromise.helpers.insert(
        value,
        [
          "dateEntry",
          "idStockEntry",
          "qtd",
          "priceUnit",
          "priceTotal",
          "codProd",
        ],
        "registerEntry"
      );
      const response = await client.query(statement);
      return response.rowCount > 0;
    } catch (err) {
      console.log(err)
      return createHttpError(500, err);
    }
  }
}
