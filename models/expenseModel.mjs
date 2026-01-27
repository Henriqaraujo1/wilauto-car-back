import connectDB from "../config/dbConfig.js";
import createHttpError from "http-errors";
import pgp from "pg-promise";

const pgPromise = pgp({ capSQL: true });
const client = await connectDB();

export default class ExpenseModel {
  // Testar essa chamada
  async getTypeExpense(TypeExpense) {
    try {
      const value = TypeExpense;
      const statement = "SELECT * FROM expense WHERE type = $1";
      const response = await client.query(statement, value);
      if (response.rows) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, message: err });
    }
  }
  //Testar essa outra chamada
  async getExpenseByReceiver(NameReceiver) {
    try {
      const value = NameReceiver;
      const statement = "SELECT * FROM expense WHERE name_receiver = $1";
      const response = await client.query(statement, value);
      if (response.rows) {
        return response.rows[0];
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, message: err });
    }
  }
  async getAllExpense() {
    try {
      const statement = `SELECT * FROM expense ORDER BY "idExpense" ASC`;
      const response = await client.query(statement);
      if (response.rowCount > 0) {
        return response.rows;
      } else {
        return false;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, message: err });
    }
  }

  async getExpenseByProvider(idProvider) {
    try {
      const statement = `SELECT * FROM expense WHERE "idProvider" = $1`;
      const response = await client.query(statement, [idProvider]);
      if (response.rowCount > 0) {
        return response.rows;
      } else {
        return false;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, message: err });
    }
  }
  async getExpenseByStockEntry(idStockEntry) {
    try {
      const statement = `SELECT * FROM expense WHERE "idStockEntry" = $1 ORDER BY "idExpense" ASC`;
      const response = await client.query(statement, [idStockEntry]);
      if (response.rowCount > 0) {
        return response.rows;
      } else {
        return false;
      }
    } catch (err) {
      return createHttpError({ codeStatus: 500, message: err });
    }
  }

  async getExpenseByDueDate(dataExpense) {
    try {
      const statement = `SELECT * FROM expense WHERE "dueDate" = $1 AND value = $2 AND type = $3`;
      const dueDate = dataExpense.dueDate;
      const value = dataExpense.value;
      const type = dataExpense.type;
      const response = await client.query(statement, [dueDate, value, type]);

      return response.rowCount > 0;
    } catch (err) {
      return createHttpError(500, err);
    }
  }

  async createExpense(dataExpense) {
    try {
      const data = dataExpense;
      const statement = pgPromise.helpers.insert(
        data,
        [
          "description",
          "expenseType",
          "value",
          "dateCreated",
          "dueDate",
          "status",
          "formPayment",
          "destination",
          "datePayment",
          "idCategory",
          "idSubCategory",
          "idProvider",
          "idStockEntry",
        ],
        "expense"
      );
      const response = await client.query(statement);
      return response.rowCount > 0;
    } catch (err) {
      console.log(err)
      return createHttpError({ codeStatus: 500, err });
    }
  }
  async updateExpense(idExpense, data) {
    try {
      const condition = pgPromise.as.format(
        ` WHERE "idExpense" = ${idExpense}`
      );
      const statement =
        (await pgPromise.helpers.update(data, null, "expense")) + condition;
      const response = await client.query(statement);
      return response.rowCount > 0;
    } catch (err) {
      return createHttpError({ codeStatus: 500, message: err });
    }
  }
  async deleteExpense(idExpense) {
    try {
      const statement = `DELETE FROM expense WHERE "idExpense" = ${idExpense}`;
      const response = await client.query(statement);
      return response.rowCount > 0;
    } catch (err) {
      return createHttpError({ codeStatus: 500, message: err });
    }
  }
}
